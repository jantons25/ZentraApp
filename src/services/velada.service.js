import Velada from "../models/velada.model.js";
import Salida from "../models/salidas.model.js";
import Product from "../models/product.model.js";
import { generarIdLote, consumirStockFIFO, revertirConsumoSalidas } from "../utils/stockOperations.js";

export const crearVelada = async (veladaInput, userId, sede) => {
  const veladas = Array.isArray(veladaInput) ? veladaInput : [veladaInput];
  if (veladas.length === 0) throw new Error("No se proporcionó información de velada");

  const nuevoIdLote = await generarIdLote("velada", null, (id) => Velada.exists({ id_lote: id }));
  const veladasGuardadas = [];

  for (const veladaData of veladas) {
    const { cantidad, responsable, observacion, producto } = veladaData;

    if (cantidad == null || isNaN(cantidad) || cantidad <= 0 || !producto) {
      throw new Error("Datos inválidos para velada: cantidad y producto son obligatorios.");
    }

    const lotes_veladas = await consumirStockFIFO(Salida, producto, Number(cantidad), sede);

    const nuevaVelada = new Velada({
      id_lote: nuevoIdLote,
      producto,
      cantidad: Number(cantidad),
      responsable: responsable ?? "",
      observacion: observacion ?? "",
      lotes_veladas,
      user: userId,
      sede: sede || "",
    });

    const veladaGuardada = await nuevaVelada.save();
    veladasGuardadas.push(veladaGuardada);

    const productDB = await Product.findById(producto);
    if (productDB) {
      productDB.cantidad_velada = Math.max(0, (productDB.cantidad_velada || 0) + Number(cantidad));
      await productDB.save();
    }
  }

  return {
    message: veladas.length > 1
      ? `Veladas creadas exitosamente con id_lote ${nuevoIdLote}`
      : `Velada creada exitosamente con id_lote ${nuevoIdLote}`,
    veladas: veladasGuardadas,
  };
};

export const actualizarLoteVeladas = async (ids, nuevasVeladas, userId, sede) => {
  if (!Array.isArray(ids) || !Array.isArray(nuevasVeladas)) {
    throw new Error("Datos inválidos: se esperaban arrays.");
  }

  const veladasAntiguas = await Velada.find({ _id: { $in: ids } });
  if (!veladasAntiguas.length) throw new Error("No se encontraron veladas para actualizar.");

  // Validar nuevas veladas antes de modificar nada
  for (const velada of nuevasVeladas) {
    const { cantidad, producto } = velada;
    if (cantidad == null || isNaN(cantidad) || cantidad <= 0 || !producto) {
      throw new Error("Datos inválidos para la nueva velada.");
    }
  }

  const id_lote = veladasAntiguas[0]?.id_lote || String(Date.now());

  for (const velada of veladasAntiguas) {
    if (Array.isArray(velada.lotes_veladas)) {
      await revertirConsumoSalidas(Salida, velada.lotes_veladas);
    }

    const producto = await Product.findById(velada.producto);
    if (producto) {
      producto.cantidad_velada = Math.max(0, (producto.cantidad_velada || 0) - Number(velada.cantidad || 0));
      await producto.save();
    }

    await Velada.findByIdAndDelete(velada._id);
  }

  const veladasCreadas = [];

  for (const velada of nuevasVeladas) {
    const { cantidad, responsable, observacion, producto } = velada;

    if (cantidad == null || isNaN(cantidad) || cantidad <= 0 || !producto) {
      throw new Error("Datos inválidos para la nueva velada.");
    }

    const lotes_veladas = await consumirStockFIFO(Salida, producto, Number(cantidad), sede);

    const nueva = new Velada({
      id_lote, producto,
      cantidad: Number(cantidad),
      responsable: responsable ?? "",
      observacion: observacion ?? "",
      user: userId,
      lotes_veladas,
      sede: sede || "",
    });

    const guardada = await nueva.save();
    veladasCreadas.push(guardada);

    const productoDB = await Product.findById(producto);
    if (productoDB) {
      productoDB.cantidad_velada = Math.max(0, (productoDB.cantidad_velada || 0) + Number(cantidad));
      await productoDB.save();
    }
  }

  return { message: "Lote de veladas actualizado correctamente", veladas: veladasCreadas };
};

export const eliminarVeladaPorId = async (veladaId) => {
  const velada = await Velada.findById(veladaId);
  if (!velada) throw new Error("Velada no encontrada");

  if (Array.isArray(velada.lotes_veladas)) {
    await revertirConsumoSalidas(Salida, velada.lotes_veladas);
  }

  const producto = await Product.findById(velada.producto);
  if (!producto) throw new Error("Producto no encontrado");

  producto.cantidad_velada = Math.max(0, Number(producto.cantidad_velada || 0) - Number(velada.cantidad || 0));
  await producto.save();

  await Velada.findByIdAndDelete(veladaId);
  return { message: "Velada eliminada correctamente" };
};

export const actualizarVeladaIndividual = async (veladaId, nuevosDatos) => {
  const velada = await Velada.findById(veladaId);
  if (!velada) throw new Error("Velada no encontrada");

  const nuevaCantidad = nuevosDatos.cantidad ?? velada.cantidad;

  if (nuevaCantidad == null || isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
    throw new Error("Cantidad debe ser mayor a 0.");
  }

  if (Number(nuevaCantidad) !== Number(velada.cantidad)) {
    // Revertir el consumo original y volver a consumir FIFO con la nueva cantidad,
    // para mantener consistentes salidas, kardex y cantidad_velada del producto
    if (velada.lotes_veladas?.length) {
      await revertirConsumoSalidas(Salida, velada.lotes_veladas);
    }

    let nuevosLotes;
    try {
      nuevosLotes = await consumirStockFIFO(
        Salida,
        velada.producto,
        Number(nuevaCantidad),
        velada.sede
      );
    } catch (error) {
      // Restaurar el consumo original para no dejar el stock inconsistente
      const restaurados = await consumirStockFIFO(
        Salida,
        velada.producto,
        Number(velada.cantidad),
        velada.sede
      );
      velada.lotes_veladas = restaurados;
      await velada.save();
      throw error;
    }

    velada.lotes_veladas = nuevosLotes;

    const producto = await Product.findById(velada.producto);
    if (producto) {
      producto.cantidad_velada = Math.max(
        0,
        Number(producto.cantidad_velada || 0) -
          Number(velada.cantidad) +
          Number(nuevaCantidad)
      );
      await producto.save();
    }
  }

  velada.cantidad = Number(nuevaCantidad);
  if (nuevosDatos.responsable != null) velada.responsable = nuevosDatos.responsable;
  if (nuevosDatos.observacion != null) velada.observacion = nuevosDatos.observacion;

  const guardada = await velada.save();
  await guardada.populate(["producto", "user"]);

  return guardada;
};

export const eliminarLoteVeladasPorId = async (id_lote) => {
  const veladas = await Velada.find({ id_lote });
  if (!veladas.length) throw new Error("Lote de veladas no encontrado");

  for (const velada of veladas) {
    if (Array.isArray(velada.lotes_veladas)) {
      await revertirConsumoSalidas(Salida, velada.lotes_veladas);
    }

    const producto = await Product.findById(velada.producto);
    if (producto) {
      producto.cantidad_velada = Math.max(0, (producto.cantidad_velada || 0) - Number(velada.cantidad || 0));
      await producto.save();
    }

    await Velada.findByIdAndDelete(velada._id);
  }

  return { message: "Lote de veladas eliminado correctamente" };
};
