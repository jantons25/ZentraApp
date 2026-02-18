import Salida from "../models/salidas.model.js";
import Reposicion from "../models/reposicion.model.js";
import Product from "../models/product.model.js";

export const crearReposiciones = async (reposicionesInput, userId) => {
  // 1. Normalizar entrada (puede venir una o varias reposiciones)
  const reposiciones = Array.isArray(reposicionesInput)
    ? reposicionesInput
    : [reposicionesInput];
  if (reposiciones.length === 0)
    throw new Error("No se proporcionaron reposiciones válidas.");

  // 2. Calcular número de lote lógico (secuencial)
  const ultimaReposicion = await Reposicion.findOne().sort({ createdAt: -1 });
  let nuevoLoteNumero = 1;
  if (ultimaReposicion?.id_lote) {
    const ultimoLote = parseInt(ultimaReposicion.id_lote, 10);
    if (!isNaN(ultimoLote)) nuevoLoteNumero = ultimoLote + 1;
  }
  const nuevoIdLote = String(nuevoLoteNumero).padStart(3, "0");

  const reposicionesGuardadas = [];

  // 3. Procesar cada reposición individualmente
  for (const reposicion of reposiciones) {
    console.log("Procesando reposición:", reposicion);
    const { cantidad, habitacion, responsable, observacion, producto } =
      reposicion;

    if (cantidad == null || isNaN(cantidad) || cantidad <= 0 || !producto) {
      throw new Error("Datos inválidos para la reposición.");
    }

    let cantidadRestante = Number(cantidad); // ← Conversión a número
    const lotes_repuestos = [];

    // 4. Buscar salidas disponibles (FIFO)
    const salidasDisponibles = await Salida.find({
      producto,
      cantidad_disponible: { $gt: 0 },
    }).sort({ fecha_vencimiento_min: 1, createdAt: 1 });

    // 4.1 Verificar stock total ANTES de modificar nada
    const totalDisponible = salidasDisponibles.reduce(
      (acc, salida) => acc + Number(salida.cantidad_disponible || 0), // ← Conversión
      0
    );

    if (totalDisponible < Number(cantidad)) {
      // ← Conversión
      throw new Error(
        "Stock insuficiente (en salidas) para realizar la reposición."
      );
    }

    // 5. Consumir salidas una a una hasta cubrir la cantidad
    for (const salida of salidasDisponibles) {
      if (cantidadRestante <= 0) break;

      const usar = Math.min(
        Number(salida.cantidad_disponible || 0), // ← Conversión
        cantidadRestante
      );

      salida.cantidad_disponible =
        Number(salida.cantidad_disponible || 0) - usar; // ← Conversión
      cantidadRestante -= usar;

      const primerLote = salida.lotes_usados?.[0] || {};

      lotes_repuestos.push({
        salida_id: salida._id,
        cantidad: usar,
        precio_compra: Number(primerLote.precio_compra ?? 0), // ← Conversión
        lote: primerLote.lote ?? "000",
        fecha_vencimiento: primerLote.fecha_vencimiento ?? null,
      });

      await salida.save();
    }

    // 6. Validar que hubo stock suficiente
    if (cantidadRestante > 0) {
      throw new Error(
        "Stock insuficiente (en salidas) para realizar la reposición."
      );
    }

    // 7. Crear y guardar la reposición
    const nuevaReposicion = new Reposicion({
      id_lote: nuevoIdLote,
      producto,
      cantidad: Number(cantidad), // ← Conversión
      habitacion,
      responsable,
      observacion,
      user: userId,
      lotes_repuestos,
    });

    const reposicionGuardada = await nuevaReposicion.save();
    reposicionesGuardadas.push(reposicionGuardada);

    // 8. Actualizar campo de control en producto
    const productoDB = await Product.findById(producto);
    if (productoDB) {
      productoDB.cantidad_repuesta = Math.max(
        0,
        Number(productoDB.cantidad_repuesta || 0) + Number(cantidad) // ← Conversión
      );
      await productoDB.save();
    }
  }

  // 9. Respuesta final
  return {
    message:
      reposiciones.length > 1
        ? "Reposiciones registradas exitosamente"
        : "Reposición registrada exitosamente",
    reposiciones: reposicionesGuardadas,
  };
};

