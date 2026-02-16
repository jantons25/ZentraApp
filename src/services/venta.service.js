import Salida from "../models/salidas.model.js";
import Venta from "../models/venta.model.js";
import Product from "../models/product.model.js";

export const crearVentas = async (ventasInput, userId) => {
  const ventas = Array.isArray(ventasInput) ? ventasInput : [ventasInput];
  if (ventas.length === 0)
    throw new Error("No se proporcionaron ventas válidas.");

  const ultimaVenta = await Venta.findOne().sort({ createdAt: -1 });
  let nuevoLoteNumero = 1;

  if (ultimaVenta?.id_lote) {
    const ultimoLote = parseInt(ultimaVenta.id_lote, 10);
    if (!isNaN(ultimoLote)) nuevoLoteNumero = ultimoLote + 1;
  }

  const nuevoIdLote = String(nuevoLoteNumero).padStart(3, "0");
  const ventasGuardadas = [];

  for (const venta of ventas) {
    const { cantidad, pago_registrado, habitacion, precio_venta, producto } =
      venta;

    if (
      cantidad == null ||
      isNaN(cantidad) ||
      cantidad <= 0 ||
      precio_venta == null ||
      isNaN(precio_venta) ||
      precio_venta < 0 ||
      !pago_registrado
    ) {
      throw new Error("Datos inválidos para la venta.");
    }

    let cantidadRestante = cantidad;
    const lotes_vendidos = [];

    const salidasDisponibles = await Salida.find({
      producto,
      cantidad_disponible: { $gt: 0 },
    }).sort({ fecha_vencimiento_min: 1, createdAt: 1 });

    // 2) Verificar stock total ANTES de modificar nada
    const totalDisponible = salidasDisponibles.reduce(
      (acc, salida) => acc + Number(salida.cantidad_disponible || 0),
      0
    );

    if (totalDisponible < cantidadRestante) {
      throw new Error(
        "Stock insuficiente (en salidas) para realizar la venta."
      );
    }

    for (const salida of salidasDisponibles) {
      if (cantidadRestante <= 0) break;

      const usar = Math.min(salida.cantidad_disponible, cantidadRestante);
      salida.cantidad_disponible -= usar;
      cantidadRestante -= usar;

      // Tomamos solo el primer lote usado como referencia para la trazabilidad
      const primerLote = salida.lotes_usados?.[0] || {};

      lotes_vendidos.push({
        salida_id: salida._id,
        cantidad: usar,
        precio_compra: primerLote.precio_compra ?? 0,
        margen_unitario: precio_venta - (primerLote.precio_compra ?? 0),
        lote: primerLote.lote ?? "000",
        fecha_vencimiento: primerLote.fecha_vencimiento ?? null,
      });

      await salida.save();
    }

    if (cantidadRestante > 0) {
      throw new Error(
        "Stock insuficiente (en salidas) para realizar la venta."
      );
    }

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
      lotes_vendidos,
    });

    const ventaGuardada = await nuevaVenta.save();
    ventasGuardadas.push(ventaGuardada);

    const productoDB = await Product.findById(producto);
    if (productoDB) {
      productoDB.cantidad_vendida = Math.max(
        0,
        productoDB.cantidad_vendida + cantidad
      );
      await productoDB.save();
    }
  }

  return {
    message:
      ventas.length > 1
        ? "Ventas creadas exitosamente"
        : "Venta creada exitosamente",
    ventas: ventasGuardadas,
  };
};

