import Cortesia from "../models/cortesia.model.js";
import Salida from "../models/salidas.model.js";
import Product from "../models/product.model.js";

export const crearCortesias = async (cortesiasInput, userId) => {
  // 1. Normalizar entrada (puede venir una o varias cortesías)
  const cortesias = Array.isArray(cortesiasInput)
    ? cortesiasInput
    : [cortesiasInput];

  if (cortesias.length === 0) {
    throw new Error("No se proporcionaron cortesías válidas.");
  }

  // 2. Calcular número de lote lógico (secuencial)
  const ultimaCortesia = await Cortesia.findOne().sort({ createdAt: -1 });
  let nuevoLoteNumero = 1;

  if (ultimaCortesia?.id_lote) {
    const ultimoLote = parseInt(ultimaCortesia.id_lote, 10);
    if (!isNaN(ultimoLote)) nuevoLoteNumero = ultimoLote + 1;
  }

  const nuevoIdLote = String(nuevoLoteNumero).padStart(3, "0");

  const cortesiasGuardadas = [];

  // 3. Procesar cada cortesía individualmente
  for (const cortesia of cortesias) {
    const { cantidad, responsable, observacion, producto } = cortesia;

    if (cantidad == null || isNaN(cantidad) || cantidad <= 0 || !producto) {
      throw new Error("Datos inválidos para la cortesía.");
    }

    let cantidadRestante = Number(cantidad);
    const lotes_cortesias = [];

    // 4. Buscar salidas disponibles (FIFO)
    const salidasDisponibles = await Salida.find({
      producto,
      cantidad_disponible: { $gt: 0 },
    }).sort({ fecha_vencimiento_min: 1, createdAt: 1 });

    // 4.1 Verificar stock total ANTES de modificar nada
    const totalDisponible = salidasDisponibles.reduce(
      (acc, salida) => acc + Number(salida.cantidad_disponible || 0),
      0
    );

    if (totalDisponible < cantidad) {
      // No tocamos nada, no restamos stock, solo devolvemos error
      throw new Error(
        "Stock insuficiente (en salidas) para registrar la cortesía."
      );
    }

    // 5. Consumir salidas una a una hasta cubrir la cantidad
    for (const salida of salidasDisponibles) {
      if (cantidadRestante <= 0) break;

      const usar = Math.min(
        Number(salida.cantidad_disponible || 0),
        cantidadRestante
      );
      if (usar <= 0) continue;

      salida.cantidad_disponible -= usar;
      cantidadRestante -= usar;

      const primerLote = salida.lotes_usados?.[0] || {};

      lotes_cortesias.push({
        salida_id: salida._id,
        cantidad: usar,
        precio_compra: primerLote.precio_compra ?? 0,
        lote: primerLote.lote ?? "000",
        fecha_vencimiento: primerLote.fecha_vencimiento ?? null,
      });

      await salida.save();
    }

    // 6. Validar que hubo stock suficiente
    if (cantidadRestante > 0) {
      throw new Error(
        "Stock insuficiente (en salidas) para registrar la cortesía."
      );
    }

    // 7. Crear y guardar la cortesía
    const nuevaCortesia = new Cortesia({
      id_lote: nuevoIdLote,
      producto,
      cantidad: Number(cantidad),
      responsable: responsable ?? "",
      observacion: observacion ?? "",
      user: userId,
      lotes_cortesias,
    });

    const cortesiaGuardada = await nuevaCortesia.save();
    cortesiasGuardadas.push(cortesiaGuardada);

    // 8. Actualizar campo de control en producto (opcional)
    //    Asumiendo que en Product tienes un campo cantidad_cortesia
    const productoDB = await Product.findById(producto);
    if (productoDB) {
      productoDB.cantidad_cortesia = Math.max(
        0,
        (productoDB.cantidad_cortesia || 0) + Number(cantidad)
      );
      await productoDB.save();
    }
  }

  // 9. Respuesta final
  return {
    message:
      cortesias.length > 1
        ? "Cortesías registradas exitosamente"
        : "Cortesía registrada exitosamente",
    cortesias: cortesiasGuardadas,
  };
};

