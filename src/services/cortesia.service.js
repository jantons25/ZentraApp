import Cortesia from "../models/cortesia.model.js";
import Salida from "../models/salidas.model.js";
import Product from "../models/product.model.js";
import { generarIdLote, consumirStockFIFO, revertirConsumoSalidas } from "../utils/stockOperations.js";

export const crearCortesias = async (cortesiasInput, userId, sede) => {
  const cortesias = Array.isArray(cortesiasInput) ? cortesiasInput : [cortesiasInput];
  if (cortesias.length === 0) throw new Error("No se proporcionaron cortesías válidas.");

  const nuevoIdLote = await generarIdLote("cortesia", null, (id) => Cortesia.exists({ id_lote: id }));
  const cortesiasGuardadas = [];

  for (const cortesia of cortesias) {
    const { cantidad, responsable, observacion, producto } = cortesia;

    if (cantidad == null || isNaN(cantidad) || cantidad <= 0 || !producto) {
      throw new Error("Datos inválidos para la cortesía.");
    }

    const lotes_cortesias = await consumirStockFIFO(Salida, producto, Number(cantidad), sede);

    const nuevaCortesia = new Cortesia({
      id_lote: nuevoIdLote,
      producto,
      cantidad: Number(cantidad),
      responsable: responsable ?? "",
      observacion: observacion ?? "",
      user: userId,
      lotes_cortesias,
      sede: sede || "",
    });

    const cortesiaGuardada = await nuevaCortesia.save();
    cortesiasGuardadas.push(cortesiaGuardada);

    const productoDB = await Product.findById(producto);
    if (productoDB) {
      productoDB.cantidad_cortesia = Math.max(0, (productoDB.cantidad_cortesia || 0) + Number(cantidad));
      await productoDB.save();
    }
  }

  return {
    message: cortesias.length > 1
      ? "Cortesías registradas exitosamente"
      : "Cortesía registrada exitosamente",
    cortesias: cortesiasGuardadas,
  };
};

export const actualizarLoteCortesias = async (ids, nuevasCortesias, userId, sede) => {
  if (!Array.isArray(ids) || !Array.isArray(nuevasCortesias)) {
    throw new Error("Datos inválidos: se esperaban arrays.");
  }

  const cortesiasAntiguas = await Cortesia.find({ _id: { $in: ids } });
  if (!cortesiasAntiguas.length) throw new Error("No se encontraron cortesías para actualizar.");

  // Validar nuevas cortesías antes de modificar nada
  for (const cort of nuevasCortesias) {
    const { cantidad, producto } = cort;
    if (cantidad == null || isNaN(cantidad) || cantidad <= 0 || !producto) {
      throw new Error("Datos inválidos para la nueva cortesía.");
    }
  }

  const id_lote = cortesiasAntiguas[0]?.id_lote || String(Date.now());

  for (const cort of cortesiasAntiguas) {
    if (Array.isArray(cort.lotes_cortesias)) {
      await revertirConsumoSalidas(Salida, cort.lotes_cortesias);
    }

    const producto = await Product.findById(cort.producto);
    if (producto) {
      producto.cantidad_cortesia = Math.max(0, (producto.cantidad_cortesia || 0) - Number(cort.cantidad || 0));
      await producto.save();
    }

    await Cortesia.findByIdAndDelete(cort._id);
  }

  const cortesiasCreadas = [];

  for (const cort of nuevasCortesias) {
    const { cantidad, responsable, observacion, producto } = cort;

    if (cantidad == null || isNaN(cantidad) || cantidad <= 0 || !producto) {
      throw new Error("Datos inválidos para la nueva cortesía.");
    }

    const lotes_cortesias = await consumirStockFIFO(Salida, producto, Number(cantidad), sede);

    const nueva = new Cortesia({
      id_lote, producto,
      cantidad: Number(cantidad),
      responsable: responsable ?? "",
      observacion: observacion ?? "",
      user: userId,
      lotes_cortesias,
      sede: sede || "",
    });

    const guardada = await nueva.save();
    cortesiasCreadas.push(guardada);

    const productoDB = await Product.findById(producto);
    if (productoDB) {
      productoDB.cantidad_cortesia = Math.max(0, (productoDB.cantidad_cortesia || 0) + Number(cantidad));
      await productoDB.save();
    }
  }

  return { message: "Lote de cortesías actualizado correctamente", cortesias: cortesiasCreadas };
};

export const eliminarCortesiaPorId = async (cortesiaId) => {
  const cortesia = await Cortesia.findById(cortesiaId);
  if (!cortesia) throw new Error("Cortesía no encontrada");

  if (Array.isArray(cortesia.lotes_cortesias)) {
    await revertirConsumoSalidas(Salida, cortesia.lotes_cortesias);
  }

  const producto = await Product.findById(cortesia.producto);
  if (!producto) throw new Error("Producto no encontrado");

  producto.cantidad_cortesia = Math.max(0, Number(producto.cantidad_cortesia || 0) - Number(cortesia.cantidad || 0));
  await producto.save();

  await Cortesia.findByIdAndDelete(cortesiaId);
  return { message: "Cortesía eliminada correctamente" };
};

export const actualizarCortesiaIndividual = async (cortesiaId, nuevosDatos) => {
  const cortesia = await Cortesia.findById(cortesiaId);
  if (!cortesia) throw new Error("Cortesía no encontrada");

  const nuevaCantidad = nuevosDatos.cantidad ?? cortesia.cantidad;

  if (nuevaCantidad <= 0) {
    throw new Error("Cantidad debe ser mayor a 0.");
  }

  const cortesiaActualizada = await Cortesia.findByIdAndUpdate(
    cortesiaId,
    {
      ...nuevosDatos,
      cantidad: nuevaCantidad,
    },
    { new: true }
  );

  return cortesiaActualizada;
};

export const eliminarLoteCortesiasPorId = async (id_lote) => {
  const cortesias = await Cortesia.find({ id_lote });
  if (!cortesias.length) throw new Error("Lote de cortesías no encontrado");

  for (const cortesia of cortesias) {
    if (Array.isArray(cortesia.lotes_cortesias)) {
      await revertirConsumoSalidas(Salida, cortesia.lotes_cortesias);
    }

    const producto = await Product.findById(cortesia.producto);
    if (producto) {
      producto.cantidad_cortesia = Math.max(0, (producto.cantidad_cortesia || 0) - Number(cortesia.cantidad || 0));
      await producto.save();
    }

    await Cortesia.findByIdAndDelete(cortesia._id);
  }

  return { message: "Lote de cortesías eliminado correctamente" };
};
