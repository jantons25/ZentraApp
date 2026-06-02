import Salidas from "../models/salidas.model.js";
import Compra from "../models/compra.model.js";
import Product from "../models/product.model.js";
import Venta from "../models/venta.model.js";
import { generarIdLote, consumirStockComprasFIFO, revertirConsumoCompras } from "../utils/stockOperations.js";

export const obtenerSalidasPorUsuario = async (userId) => {
  return await Salidas.find({ user: userId })
    .populate("user")
    .populate("producto")
    .populate("lotes_usados.compra");
};

export const obtenerTodasLasSalidas = async (sede) => {
  const query = sede ? { sede } : {};
  return await Salidas.find(query)
    .populate("user")
    .populate("producto")
    .populate("lotes_usados.compra");
};

export const crearSalidas = async (salidasInput, userId, sede) => {
  const salidas = Array.isArray(salidasInput) ? salidasInput : [salidasInput];
  if (salidas.length === 0) throw new Error("No se proporcionaron salidas válidas.");

  const nuevoIdLote = await generarIdLote("salida", null, (id) => Salidas.exists({ id_lote: id }));
  const salidasGuardadas = [];
  const detalles_fifo = [];

  for (const salida of salidas) {
    const { cantidad, producto, motivo } = salida;

    if (cantidad == null || isNaN(cantidad) || cantidad <= 0) {
      throw new Error("Cantidad inválida para la salida.");
    }

    const lotes_usados = await consumirStockComprasFIFO(Compra, producto, cantidad, sede);

    const fecha_vencimiento_min =
      lotes_usados
        .map((l) => l.fecha_vencimiento)
        .filter(Boolean)
        .sort((a, b) => new Date(a) - new Date(b))[0] ?? null;

    const nuevaSalida = new Salidas({
      cantidad,
      producto,
      user: userId,
      cantidad_disponible: cantidad,
      id_lote: nuevoIdLote,
      motivo: motivo || "Uso interno",
      lotes_usados,
      fecha_vencimiento_min,
      sede: sede || "",
    });

    const guardada = await nuevaSalida.save();
    salidasGuardadas.push(guardada);

    const productoDB = await Product.findById(producto);
    if (productoDB) {
      productoDB.salidas = Math.max(0, productoDB.salidas + parseInt(cantidad));
      await productoDB.save();
    }

    detalles_fifo.push({
      producto: productoDB?.nombre || "Producto desconocido",
      cantidad,
      detalles_fifo: lotes_usados.map((l) => ({
        lote: l.lote || "N/A",
        cantidad: l.cantidad_usada,
        precio_compra: l.precio_compra,
      })),
    });
  }

  return {
    message: salidas.length > 1
      ? "Salidas registradas exitosamente"
      : "Salida registrada exitosamente",
    salidas: salidasGuardadas,
    detalles_fifo,
  };
};

export const actualizarLoteSalidas = async (ids, nuevasSalidas, userId, sede) => {
  const salidasPrevias = await Salidas.find({ _id: { $in: ids } });
  if (!salidasPrevias.length) throw new Error("No se encontraron salidas para actualizar.");

  for (const salida of salidasPrevias) {
    const tieneVentas = await Venta.exists({ "lotes_vendidos.salida_id": salida._id });
    if (tieneVentas) throw new Error("No se puede actualizar: una salida del lote tiene ventas asociadas.");
    if (salida.cantidad_disponible < salida.cantidad) throw new Error("No se puede actualizar: una salida ya fue parcialmente utilizada.");
  }

  await eliminarLoteSalidasPorId(ids);
  return await crearSalidas(nuevasSalidas, userId, sede);
};

export const eliminarSalidaPorId = async (salidaId) => {
  const salida = await Salidas.findById(salidaId);
  if (!salida) throw new Error("Salida no encontrada");

  const tieneVentas = await Venta.exists({ "lotes_vendidos.salida_id": salidaId });
  if (tieneVentas) {
    throw new Error("No se puede eliminar la salida: tiene ventas asociadas.");
  }

  const producto = await Product.findById(salida.producto);
  if (producto) {
    producto.salidas = Math.max(0, producto.salidas - parseInt(salida.cantidad));
    await producto.save();
  }

  await revertirConsumoCompras(Compra, salida.lotes_usados);
  await Salidas.findByIdAndDelete(salidaId);

  return { message: "Salida eliminada correctamente" };
};

export const eliminarLoteSalidasPorId = async (id) => {
  const salidas = await Salidas.find({ _id: { $in: id } });
  if (!salidas.length) throw new Error("Lote no encontrado");

  for (const salida of salidas) {
    const tieneVentas = await Venta.exists({ "lotes_vendidos.salida_id": salida._id });
    if (tieneVentas) {
      throw new Error("No se puede eliminar: una salida del lote tiene ventas asociadas.");
    }

    const producto = await Product.findById(salida.producto);
    if (producto) {
      producto.salidas = Math.max(0, producto.salidas - salida.cantidad);
      await producto.save();
    }

    await revertirConsumoCompras(Compra, salida.lotes_usados);
    await Salidas.findByIdAndDelete(salida._id);
  }

  return { message: "Lote eliminado correctamente" };
};

export const eliminarLoteSalidasPorIdCompleto = async (id_lote) => {
  const salidas = await Salidas.find({ id_lote });
  if (!salidas.length) throw new Error("Lote no encontrado");

  for (const salida of salidas) {
    const tieneVentas = await Venta.exists({ "lotes_vendidos.salida_id": salida._id });
    if (tieneVentas) {
      throw new Error("No se puede eliminar: una salida del lote tiene ventas asociadas.");
    }

    const producto = await Product.findById(salida.producto);
    if (producto) {
      producto.salidas = Math.max(0, producto.salidas - salida.cantidad);
      await producto.save();
    }

    await revertirConsumoCompras(Compra, salida.lotes_usados);
    await Salidas.findByIdAndDelete(salida._id);
  }

  return { message: "Lote eliminado correctamente" };
};

export const actualizarSalidaIndividual = async (salidaId, datosActualizados) => {
  const salida = await Salidas.findById(salidaId);
  if (!salida) throw new Error("Salida no encontrada");

  if (salida.cantidad_disponible < salida.cantidad) {
    throw new Error("No se puede actualizar la salida porque ya fue parcialmente utilizada.");
  }

  const userId = salida.user;
  const sede = salida.sede;

  await eliminarSalidaPorId(salidaId);
  return await crearSalidas(datosActualizados, userId, sede);
};
