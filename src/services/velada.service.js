import Velada from "../models/velada.model.js";
import Salida from "../models/salidas.model.js";
import Product from "../models/product.model.js";

export const crearVelada = async (veladaInput, userId) => {
  //1. Normalizar entrada (puede venir una o varias cortesias)
  const veladas = Array.isArray(veladaInput) ? veladaInput : [veladaInput];

  if (veladas.length === 0)
    throw new Error("No se proporcionó información de velada");

  //2. Calcular número de lote lógico (id_lote) para esta velada
  const ultimaVelada = await Velada.findOne().sort({ createdAt: -1 });
  let nuevoLoteNumero = 1;

  if (ultimaVelada?.id_lote) {
    const ultimoLote = parseInt(ultimaVelada.id_lote, 10);
    if (!isNaN(ultimoLote)) {
      nuevoLoteNumero = ultimoLote + 1;
    }
  }

  const nuevoIdLote = String(nuevoLoteNumero).padStart(3, "0");
  const veladasGuardadas = [];

  //3. Procesar cada velada individualmente
  for (const veladaData of veladas) {
    const { cantidad, responsable, observacion, producto } = veladaData;

    if (cantidad == null || isNaN(cantidad) || cantidad <= 0 || !producto) {
      throw new Error(
        "Datos inválidos para velada: cantidad y producto son obligatorios y deben ser válidos"
      );
    }

    let cantidadRestante = Number(cantidad);
    const lotes_Veladas = [];

    //4. Buscar salidas disponibles para el producto (FIFO)
    const salidasDisponibles = await Salida.find({
      producto,
      cantidad_disponible: { $gt: 0 },
    }).sort({ fecha_vencimiento_min: 1, createdAt: 1 });

    //4.1 Verificar stock total ANTES de modificar nada
    const totalDisponible = salidasDisponibles.reduce(
      (acc, salida) => acc + Number(salida.cantidad_disponible || 0),
      0
    );

    if (totalDisponible < cantidad) {
      throw new Error(
        `Stock insuficiente para producto ${producto}. Disponible: ${totalDisponible}, requerido: ${cantidad}`
      );
    }

    //5. Consumir salidas una a una hasta cubrir la cantidad
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

      lotes_Veladas.push({
        salida_id: salida._id,
        cantidad: usar,
        precio_compra: primerLote.precio_compra || 0,
        lote: primerLote.lote ?? "000",
        fecha_vencimiento: primerLote.fecha_vencimiento ?? null,
      });
      await salida.save();
    }

    //6. Validar que hubo stock suficiente
    if (cantidadRestante > 0) {
      throw new Error(
        `Error inesperado: no se pudo cubrir la cantidad requerida para producto ${producto}. Restante: ${cantidadRestante}`
      );
    }

    //7. Crear y guardar la velada
    const nuevaVelada = new Velada({
      id_lote: nuevoIdLote,
      producto,
      cantidad: Number(cantidad),
      responsable: responsable ?? "",
      observacion: observacion ?? "",
      lotes_veladas: lotes_Veladas,
      user: userId,
    });

    const veladaGuardada = await nuevaVelada.save();
    veladasGuardadas.push(veladaGuardada);

    //8. Actualizar campo de control en producto (opcional)
    // Asumiendo que en Product tienes un campo cantidad_veladas

    const productDB = await Product.findById(producto);
    if (productDB) {
      productDB.cantidad_velada = Math.max(
        0,
        (productDB.cantidad_velada || 0) + Number(cantidad)
      );
      await productDB.save();
    }
  }

  //9. Respuesta final
  return {
    message:
      veladas.length > 1
        ? `Veladas creadas exitosamente con id_lote ${nuevoIdLote}`
        : `Velada creada exitosamente con id_lote ${nuevoIdLote}`,
    veladas: veladasGuardadas,
  };
};