export const actualizarLoteReposiciones = async (
  ids,
  nuevasReposiciones,
  userId
) => {
  if (!Array.isArray(ids) || !Array.isArray(nuevasReposiciones)) {
    throw new Error("Datos inválidos: se esperaban arrays.");
  }

  // 1) Traer reposiciones antiguas
  const reposAntiguas = await Reposicion.find({ _id: { $in: ids } });
  if (!reposAntiguas.length) {
    throw new Error("No se encontraron reposiciones para actualizar.");
  }

  // Tomamos el id_lote del grupo antiguo para mantener la línea de tiempo/lote lógico
  const id_lote = reposAntiguas[0]?.id_lote || String(Date.now());

  // 2) Revertir efectos de las repos antiguas
  for (const rep of reposAntiguas) {
    // Reponer a Salidas lo consumido por esta reposición
    if (Array.isArray(rep.lotes_repuestos)) {
      for (const lote of rep.lotes_repuestos) {
        if (!lote.salida_id) continue;

        const salida = await Salida.findById(lote.salida_id);
        if (!salida) continue;

        // Reponer con tope (no superar la cantidad original de la salida)
        const nuevaDisp =
          Number(salida.cantidad_disponible || 0) + Number(lote.cantidad || 0);
        salida.cantidad_disponible = Math.min(
          Number(salida.cantidad),
          nuevaDisp
        );

        await salida.save();
      }
    }

    // Ajustar el agregado en el producto
    const producto = await Product.findById(rep.producto);
    if (producto) {
      producto.cantidad_repuesta = Math.max(
        0,
        (producto.cantidad_repuesta || 0) - Number(rep.cantidad || 0)
      );
      await producto.save();
    }

    // Eliminar la reposición antigua
    await Reposicion.findByIdAndDelete(rep._id);
  }

  // 3) Crear nuevas reposiciones consumiendo FIFO desde Salidas
  const reposCreadas = [];

  for (const rep of nuevasReposiciones) {
    const { cantidad, habitacion, responsable, observacion, producto } = rep;

    if (cantidad == null || isNaN(cantidad) || cantidad <= 0 || !producto) {
      throw new Error("Datos inválidos para la nueva reposición.");
    }

    let cantidadRestante = Number(cantidad);
    const lotes_repuestos = [];

    // FIFO: por fecha de vencimiento mínima y createdAt
    const salidasDisponibles = await Salida.find({
      producto,
      cantidad_disponible: { $gt: 0 },
    }).sort({ fecha_vencimiento_min: 1, createdAt: 1 });

    for (const salida of salidasDisponibles) {
      if (cantidadRestante <= 0) break;

      const usar = Math.min(
        Number(salida.cantidad_disponible || 0),
        cantidadRestante
      );
      if (usar <= 0) continue;

      salida.cantidad_disponible -= usar;
      await salida.save();

      cantidadRestante -= usar;

      const primerLote = salida.lotes_usados?.[0];
      // Si no hay detalle de compra en la salida, ponemos trazas seguras
      const precio_compra = primerLote?.precio_compra ?? 0;
      const loteStr = primerLote?.lote ?? "000";
      const fv = primerLote?.fecha_vencimiento ?? null;

      lotes_repuestos.push({
        salida_id: salida._id,
        cantidad: usar,
        precio_compra,
        lote: loteStr,
        fecha_vencimiento: fv,
      });
    }

    if (cantidadRestante > 0) {
      throw new Error(
        "Stock insuficiente en salidas para registrar la nueva reposición."
      );
    }

    const nueva = new Reposicion({
      id_lote,
      producto,
      cantidad: Number(cantidad),
      habitacion: habitacion ?? "",
      responsable: responsable ?? "",
      observacion: observacion ?? "",
      user: userId,
      lotes_repuestos,
    });

    const guardada = await nueva.save();
    reposCreadas.push(guardada);

    // actualizar acumulado del producto
    const productoDB = await Product.findById(producto);
    if (productoDB) {
      productoDB.cantidad_repuesta = Math.max(
        0,
        (productoDB.cantidad_repuesta || 0) + Number(cantidad)
      );
      await productoDB.save();
    }
  }

  return {
    message: "Lote de reposiciones actualizado correctamente",
    reposiciones: reposCreadas,
  };
};

export const eliminarReposicionPorId = async (reposicionId) => {
  // 1) Buscar la reposición
  const reposicion = await Reposicion.findById(reposicionId);
  if (!reposicion) {
    throw new Error("Reposición no encontrada");
  }

  // 2) Reponer a Salidas lo consumido por esta reposición (con tope)
  if (Array.isArray(reposicion.lotes_repuestos)) {
    for (const lote of reposicion.lotes_repuestos) {
      if (!lote.salida_id) continue;

      const salida = await Salida.findById(lote.salida_id);
      if (!salida) continue;

      // Reponer con tope a la cantidad original de la salida
      const disponibleActual = Number(salida.cantidad_disponible || 0);
      const devolver = Number(lote.cantidad || 0);
      const capacidadMax = Number(salida.cantidad || 0);

      salida.cantidad_disponible = Math.min(
        capacidadMax,
        disponibleActual + devolver
      );
      await salida.save();
    }
  }

  // 3) Ajustar acumulado del producto
  const producto = await Product.findById(reposicion.producto);
  if (!producto) {
    throw new Error("Producto no encontrado");
  }

  producto.cantidad_repuesta = Math.max(
    0,
    Number(producto.cantidad_repuesta || 0) - Number(reposicion.cantidad || 0)
  );
  await producto.save();

  // 4) Eliminar la reposición
  await Reposicion.findByIdAndDelete(reposicionId);

  return { message: "Reposición eliminada correctamente" };
};

export const eliminarLoteReposicionesPorId = async (id_lote) => {
  // 1. Buscar todas las reposiciones del lote
  const reposiciones = await Reposicion.find({ id_lote });

  if (!reposiciones.length) {
    throw new Error("Lote no encontrado");
  }

  // 2. Revertir los efectos de cada reposición del lote
  for (const reposicion of reposiciones) {
    // Reponer a Salidas lo consumido en esta reposición
    if (Array.isArray(reposicion.lotes_repuestos)) {
      for (const lote of reposicion.lotes_repuestos) {
        if (!lote.salida_id) continue;

        const salida = await Salida.findById(lote.salida_id);
        if (salida) {
          const disponibleActual = Number(salida.cantidad_disponible || 0);
          const devolver = Number(lote.cantidad || 0);
          const capacidadMax = Number(salida.cantidad || 0);

          // Asegurar que no se sobrepase el stock original de la salida
          salida.cantidad_disponible = Math.min(
            capacidadMax,
            disponibleActual + devolver
          );

          await salida.save();
        }
      }
    }

    // Ajustar acumulado en el producto
    const producto = await Product.findById(reposicion.producto);
    if (producto) {
      producto.cantidad_repuesta = Math.max(
        0,
        (producto.cantidad_repuesta || 0) - Number(reposicion.cantidad || 0)
      );
      await producto.save();
    }

    // Eliminar la reposición
    await Reposicion.findByIdAndDelete(reposicion._id);
  }

  // Respuesta final
  return { message: "Lote de reposiciones eliminado correctamente" };
};
