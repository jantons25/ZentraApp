import mongoose from "mongoose";

/**
 * Genera un id_lote secuencial atómico.
 * Usa un documento de secuencia en la colección "counters".
 */
export async function generarIdLote(tipoEntidad, session = null) {
  const Counter = mongoose.connection.collection("counters");
  const opts = session ? { session } : {};

  const result = await Counter.findOneAndUpdate(
    { _id: `lote_${tipoEntidad}` },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after", ...opts }
  );

  return String(result.seq).padStart(3, "0");
}

/**
 * Consume stock FIFO desde Salidas disponibles.
 * Retorna los lotes consumidos con trazabilidad.
 */
export async function consumirStockFIFO(Salida, productoId, cantidad, sede, session = null) {
  const query = {
    producto: productoId,
    cantidad_disponible: { $gt: 0 },
  };
  if (sede) query.sede = sede;

  const opts = session ? { session } : {};
  const salidasDisponibles = await Salida.find(query, null, opts)
    .sort({ fecha_vencimiento_min: 1, createdAt: 1 });

  const totalDisponible = salidasDisponibles.reduce(
    (acc, s) => acc + Number(s.cantidad_disponible || 0), 0
  );

  if (totalDisponible < cantidad) {
    throw new Error("Stock insuficiente en salidas para esta operación.");
  }

  let cantidadRestante = cantidad;
  const lotesConsumidos = [];

  for (const salida of salidasDisponibles) {
    if (cantidadRestante <= 0) break;

    const usar = Math.min(Number(salida.cantidad_disponible), cantidadRestante);
    salida.cantidad_disponible -= usar;
    cantidadRestante -= usar;

    const primerLote = salida.lotes_usados?.[0] || {};

    lotesConsumidos.push({
      salida_id: salida._id,
      cantidad: usar,
      precio_compra: primerLote.precio_compra ?? 0,
      lote: primerLote.lote ?? "000",
      fecha_vencimiento: primerLote.fecha_vencimiento ?? null,
    });

    await salida.save(opts);
  }

  if (cantidadRestante > 0) {
    throw new Error("Stock insuficiente en salidas para esta operación.");
  }

  return lotesConsumidos;
}

/**
 * Revierte el consumo de stock devolviendo cantidad a las salidas.
 */
export async function revertirConsumoSalidas(Salida, lotes, session = null) {
  const opts = session ? { session } : {};

  for (const lote of lotes) {
    if (!lote.salida_id) continue;

    const salida = await Salida.findById(lote.salida_id, null, opts);
    if (!salida) continue;

    const disponibleActual = Number(salida.cantidad_disponible || 0);
    const devolver = Number(lote.cantidad || 0);
    const capacidadMax = Number(salida.cantidad || 0);

    salida.cantidad_disponible = Math.min(capacidadMax, disponibleActual + devolver);
    await salida.save(opts);
  }
}

/**
 * Consume stock FIFO desde Compras disponibles (para crear Salidas).
 */
export async function consumirStockComprasFIFO(Compra, productoId, cantidad, sede, session = null) {
  const query = {
    producto: productoId,
    cantidad_disponible: { $gt: 0 },
  };
  if (sede) query.sede = sede;

  const opts = session ? { session } : {};
  const comprasDisponibles = await Compra.find(query, null, opts)
    .sort({ fecha_vencimiento: 1, createdAt: 1 });

  const totalDisponible = comprasDisponibles.reduce(
    (acc, c) => acc + Number(c.cantidad_disponible || 0), 0
  );

  if (totalDisponible < cantidad) {
    throw new Error("No hay suficiente stock disponible para esta operación.");
  }

  let cantidadRestante = cantidad;
  const lotesUsados = [];

  for (const compra of comprasDisponibles) {
    if (cantidadRestante <= 0) break;

    const usar = Math.min(Number(compra.cantidad_disponible), cantidadRestante);
    compra.cantidad_disponible -= usar;
    await compra.save(opts);

    lotesUsados.push({
      compra: compra._id,
      cantidad_usada: usar,
      precio_compra: compra.precio_compra,
      lote: compra.id_lote,
      fecha_vencimiento: compra.fecha_vencimiento,
    });

    cantidadRestante -= usar;
  }

  if (cantidadRestante > 0) {
    throw new Error("No hay suficiente stock disponible para esta operación.");
  }

  return lotesUsados;
}

/**
 * Revierte el consumo de stock devolviendo cantidad a las compras.
 */
export async function revertirConsumoCompras(Compra, lotesUsados, session = null) {
  const opts = session ? { session } : {};

  for (const lote of lotesUsados) {
    const compra = await Compra.findById(lote.compra, null, opts);
    if (!compra) continue;

    compra.cantidad_disponible += lote.cantidad_usada;
    await compra.save(opts);
  }
}
