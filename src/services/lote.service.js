import Lote from "../models/lote.model.js";
import Product from "../models/product.model.js";

function formatCodigo(n) {
  const s = String(n);
  const width = Math.max(3, s.length + 1);
  return s.padStart(width, "0");
}

async function generarSiguienteCodigo(userId) {
  const [ultimo] = await Lote.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        codigo: { $regex: /^\d+$/ },
      },
    },
    { $addFields: { codeNum: { $toInt: "$codigo" } } },
    { $sort: { codeNum: -1 } },
    { $limit: 1 },
  ]);

  const nextNum = (ultimo?.codeNum || 0) + 1;
  return formatCodigo(nextNum);
}

export const crearLote = async (data) => {
  try {
    // 1. Validacion: verificar que el producto exista
    const producto = await Product.findById(data.producto);
    if (!producto) {
      throw new Error("Producto no encontrado.");
    }

    // 2. Validacion: verificar que la cantidad sea un número positivo
    if (data.cantidad < 0) {
      throw new Error("La cantidad debe ser un número positivo.");
    }

    // 3. Generar código correlativo por usuario
    const codigo = await generarSiguienteCodigo(data.user);

    // 4. Crear el lote
    const nuevoLote = new Lote({
      codigo: codigo,
      producto: data.producto,
      cantidad: data.cantidad,
      fecha_vencimiento: data.fecha_vencimiento,
      estado: data.estado || "activo",
      user: data.user,
    });

    // 5. Guardar el lote en la base de datos
    await nuevoLote.save();

    // 6. Actualizar el stock del producto
    await Product.findByIdAndUpdate(
      data.producto,
      { $inc: { stock_total: data.cantidad } },
      { new: true }
    );

    // 7. Retornar el mensaje de lote creado
    return { message: "Lote creado correctamente."};
  } catch (error) {
    throw new Error(`Error al crear lote: ${error.message}`);
  }
};
