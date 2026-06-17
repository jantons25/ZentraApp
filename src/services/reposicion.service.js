import Salida from "../models/salidas.model.js";
import Reposicion from "../models/reposicion.model.js";
import Product from "../models/product.model.js";
import { generarIdLote, consumirStockFIFO, revertirConsumoSalidas } from "../utils/stockOperations.js";

export const crearReposiciones = async (reposicionesInput, userId, sede) => {
  const reposiciones = Array.isArray(reposicionesInput) ? reposicionesInput : [reposicionesInput];
  if (reposiciones.length === 0) throw new Error("No se proporcionaron reposiciones válidas.");

  const nuevoIdLote = await generarIdLote("reposicion", null, (id) => Reposicion.exists({ id_lote: id }));
  const reposicionesGuardadas = [];

  for (const reposicion of reposiciones) {
    const { cantidad, habitacion, responsable, observacion, producto } = reposicion;

    if (cantidad == null || isNaN(cantidad) || cantidad <= 0 || !producto) {
      throw new Error("Datos inválidos para la reposición.");
    }

    const lotes_repuestos = await consumirStockFIFO(Salida, producto, Number(cantidad), sede);

    const nuevaReposicion = new Reposicion({
      id_lote: nuevoIdLote,
      producto,
      cantidad: Number(cantidad),
      habitacion,
      responsable,
      observacion,
      user: userId,
      lotes_repuestos,
      sede: sede || "",
    });

    const reposicionGuardada = await nuevaReposicion.save();
    reposicionesGuardadas.push(reposicionGuardada);

    const productoDB = await Product.findById(producto);
    if (productoDB) {
      productoDB.cantidad_repuesta = Math.max(0, Number(productoDB.cantidad_repuesta || 0) + Number(cantidad));
      await productoDB.save();
    }
  }

  return {
    message: reposiciones.length > 1
      ? "Reposiciones registradas exitosamente"
      : "Reposición registrada exitosamente",
    reposiciones: reposicionesGuardadas,
  };
};

export const actualizarLoteReposiciones = async (ids, nuevasReposiciones, userId, sede) => {
  if (!Array.isArray(ids) || !Array.isArray(nuevasReposiciones)) {
    throw new Error("Datos inválidos: se esperaban arrays.");
  }

  const reposAntiguas = await Reposicion.find({ _id: { $in: ids } });
  if (!reposAntiguas.length) throw new Error("No se encontraron reposiciones para actualizar.");

  // Validar nuevas reposiciones antes de modificar nada
  for (const rep of nuevasReposiciones) {
    const { cantidad, producto } = rep;
    if (cantidad == null || isNaN(cantidad) || cantidad <= 0 || !producto) {
      throw new Error("Datos inválidos para la nueva reposición.");
    }
  }

  const id_lote = reposAntiguas[0]?.id_lote || String(Date.now());

  for (const rep of reposAntiguas) {
    if (Array.isArray(rep.lotes_repuestos)) {
      await revertirConsumoSalidas(Salida, rep.lotes_repuestos);
    }

    const producto = await Product.findById(rep.producto);
    if (producto) {
      producto.cantidad_repuesta = Math.max(0, (producto.cantidad_repuesta || 0) - Number(rep.cantidad || 0));
      await producto.save();
    }

    await Reposicion.findByIdAndDelete(rep._id);
  }

  const reposCreadas = [];

  for (const rep of nuevasReposiciones) {
    const { cantidad, habitacion, responsable, observacion, producto } = rep;

    if (cantidad == null || isNaN(cantidad) || cantidad <= 0 || !producto) {
      throw new Error("Datos inválidos para la nueva reposición.");
    }

    const lotes_repuestos = await consumirStockFIFO(Salida, producto, Number(cantidad), sede);

    const nueva = new Reposicion({
      id_lote, producto,
      cantidad: Number(cantidad),
      habitacion: habitacion ?? "",
      responsable: responsable ?? "",
      observacion: observacion ?? "",
      user: userId,
      lotes_repuestos,
      sede: sede || "",
    });

    const guardada = await nueva.save();
    reposCreadas.push(guardada);

    const productoDB = await Product.findById(producto);
    if (productoDB) {
      productoDB.cantidad_repuesta = Math.max(0, (productoDB.cantidad_repuesta || 0) + Number(cantidad));
      await productoDB.save();
    }
  }

  return { message: "Lote de reposiciones actualizado correctamente", reposiciones: reposCreadas };
};

