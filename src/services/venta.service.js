import Venta from "../models/venta.model.js";
import Product from "../models/product.model.js";
import { generarIdLote, consumirStockFIFO, revertirConsumoSalidas } from "../utils/stockOperations.js";
import Salida from "../models/salidas.model.js";

export const crearVentas = async (ventasInput, userId, sede) => {
  const ventas = Array.isArray(ventasInput) ? ventasInput : [ventasInput];
  if (ventas.length === 0) throw new Error("No se proporcionaron ventas válidas.");

  const nuevoIdLote = await generarIdLote("venta", null, (id) => Venta.exists({ id_lote: id }));
  const ventasGuardadas = [];

  for (const venta of ventas) {
    const { cantidad, pago_registrado, habitacion, precio_venta, producto } = venta;

    if (
      cantidad == null || isNaN(cantidad) || cantidad <= 0 ||
      precio_venta == null || isNaN(precio_venta) || precio_venta < 0 ||
      !pago_registrado
    ) {
      throw new Error("Datos inválidos para la venta.");
    }

    const lotes_vendidos = await consumirStockFIFO(Salida, producto, cantidad, sede);

    const lotes_con_margen = lotes_vendidos.map((l) => ({
      ...l,
      margen_unitario: precio_venta - l.precio_compra,
    }));

    const importe_venta = cantidad * precio_venta;

    const nuevaVenta = new Venta({
      cantidad,
      pago_registrado,
      habitacion,
      precio_venta,
      importe_venta,
      producto,
      user: userId,
      id_lote: nuevoIdLote,
      lotes_vendidos: lotes_con_margen,
      sede: sede || "",
    });

    const ventaGuardada = await nuevaVenta.save();
    ventasGuardadas.push(ventaGuardada);

    const productoDB = await Product.findById(producto);
    if (productoDB) {
      productoDB.cantidad_vendida = Math.max(0, productoDB.cantidad_vendida + cantidad);
      await productoDB.save();
    }
  }

  return {
    message: ventas.length > 1 ? "Ventas creadas exitosamente" : "Venta creada exitosamente",
    ventas: ventasGuardadas,
  };
};

export const actualizarLoteVentas = async (ids, nuevasVentas, userId, sede) => {
  if (!Array.isArray(ids) || !Array.isArray(nuevasVentas)) {
    throw new Error("Datos inválidos: se esperaban arrays.");
  }

  const ventasAntiguas = await Venta.find({ _id: { $in: ids } });
  if (!ventasAntiguas.length) throw new Error("No se encontraron ventas para actualizar.");

  // Validar nuevas ventas antes de modificar nada (evita estado inconsistente)
  for (const venta of nuevasVentas) {
    const { cantidad, pago_registrado, precio_venta } = venta;
    if (
      cantidad == null || isNaN(cantidad) || cantidad <= 0 ||
      precio_venta == null || isNaN(precio_venta) || precio_venta < 0 ||
      !pago_registrado
    ) {
      throw new Error("Datos inválidos para la nueva venta.");
    }
  }

  const id_lote = ventasAntiguas[0]?.id_lote || Date.now().toString();

  for (const venta of ventasAntiguas) {
    if (venta.lotes_vendidos?.length) {
      await revertirConsumoSalidas(Salida, venta.lotes_vendidos);
    }

    const producto = await Product.findById(venta.producto);
    if (producto) {
      producto.cantidad_vendida = Math.max(0, producto.cantidad_vendida - venta.cantidad);
      await producto.save();
    }

    await Venta.findByIdAndDelete(venta._id);
  }

  const ventasCreadas = [];

  for (const venta of nuevasVentas) {
    const { cantidad, pago_registrado, habitacion, precio_venta, producto } = venta;

    if (
      cantidad == null || isNaN(cantidad) || cantidad <= 0 ||
      precio_venta == null || isNaN(precio_venta) || precio_venta < 0 ||
      !pago_registrado
    ) {
      throw new Error("Datos inválidos para la nueva venta.");
    }

    const lotes_vendidos_raw = await consumirStockFIFO(Salida, producto, cantidad, sede);

    const lotes_vendidos = lotes_vendidos_raw.map((l) => ({
      ...l,
      margen_unitario: precio_venta - l.precio_compra,
    }));

    const importe_venta = cantidad * precio_venta;

    const nuevaVenta = new Venta({
      cantidad, pago_registrado, habitacion, precio_venta, importe_venta,
      producto, user: userId, id_lote, lotes_vendidos, sede: sede || "",
    });

    const guardada = await nuevaVenta.save();
    ventasCreadas.push(guardada);

    const productoDB = await Product.findById(producto);
    if (productoDB) {
      productoDB.cantidad_vendida += parseInt(cantidad);
      await productoDB.save();
    }
  }

  return { message: "Lote actualizado correctamente", ventas: ventasCreadas };
};

