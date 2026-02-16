import Salidas from "../models/salidas.model.js";
import Compra from "../models/compra.model.js";
import Product from "../models/product.model.js";

export const obtenerSalidasPorUsuario = async (userId) => {
  return await Salidas.find({ user: userId })
    .populate("user")
    .populate("producto")
    .populate("lotes_usados.compra");
};

export const obtenerTodasLasSalidas = async () => {
  return await Salidas.find()
    .populate("user")
    .populate("producto")
    .populate("lotes_usados.compra");
};

export const crearSalidas = async (salidasInput, userId) => {
  const salidas = Array.isArray(salidasInput) ? salidasInput : [salidasInput];
  if (salidas.length === 0)
    throw new Error("No se proporcionaron salidas válidas.");

  const ultimaSalida = await Salidas.findOne().sort({ createdAt: -1 });
  let nuevoLoteNumero = 1;

  if (ultimaSalida?.id_lote) {
    const ultimoLote = parseInt(ultimaSalida.id_lote, 10);
    if (!isNaN(ultimoLote)) nuevoLoteNumero = ultimoLote + 1;
  }

  const nuevoIdLote = String(nuevoLoteNumero).padStart(3, "0");
  const salidasGuardadas = [];
  const detalles_fifo = [];

  for (const salida of salidas) {
    const { cantidad, producto, motivo } = salida;

    if (cantidad == null || isNaN(cantidad) || cantidad <= 0) {
      throw new Error("Cantidad inválida para la salida.");
    }

    let cantidadRestante = cantidad;
    const lotes_usados = [];

    const comprasDisponibles = await Compra.find({
      producto,
      cantidad_disponible: { $gt: 0 },
    }).sort({ fecha_vencimiento: 1, createdAt: 1 });

    console.log("Compras disponibles:", comprasDisponibles);

    for (const compra of comprasDisponibles) {
      console.log("Procesando compra:", compra);
      if (cantidadRestante <= 0) break;

      const usar = Math.min(compra.cantidad_disponible, cantidadRestante);
      compra.cantidad_disponible -= usar;
      await compra.save();

      lotes_usados.push({
        compra: compra._id,
        cantidad_usada: usar,
        precio_compra: compra.precio_compra,
        lote: compra.id_lote,
        fecha_vencimiento: compra.fecha_vencimiento,
      });

      cantidadRestante -= usar;
    }

    if (cantidadRestante > 0) {
      throw new Error("No hay suficiente stock disponible para esta salida.");
    }

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
    message:
      salidas.length > 1
        ? "Salidas registradas exitosamente"
        : "Salida registrada exitosamente",
    salidas: salidasGuardadas,
    detalles_fifo,
  };
};

export const actualizarLoteSalidas = async (ids, nuevasSalidas, userId) => {
  await eliminarLoteSalidasPorId(ids);
  return await crearSalidas(nuevasSalidas, userId);
};

export const eliminarSalidaPorId = async (salidaId) => {
  const salida = await Salidas.findById(salidaId);
  if (!salida) throw new Error("Salida no encontrada");

  // Validación de uso parcial
  /* if (salida.cantidad_disponible < salida.cantidad) {
    throw new Error(
      "No se puede eliminar la salida porque ya fue parcialmente utilizada."
    );
  } */

  // candado real: ¿hay ventas que referencian esta salida?
  /* const tieneVentas = await Venta.exists({
    "lotes_vendidos.salida_id": salidaId,
  });
  if (tieneVentas) {
    throw new Error("No se puede eliminar la salida: tiene ventas asociadas.");
  } */

  // Revertir stock en producto
  const producto = await Product.findById(salida.producto);
  if (producto) {
    producto.salidas = Math.max(
      0,
      producto.salidas - parseInt(salida.cantidad)
    );
    await producto.save();
  }

  // Revertir disponibilidad en las compras
  for (const lote of salida.lotes_usados) {
    const compra = await Compra.findById(lote.compra);
    if (compra) {
      compra.cantidad_disponible += lote.cantidad_usada;
      await compra.save();
    }
  }

  await Salidas.findByIdAndDelete(salidaId);
  return { message: "Salida eliminada correctamente" };
};

export const eliminarLoteSalidasPorId = async (id) => {
  const salidas = await Salidas.find({ _id: { $in: id } });

  if (!salidas.length) {
    throw new Error("Lote no encontrado");
  }

  /* for (const salida of salidas) {
    console.log(salida);
    if (salida.cantidad_disponible < salida.cantidad) {
      throw new Error(
        `No se puede eliminar el lote ${id_lote} porque ya ha sido parcialmente utilizado.`
      );
    }
  } */

  for (const salida of salidas) {
    const producto = await Product.findById(salida.producto);
    if (producto) {
      producto.salidas = Math.max(0, producto.salidas - salida.cantidad);
      await producto.save();
    }

    for (const lote of salida.lotes_usados) {
      const compra = await Compra.findById(lote.compra);
      if (compra) {
        compra.cantidad_disponible += lote.cantidad_usada;
        await compra.save();
      }
    }

    await Salidas.findByIdAndDelete(salida._id);
  }

  return { message: "Lote eliminado correctamente" };
};

export const eliminarLoteSalidasPorIdCompleto = async (id_lote) => {
  const salidas = await Salidas.find({ id_lote });

  if (!salidas.length) {
    throw new Error("Lote no encontrado");
  }

  for (const salida of salidas) {
    const producto = await Product.findById(salida.producto);
    if (producto) {
      producto.salidas = Math.max(0, producto.salidas - salida.cantidad);
      await producto.save();
    }

    for (const lote of salida.lotes_usados) {
      const compra = await Compra.findById(lote.compra);
      if (compra) {
        compra.cantidad_disponible += lote.cantidad_usada;
        await compra.save();
      }
    }

    await Salidas.findByIdAndDelete(salida._id);
  }

  return { message: "Lote eliminado correctamente" };
};

export const actualizarSalidaIndividual = async (
  salidaId,
  datosActualizados
) => {
  const salida = await Salidas.findById(salidaId);
  if (!salida) throw new Error("Salida no encontrada");

  /* if (salida.cantidad_disponible < salida.cantidad) {
    throw new Error(
      "No se puede actualizar la salida porque ya fue parcialmente utilizada."
    );
  } */

  // Eliminar la salida original
  await eliminarSalidaPorId(salidaId);

  // Crear la nueva salida
  return await crearSalidas(datosActualizados, datosActualizados.user);
};
