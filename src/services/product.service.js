import Product from "../models/product.model.js";
import Compra from "../models/compra.model.js";

export const getProducts = async (sede) => {
  const query = { sede };
  const products = await Product.find(query).sort({ nombre: 1 }).populate("user");

  if (!products.length) {
    throw new Error("No se encontraron productos.");
  }

  return products;
};

export const createProduct = async (data, userId, sede) => {
  const productoExistente = await Product.findOne({
    nombre: data.nombre.trim(),
    sede: sede || "",
  });
  if (productoExistente) {
    throw new Error("Ya existe un producto con ese nombre en esta sede.");
  }

  const nuevoProducto = new Product({
    codigo: data.codigo,
    nombre: data.nombre,
    descripcion: data.descripcion,
    categoria: data.categoria,
    unidad: data.unidad,
    stock_minimo: data.stock_minimo,
    punto_reorden: data.punto_reorden,
    precio_venta: data.precio_venta,
    estado: data.estado || "activo",
    user: userId,
    sede: sede || "",
  });

  const saved = await nuevoProducto.save();
  return { message: "Producto creado correctamente.", product: saved };
};

export const getProductById = async (id, sede) => {
  const producto = await Product.findOne({ _id: id, sede });
  if (!producto) {
    throw new Error("Producto no encontrado.");
  }
  return producto;
};

export const deleteProductById = async (id, sede) => {
  const producto = await Product.findOne({ _id: id, sede });
  if (!producto) {
    throw new Error("Producto no encontrado.");
  }

  const comprasAsociadas = await Compra.findOne({ producto: id });
  if (comprasAsociadas) {
    producto.estado = "inactivo";
    await producto.save();
  } else {
    await Product.findByIdAndDelete(id);
  }

  return { message: "Producto eliminado correctamente." };
};

export const updateProductById = async (id, data, sede) => {
  const producto = await Product.findOne({ _id: id, sede });
  if (!producto) {
    throw new Error("Producto no encontrado.");
  }

  if (data.nombre) {
    const productoExistente = await Product.findOne({
      nombre: data.nombre.trim(),
      sede: producto.sede,
      _id: { $ne: id },
    });
    if (productoExistente) {
      throw new Error("Ya existe un producto con ese nombre.");
    }
  }

  const updated = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  return { message: "Producto actualizado correctamente.", product: updated };
};