export const eliminarReposicionPorId = async (reposicionId) => {
  const reposicion = await Reposicion.findById(reposicionId);
  if (!reposicion) throw new Error("Reposición no encontrada");

  if (Array.isArray(reposicion.lotes_repuestos)) {
    await revertirConsumoSalidas(Salida, reposicion.lotes_repuestos);
  }

  const producto = await Product.findById(reposicion.producto);
  if (!producto) throw new Error("Producto no encontrado");

  producto.cantidad_repuesta = Math.max(0, Number(producto.cantidad_repuesta || 0) - Number(reposicion.cantidad || 0));
  await producto.save();

  await Reposicion.findByIdAndDelete(reposicionId);
  return { message: "Reposición eliminada correctamente" };
};

export const actualizarReposicionIndividual = async (reposicionId, nuevosDatos) => {
  const reposicion = await Reposicion.findById(reposicionId);
  if (!reposicion) throw new Error("Reposición no encontrada");

  const nuevaCantidad = nuevosDatos.cantidad ?? reposicion.cantidad;

  if (nuevaCantidad == null || isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
    throw new Error("Cantidad debe ser mayor a 0.");
  }

  if (Number(nuevaCantidad) !== Number(reposicion.cantidad)) {
    // Revertir el consumo original y volver a consumir FIFO con la nueva cantidad,
    // para mantener consistentes salidas, kardex y cantidad_repuesta del producto
    if (reposicion.lotes_repuestos?.length) {
      await revertirConsumoSalidas(Salida, reposicion.lotes_repuestos);
    }

    let nuevosLotes;
    try {
      nuevosLotes = await consumirStockFIFO(
        Salida,
        reposicion.producto,
        Number(nuevaCantidad),
        reposicion.sede
      );
    } catch (error) {
      // Restaurar el consumo original para no dejar el stock inconsistente
      const restaurados = await consumirStockFIFO(
        Salida,
        reposicion.producto,
        Number(reposicion.cantidad),
        reposicion.sede
      );
      reposicion.lotes_repuestos = restaurados;
      await reposicion.save();
      throw error;
    }

    reposicion.lotes_repuestos = nuevosLotes;

    const producto = await Product.findById(reposicion.producto);
    if (producto) {
      producto.cantidad_repuesta = Math.max(
        0,
        Number(producto.cantidad_repuesta || 0) -
          Number(reposicion.cantidad) +
          Number(nuevaCantidad)
      );
      await producto.save();
    }
  }

  reposicion.cantidad = Number(nuevaCantidad);
  if (nuevosDatos.habitacion != null) reposicion.habitacion = nuevosDatos.habitacion;
  if (nuevosDatos.responsable != null) reposicion.responsable = nuevosDatos.responsable;
  if (nuevosDatos.observacion != null) reposicion.observacion = nuevosDatos.observacion;

  const guardada = await reposicion.save();
  await guardada.populate(["producto", "user"]);

  return guardada;
};

export const eliminarLoteReposicionesPorId = async (id_lote) => {
  const reposiciones = await Reposicion.find({ id_lote });
  if (!reposiciones.length) throw new Error("Lote no encontrado");

  for (const reposicion of reposiciones) {
    if (Array.isArray(reposicion.lotes_repuestos)) {
      await revertirConsumoSalidas(Salida, reposicion.lotes_repuestos);
    }

    const producto = await Product.findById(reposicion.producto);
    if (producto) {
      producto.cantidad_repuesta = Math.max(0, (producto.cantidad_repuesta || 0) - Number(reposicion.cantidad || 0));
      await producto.save();
    }

    await Reposicion.findByIdAndDelete(reposicion._id);
  }

  return { message: "Lote de reposiciones eliminado correctamente" };
};