export const actualizarLoteVeladas = async (ids, nuevasVeladas, userId) => {
  if (!Array.isArray(ids) || !Array.isArray(nuevasVeladas)) {
    throw new Error("Datos inválidos: se esperaban arrays.");
  }

  // 1) Traer veladas antiguas
  const veladasAntiguas = await Velada.find({ _id: { $in: ids } });
  if (!veladasAntiguas.length) {
    throw new Error("No se encontraron veladas para actualizar.");
  }

  // Tomamos el id_lote del grupo antiguo para mantener el lote lógico
  const id_lote = veladasAntiguas[0]?.id_lote || String(Date.now());

  // 2) Revertir efectos de las veladas antiguas
  for (const velada of veladasAntiguas) {
    // Reponer a Salidas lo consumido por esta velada
    if (Array.isArray(velada.lotes_veladas)) {
      for (const lote of velada.lotes_veladas) {
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
    const producto = await Product.findById(velada.producto);
    if (producto) {
      producto.cantidad_velada = Math.max(
        0,
        (producto.cantidad_velada || 0) - Number(velada.cantidad || 0)
      );
      await producto.save();
    }

    // Eliminar la velada antigua
    await Velada.findByIdAndDelete(velada._id);
  }

  // 3) Crear nuevas veladas consumiendo FIFO desde Salidas
  const veladasCreadas = [];

  for (const velada of nuevasVeladas) {
    const { cantidad, responsable, observacion, producto } = velada;

    if (cantidad == null || isNaN(cantidad) || cantidad <= 0 || !producto) {
      throw new Error("Datos inválidos para la nueva velada.");
    }

    let cantidadRestante = Number(cantidad);
    const lotes_veladas = [];

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

      lotes_veladas.push({
        salida_id: salida._id,
        cantidad: usar,
        precio_compra,
        lote: loteStr,
        fecha_vencimiento: fv,
      });
    }

    if (cantidadRestante > 0) {
      throw new Error(
        "Stock insuficiente en salidas para registrar la nueva velada."
      );
    }

    const nueva = new Velada({
      id_lote,
      producto,
      cantidad: Number(cantidad),
      responsable: responsable ?? "",
      observacion: observacion ?? "",
      user: userId,
      lotes_veladas,
    });

    const guardada = await nueva.save();
    veladasCreadas.push(guardada);

    // Actualizar acumulado del producto
    const productoDB = await Product.findById(producto);
    if (productoDB) {
      productoDB.cantidad_velada = Math.max(
        0,
        (productoDB.cantidad_velada || 0) + Number(cantidad)
      );
      await productoDB.save();
    }
  }

  return {
    message: "Lote de veladas actualizado correctamente",
    veladas: veladasCreadas,
  };
};

export const eliminarVeladaPorId = async (veladaId) => {
  // 1) Buscar la velada
  const velada = await Velada.findById(veladaId);
  if (!velada) {
    throw new Error("Velada no encontrada");
  }

  // 2) Reponer a Salidas lo consumido por esta velada (con tope)
  if (Array.isArray(velada.lotes_veladas)) {
    for (const lote of velada.lotes_veladas) {
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
  const producto = await Product.findById(velada.producto);
  if (!producto) {
    throw new Error("Producto no encontrado");
  }

  producto.cantidad_velada = Math.max(
    0,
    Number(producto.cantidad_velada || 0) - Number(velada.cantidad || 0)
  );
  await producto.save();

  // 4) Eliminar la velada
  await Velada.findByIdAndDelete(veladaId);

  return { message: "Velada eliminada correctamente" };
};

export const eliminarLoteVeladasPorId = async (id_lote) => {
  // 1. Buscar todas las veladas del lote
  const veladas = await Velada.find({ id_lote });

  if (!veladas.length) {
    throw new Error("Lote de veladas no encontrado");
  }

  // 2. Revertir los efectos de cada velada del lote
  for (const velada of veladas) {
    // Reponer a Salidas lo consumido en esta velada
    if (Array.isArray(velada.lotes_veladas)) {
      for (const lote of velada.lotes_veladas) {
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
    const producto = await Product.findById(velada.producto);
    if (producto) {
      producto.cantidad_velada = Math.max(
        0,
        (producto.cantidad_velada || 0) - Number(velada.cantidad || 0)
      );
      await producto.save();
    }

    // Eliminar la velada
    await Velada.findByIdAndDelete(velada._id);
  }

  // Respuesta final
  return { message: "Lote de veladas eliminado correctamente" };
};