export const actualizarLoteCortesias = async (ids, nuevasCortesias, userId) => {
  if (!Array.isArray(ids) || !Array.isArray(nuevasCortesias)) {
    throw new Error("Datos inválidos: se esperaban arrays.");
  }

  // 1) Traer cortesías antiguas
  const cortesiasAntiguas = await Cortesia.find({ _id: { $in: ids } });
  if (!cortesiasAntiguas.length) {
    throw new Error("No se encontraron cortesías para actualizar.");
  }

  // Tomamos el id_lote del grupo antiguo para mantener el lote lógico
  const id_lote = cortesiasAntiguas[0]?.id_lote || String(Date.now());

  // 2) Revertir efectos de las cortesías antiguas
  for (const cort of cortesiasAntiguas) {
    // Reponer a Salidas lo consumido por esta cortesía
    if (Array.isArray(cort.lotes_cortesias)) {
      for (const lote of cort.lotes_cortesias) {
        if (!lote.salida_id) continue;

        const salida = await Salida.findById(lote.salida_id);
        if (!salida) continue;

        const nuevaDisp =
          Number(salida.cantidad_disponible || 0) + Number(lote.cantidad || 0);

        // No superar la cantidad original de la salida
        salida.cantidad_disponible = Math.min(
          Number(salida.cantidad),
          nuevaDisp
        );

        await salida.save();
      }
    }

    // Ajustar el acumulado en el producto
    const producto = await Product.findById(cort.producto);
    if (producto) {
      producto.cantidad_cortesia = Math.max(
        0,
        (producto.cantidad_cortesia || 0) - Number(cort.cantidad || 0)
      );
      await producto.save();
    }

    // Eliminar la cortesía antigua
    await Cortesia.findByIdAndDelete(cort._id);
  }

  // 3) Crear nuevas cortesías consumiendo FIFO desde Salidas
  const cortesiasCreadas = [];

  for (const cort of nuevasCortesias) {
    const { cantidad, responsable, observacion, producto } = cort;

    if (cantidad == null || isNaN(cantidad) || cantidad <= 0 || !producto) {
      throw new Error("Datos inválidos para la nueva cortesía.");
    }

    let cantidadRestante = Number(cantidad);
    const lotes_cortesias = [];

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
      const precio_compra = primerLote?.precio_compra ?? 0;
      const loteStr = primerLote?.lote ?? "000";
      const fv = primerLote?.fecha_vencimiento ?? null;

      lotes_cortesias.push({
        salida_id: salida._id,
        cantidad: usar,
        precio_compra,
        lote: loteStr,
        fecha_vencimiento: fv,
      });
    }

    if (cantidadRestante > 0) {
      throw new Error(
        "Stock insuficiente en salidas para registrar la nueva cortesía."
      );
    }

    const nueva = new Cortesia({
      id_lote,
      producto,
      cantidad: Number(cantidad),
      responsable: responsable ?? "",
      observacion: observacion ?? "",
      user: userId,
      lotes_cortesias,
    });

    const guardada = await nueva.save();
    cortesiasCreadas.push(guardada);

    // Actualizar acumulado del producto
    const productoDB = await Product.findById(producto);
    if (productoDB) {
      productoDB.cantidad_cortesia = Math.max(
        0,
        (productoDB.cantidad_cortesia || 0) + Number(cantidad)
      );
      await productoDB.save();
    }
  }

  return {
    message: "Lote de cortesías actualizado correctamente",
    cortesias: cortesiasCreadas,
  };
};

export const eliminarCortesiaPorId = async (cortesiaId) => {
  // 1) Buscar la cortesía
  const cortesia = await Cortesia.findById(cortesiaId);
  if (!cortesia) {
    throw new Error("Cortesía no encontrada");
  }

  // 2) Reponer a Salidas lo consumido por esta cortesía (con tope)
  if (Array.isArray(cortesia.lotes_cortesias)) {
    for (const lote of cortesia.lotes_cortesias) {
      if (!lote.salida_id) continue;

      const salida = await Salida.findById(lote.salida_id);
      if (!salida) continue;

      const disponibleActual = Number(salida.cantidad_disponible || 0);
      const devolver = Number(lote.cantidad || 0);
      const capacidadMax = Number(salida.cantidad || 0);

      // No superar la cantidad original de la salida
      salida.cantidad_disponible = Math.min(
        capacidadMax,
        disponibleActual + devolver
      );

      await salida.save();
    }
  }

  // 3) Ajustar acumulado del producto
  const producto = await Product.findById(cortesia.producto);
  if (!producto) {
    throw new Error("Producto no encontrado");
  }

  producto.cantidad_cortesia = Math.max(
    0,
    Number(producto.cantidad_cortesia || 0) - Number(cortesia.cantidad || 0)
  );
  await producto.save();

  // 4) Eliminar la cortesía
  await Cortesia.findByIdAndDelete(cortesiaId);

  return { message: "Cortesía eliminada correctamente" };
};

export const eliminarLoteCortesiasPorId = async (id_lote) => {
  // 1. Buscar todas las cortesías del lote
  const cortesias = await Cortesia.find({ id_lote });

  if (!cortesias.length) {
    throw new Error("Lote de cortesías no encontrado");
  }

  // 2. Revertir los efectos de cada cortesía del lote
  for (const cortesia of cortesias) {
    // Reponer a Salidas lo consumido en esta cortesía
    if (Array.isArray(cortesia.lotes_cortesias)) {
      for (const lote of cortesia.lotes_cortesias) {
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
    const producto = await Product.findById(cortesia.producto);
    if (producto) {
      producto.cantidad_cortesia = Math.max(
        0,
        (producto.cantidad_cortesia || 0) - Number(cortesia.cantidad || 0)
      );
      await producto.save();
    }

    // Eliminar la cortesía
    await Cortesia.findByIdAndDelete(cortesia._id);
  }

  // Respuesta final
  return { message: "Lote de cortesías eliminado correctamente" };
};
