import Compra from "../models/compra.model.js";
import Product from "../models/product.model.js";

export const crearCompras = async (comprasInput, userId) => {
  const compras = Array.isArray(comprasInput) ? comprasInput : [comprasInput];
  if (compras.length === 0)
    throw new Error("No se proporcionaron compras válidas.");

  const ultimaCompra = await Compra.findOne().sort({ createdAt: -1 });
  let nuevoLoteNumero = 1;

  if (ultimaCompra?.id_lote) {
    const ultimoLote = parseInt(ultimaCompra.id_lote, 10);
    if (!isNaN(ultimoLote)) nuevoLoteNumero = ultimoLote + 1;
  }

  const nuevoIdLote = String(nuevoLoteNumero).padStart(3, "0");
  const comprasGuardadas = [];

  for (const compra of compras) {
    const { cantidad, precio_compra, producto, fecha_vencimiento } = compra;

    const nuevaCompra = new Compra({
      id_lote: nuevoIdLote,
      cantidad,
      cantidad_disponible: cantidad,
      precio_compra,
      importe_compra: cantidad * precio_compra,
      fecha_vencimiento: fecha_vencimiento || null,
      producto,
      user: userId,
    });

    const guardada = await nuevaCompra.save();
    comprasGuardadas.push(guardada);

    const productoDB = await Product.findById(producto);
    if (productoDB) {
      productoDB.ingresos += cantidad;
      await productoDB.save();
    }
  }
  return {
    message:
      compras.length > 1
        ? "Compras registradas exitosamente"
        : "Compra registrada exitosamente",
    compras: comprasGuardadas,
  };
};

export const actualizarLoteCompras = async (ids, nuevasCompras, userId) => {
  if (!Array.isArray(ids) || !Array.isArray(nuevasCompras)) {
    throw new Error("Datos inválidos: se esperaban arrays.");
  }

  const comprasPrevias = await Compra.find({ _id: { $in: ids } });

  if (!comprasPrevias.length) {
    throw new Error("No se encontraron compras para actualizar.");
  }

  for (const c of comprasPrevias) {
    const usado = Number(c.cantidad) - Number(c.cantidad_disponible);
    if (usado > 0) {
      throw new Error(`No se puede actualizar el lote: compra ${c._id} ya usada en salidas.`);
    }
  }

  const id_lote = comprasPrevias[0]?.id_lote || Date.now().toString();

  for (const compra of comprasPrevias) {
    const producto = await Product.findById(compra.producto);
    if (producto) {
      const nuevoIngreso = producto.ingresos - compra.cantidad;
      if (nuevoIngreso < 0) {
        throw new Error(
          `No se puede actualizar: el producto "${producto.nombre}" quedaría con ingresos negativos.`
        );
      }

      producto.ingresos = nuevoIngreso;
      await producto.save();
    }

    await Compra.findByIdAndDelete(compra._id);
  }

  const comprasActualizadas = [];

  for (const compra of nuevasCompras) {
    const { cantidad, precio_compra, producto } = compra;

    if (
      typeof cantidad !== "number" ||
      cantidad < 0 ||
      typeof precio_compra !== "number" ||
      precio_compra < 0
    ) {
      throw new Error(
        `Datos inválidos en la nueva compra para el producto "${producto}": cantidad y precio_compra deben ser números ≥ 0`
      );
    }

    const nuevaCompra = new Compra({
      ...compra,
      cantidad_disponible: cantidad,
      user: userId,
      id_lote,
    });

    const productoDB = await Product.findById(producto);
    if (productoDB) {
      productoDB.ingresos += parseInt(cantidad);
      await productoDB.save();
    }

    const guardada = await nuevaCompra.save();
    comprasActualizadas.push(guardada);
  }

  return {
    message: "Lote actualizado correctamente",
    compras: comprasActualizadas,
  };
};