export const actualizarLoteVentas = async (ids, nuevasVentas, userId) => {
  if (!Array.isArray(ids) || !Array.isArray(nuevasVentas)) {
    throw new Error("Datos inválidos: se esperaban arrays.");
  }

  const ventasAntiguas = await Venta.find({ _id: { $in: ids } });
  if (!ventasAntiguas.length) {
    throw new Error("No se encontraron ventas para actualizar.");
  }

  const id_lote = ventasAntiguas[0]?.id_lote || Date.now().toString();

  for (const venta of ventasAntiguas) {
    if (venta.lotes_vendidos?.length) {
      for (const lote of venta.lotes_vendidos) {
        const salida = await Salida.findById(lote.salida_id);
        if (!salida) continue;

        salida.cantidad_disponible += lote.cantidad;

        await salida.save();
      }
    }

    const producto = await Product.findById(venta.producto);
    if (producto) {
      producto.cantidad_vendida = Math.max(
        0,
        producto.cantidad_vendida - venta.cantidad
      );
      await producto.save();
    }

    await Venta.findByIdAndDelete(venta._id);
  }

  const ventasCreadas = [];

  // ✅ 2. Crear nuevas ventas usando FIFO desde Salidas
  for (const venta of nuevasVentas) {
    const { cantidad, pago_registrado, habitacion, precio_venta, producto } =
      venta;

    if (
      cantidad == null ||
      isNaN(cantidad) ||
      cantidad <= 0 ||
      precio_venta == null ||
      isNaN(precio_venta) ||
      precio_venta < 0 ||
      !pago_registrado
    ) {
      throw new Error("Datos inválidos para la nueva venta.");
    }

    let cantidadRestante = cantidad;
    const lotes_vendidos = [];

    const salidasDisponibles = await Salida.find({
      producto,
      cantidad_disponible: { $gt: 0 },
    }).sort({ fecha_vencimiento: 1, createdAt: 1 });

    for (const salida of salidasDisponibles) {
      if (cantidadRestante <= 0) break;

      const usar = Math.min(salida.cantidad_disponible, cantidadRestante);
      salida.cantidad_disponible -= usar;
      await salida.save();

      cantidadRestante -= usar;

      const primerLote = salida.lotes_usados?.[0];
      if (!primerLote) {
        throw new Error("La salida no tiene información de lote utilizada");
      }

      lotes_vendidos.push({
        salida_id: salida._id,
        cantidad: usar,
        precio_compra: primerLote.precio_compra,
        margen_unitario: precio_venta - primerLote.precio_compra,
        lote: primerLote.lote,
        fecha_vencimiento: primerLote.fecha_vencimiento,
      });
    }

    if (cantidadRestante > 0) {
      throw new Error(
        "Stock insuficiente en salidas para registrar la nueva venta."
      );
    }

    const importe_venta = cantidad * precio_venta;

    const nuevaVenta = new Venta({
      cantidad,
      pago_registrado,
      habitacion,
      precio_venta,
      importe_venta,
      producto,
      user: userId,
      id_lote,
      lotes_vendidos,
    });

    const guardada = await nuevaVenta.save();
    ventasCreadas.push(guardada);

    const productoDB = await Product.findById(producto);
    if (productoDB) {
      productoDB.cantidad_vendida += parseInt(cantidad);
      await productoDB.save();
    }
  }

  return {
    message: "Lote actualizado correctamente",
    ventas: ventasCreadas,
  };
};

export const eliminarVentaPorId = async (ventaId) => {
  const venta = await Venta.findById(ventaId);
  if (!venta) {
    throw new Error("Venta no encontrada");
  }

  if (Array.isArray(venta.lotes_vendidos)) {
    for (const lote of venta.lotes_vendidos) {
      if (!lote.salida_id) continue;

      const salida = await Salida.findById(lote.salida_id);
      if (salida) {
        salida.cantidad_disponible += lote.cantidad;
        await salida.save();
      }
    }
  }

  const producto = await Product.findById(venta.producto);
  if (!producto) {
    throw new Error("Producto no encontrado");
  }

  producto.cantidad_vendida = Math.max(
    0,
    producto.cantidad_vendida - venta.cantidad
  );
  await producto.save();

  await Venta.findByIdAndDelete(ventaId);

  return { message: "Venta eliminada correctamente" };
};

export const eliminarLoteVentasPorId = async (id_lote) => {
  const ventas = await Venta.find({ id_lote });

  if (!ventas.length) {
    throw new Error("Lote no encontrado");
  }

  for (const venta of ventas) {
    if (Array.isArray(venta.lotes_vendidos)) {
      for (const lote of venta.lotes_vendidos) {
        if (!lote.salida_id) continue;

        const salida = await Salida.findById(lote.salida_id);
        if (salida) {
          salida.cantidad_disponible += lote.cantidad;
          await salida.save();
        }
      }
    }

    const producto = await Product.findById(venta.producto);
    if (producto) {
      producto.cantidad_vendida = Math.max(
        0,
        producto.cantidad_vendida - venta.cantidad
      );
      await producto.save();
    }

    await Venta.findByIdAndDelete(venta._id);
  }

  return { message: "Lote eliminado correctamente" };
};