export const eliminarVentaPorId = async (ventaId) => {
  const venta = await Venta.findById(ventaId);
  if (!venta) throw new Error("Venta no encontrada");

  if (Array.isArray(venta.lotes_vendidos)) {
    await revertirConsumoSalidas(Salida, venta.lotes_vendidos);
  }

  const producto = await Product.findById(venta.producto);
  if (!producto) throw new Error("Producto no encontrado");

  producto.cantidad_vendida = Math.max(0, producto.cantidad_vendida - venta.cantidad);
  await producto.save();
  await Venta.findByIdAndDelete(ventaId);

  return { message: "Venta eliminada correctamente" };
};

export const actualizarVentaIndividual = async (ventaId, nuevosDatos) => {
  const venta = await Venta.findById(ventaId);
  if (!venta) throw new Error("Venta no encontrada");

  const nuevaCantidad = nuevosDatos.cantidad ?? venta.cantidad;
  const nuevoPrecio = nuevosDatos.precio_venta ?? venta.precio_venta;

  if (
    nuevaCantidad == null || isNaN(nuevaCantidad) || nuevaCantidad <= 0 ||
    nuevoPrecio == null || isNaN(nuevoPrecio) || nuevoPrecio < 0
  ) {
    throw new Error("Cantidad y precio de venta deben ser valores válidos.");
  }

  if (nuevaCantidad !== venta.cantidad) {
    if (venta.lotes_vendidos?.length) {
      await revertirConsumoSalidas(Salida, venta.lotes_vendidos);
    }

    let nuevosLotes;
    try {
      nuevosLotes = await consumirStockFIFO(Salida, venta.producto, nuevaCantidad, venta.sede);
    } catch (error) {
      // Restaurar el consumo original para no dejar el stock inconsistente
      const restaurados = await consumirStockFIFO(Salida, venta.producto, venta.cantidad, venta.sede);
      venta.lotes_vendidos = restaurados.map((l) => ({
        ...l,
        margen_unitario: venta.precio_venta - l.precio_compra,
      }));
      await venta.save();
      throw error;
    }

    venta.lotes_vendidos = nuevosLotes.map((l) => ({
      ...l,
      margen_unitario: nuevoPrecio - l.precio_compra,
    }));

    const producto = await Product.findById(venta.producto);
    if (producto) {
      producto.cantidad_vendida = Math.max(
        0,
        producto.cantidad_vendida - venta.cantidad + nuevaCantidad
      );
      await producto.save();
    }
  } else if (nuevoPrecio !== venta.precio_venta) {
    venta.lotes_vendidos.forEach((l) => {
      l.margen_unitario = nuevoPrecio - l.precio_compra;
    });
  }

  venta.cantidad = nuevaCantidad;
  venta.precio_venta = nuevoPrecio;
  venta.importe_venta = nuevaCantidad * nuevoPrecio;
  if (nuevosDatos.pago_registrado != null) venta.pago_registrado = nuevosDatos.pago_registrado;
  if (nuevosDatos.habitacion != null) venta.habitacion = nuevosDatos.habitacion;

  const ventaGuardada = await venta.save();
  return ventaGuardada.populate(["producto", "user"]);
};

export const eliminarLoteVentasPorId = async (id_lote) => {
  const ventas = await Venta.find({ id_lote });
  if (!ventas.length) throw new Error("Lote no encontrado");

  for (const venta of ventas) {
    if (Array.isArray(venta.lotes_vendidos)) {
      await revertirConsumoSalidas(Salida, venta.lotes_vendidos);
    }

    const producto = await Product.findById(venta.producto);
    if (producto) {
      producto.cantidad_vendida = Math.max(0, producto.cantidad_vendida - venta.cantidad);
      await producto.save();
    }

    await Venta.findByIdAndDelete(venta._id);
  }

  return { message: "Lote eliminado correctamente" };
};
