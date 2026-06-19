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
  const query = { sede };
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
  const salidasPrevias = await Salidas.find({ _id: { $in: ids }, sede });
  if (!salidasPrevias.length) throw new Error("No se encontraron salidas para actualizar.");

  for (const salida of salidasPrevias) {
    const tieneVentas = await Venta.exists({ "lotes_vendidos.salida_id": salida._id });
    if (tieneVentas) throw new Error("No se puede actualizar: una salida del lote tiene ventas asociadas.");
    if (salida.cantidad_disponible < salida.cantidad) throw new Error("No se puede actualizar: una salida ya fue parcialmente utilizada.");
  }

  await eliminarLoteSalidasPorId(ids, sede);
  return await crearSalidas(nuevasSalidas, userId, sede);
};

export const eliminarSalidaPorId = async (salidaId, sede) => {
  const salida = await Salidas.findOne({ _id: salidaId, sede });
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

export const eliminarLoteSalidasPorId = async (id, sede) => {
  const salidas = await Salidas.find({ _id: { $in: id }, sede });
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

export const eliminarLoteSalidasPorIdCompleto = async (id_lote, sede) => {
  const salidas = await Salidas.find({ id_lote, sede });
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

const fechaVencimientoMinima = (lotes) =>
  lotes
    .map((l) => l.fecha_vencimiento)
    .filter(Boolean)
    .sort((a, b) => new Date(a) - new Date(b))[0] ?? null;

export const actualizarSalidaIndividual = async (salidaId, datosActualizados, sede) => {
  const salida = await Salidas.findOne({ _id: salidaId, sede });
  if (!salida) throw new Error("Salida no encontrada");

  const tieneVentas = await Venta.exists({ "lotes_vendidos.salida_id": salidaId });
  if (tieneVentas) {
    throw new Error("No se puede actualizar la salida: tiene ventas asociadas.");
  }

  if (salida.cantidad_disponible < salida.cantidad) {
    throw new Error("No se puede actualizar la salida porque ya fue parcialmente utilizada.");
  }

  const nuevaCantidad = datosActualizados.cantidad ?? salida.cantidad;
  if (nuevaCantidad == null || isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
    throw new Error("Cantidad inválida para la salida.");
  }

  const productoNuevoId = datosActualizados.producto || salida.producto.toString();
  const cambiaProducto = productoNuevoId !== salida.producto.toString();
  const cambiaCantidad = nuevaCantidad !== salida.cantidad;

  if (cambiaProducto || cambiaCantidad) {
    // Revertir el consumo original en compras y volver a consumir FIFO,
    // preservando _id e id_lote de la salida
    await revertirConsumoCompras(Compra, salida.lotes_usados);

    let nuevosLotes;
    try {
      nuevosLotes = await consumirStockComprasFIFO(Compra, productoNuevoId, nuevaCantidad, salida.sede);
    } catch (error) {
      // Restaurar el consumo original para no dejar el stock inconsistente
      const restaurados = await consumirStockComprasFIFO(Compra, salida.producto, salida.cantidad, salida.sede);
      salida.lotes_usados = restaurados;
      salida.fecha_vencimiento_min = fechaVencimientoMinima(restaurados);
      await salida.save();
      throw error;
    }

    const productoAnterior = await Product.findById(salida.producto);
    if (productoAnterior) {
      productoAnterior.salidas = Math.max(0, productoAnterior.salidas - salida.cantidad);
      await productoAnterior.save();
    }

    // Se relee para acumular sobre el valor ya actualizado cuando es el mismo producto
    const productoNuevo = await Product.findById(productoNuevoId);
    if (productoNuevo) {
      productoNuevo.salidas = Math.max(0, productoNuevo.salidas + parseInt(nuevaCantidad));
      await productoNuevo.save();
    }

    salida.producto = productoNuevoId;
    salida.lotes_usados = nuevosLotes;
    salida.fecha_vencimiento_min = fechaVencimientoMinima(nuevosLotes);
  }

  salida.cantidad = nuevaCantidad;
  salida.cantidad_disponible = nuevaCantidad;
  if (datosActualizados.motivo != null) salida.motivo = datosActualizados.motivo;

  const guardada = await salida.save();
  await guardada.populate(["producto", "user"]);

  return { message: "Salida actualizada correctamente", salida: guardada };
};