export const eliminarCompraPorId = async (compraId) => {
  const compra = await Compra.findById(compraId);
  if (!compra) throw new Error("Compra no encontrada");

  const producto = await Product.findById(compra.producto);
  if (producto) {
    const resta = compra.cantidad_disponible;

    // Validar que ingresos no sea menor a la resta
    if (producto.ingresos - resta < 0) {
      throw new Error(
        "No se puede eliminar: generaría un valor negativo en ingresos del producto."
      );
    }

    producto.ingresos -= resta;
    await producto.save();
  }

  await Compra.findByIdAndDelete(compraId);
  return { message: "Compra eliminada correctamente" };
};

export const eliminarLoteComprasPorId = async (id_lote) => {
  console.log("Eliminando lote de compras:", id_lote);
  const compras = await Compra.find({ id_lote });
  console.log("Compras encontradas para el lote:", compras);

  if (!compras.length) {
    throw new Error("Lote no encontrado");
  }

  for (const compra of compras) {
    const usado = compra.cantidad - compra.cantidad_disponible;
    if (usado > 0) {
      throw new Error(
        `No se puede eliminar el lote ${id_lote} porque ya ha sido parcialmente utilizado.`
      );
    }

    const producto = await Product.findById(compra.producto);
    if (producto) {
      const resta = compra.cantidad_disponible;
      if (producto.ingresos - resta < 0) {
        throw new Error(
          `Eliminar el lote ${id_lote} generaría un valor negativo en ingresos del producto.`
        );
      }

      producto.ingresos -= resta;
      await producto.save();
    }

    await Compra.findByIdAndDelete(compra._id);
  }

  return { message: "Lote eliminado correctamente" };
};

export const actualizarCompraIndividual = async (compraId, nuevosDatos) => {
  const compra = await Compra.findById(compraId);
  if (!compra) throw new Error("Compra no encontrada");

  // Validar valores
  const nuevaCantidad = nuevosDatos.cantidad ?? compra.cantidad;
  const nuevoPrecio = nuevosDatos.precio_compra ?? compra.precio_compra;

  if (nuevaCantidad < 0 || nuevoPrecio < 0) {
    throw new Error(
      "Cantidad y precio de compra deben ser mayores o iguales a 0"
    );
  }

  // Verificar cantidad ya usada
  const cantidadUsada = compra.cantidad - compra.cantidad_disponible;
  if (nuevaCantidad < cantidadUsada) {
    throw new Error(
      "No se puede reducir la cantidad por debajo de la cantidad ya usada."
    );
  }

  const diferencia = nuevaCantidad - compra.cantidad;

  // Buscar productos relacionados
  const productoAnterior = await Product.findById(compra.producto);
  const productoNuevo = nuevosDatos.producto
    ? await Product.findById(nuevosDatos.producto)
    : productoAnterior;

  // Verificación de ingreso negativo
  if (
    productoAnterior._id.toString() === productoNuevo._id.toString() &&
    productoAnterior.ingresos + diferencia < 0
  ) {
    throw new Error(
      "La actualización haría que los ingresos del producto sean negativos."
    );
  }

  // Ajustes en producto
  if (productoAnterior._id.toString() === productoNuevo._id.toString()) {
    productoAnterior.ingresos += diferencia;
    await productoAnterior.save();
  } else {
    // Cambio de producto
    if (productoAnterior.ingresos - compra.cantidad < 0) {
      throw new Error(
        "No se puede trasladar esta compra: afectaría los ingresos originales."
      );
    }
    productoAnterior.ingresos -= compra.cantidad;
    await productoAnterior.save();

    productoNuevo.ingresos += nuevaCantidad;
    await productoNuevo.save();
  }

  // Calcular cantidad_disponible nuevamente
  const nuevaCantidadDisponible = nuevaCantidad - cantidadUsada;

  const compraActualizada = await Compra.findByIdAndUpdate(
    compraId,
    {
      ...nuevosDatos,
      cantidad: nuevaCantidad,
      cantidad_disponible: nuevaCantidadDisponible,
      precio_compra: nuevoPrecio,
      importe_compra: nuevaCantidad * nuevoPrecio,
    },
    { new: true }
  );

  return compraActualizada;
};
