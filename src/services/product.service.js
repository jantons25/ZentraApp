import Product from "../models/product.model.js";
import Compra from "../models/compra.model.js";

export const getProducts = async () => {
  try {
    //1. Obtener todos los productos ordenados por nombre
    const products = await Product.find().sort({ nombre: 1 }).populate("user");

    //2. Verificar si se encontraron productos
    if (!products.length) {
      throw new Error("No se encontraron productos.");
    }

    //3. Retornar los productos encontrados
    return products;
  } catch (error) {
    throw new Error(`Error al obtener productos: ${error.message}`);
  }
};

export const createProduct = async (data, userId) => {
  try {
    //1. Validación: evitar duplicados por nombre
    const productoExistente = await Product.findOne({
      nombre: data.nombre.trim(),
    });
    if (productoExistente) {
      throw new Error("Ya existe un producto con ese nombre.");
    }

    //2. Crear el producto
    const nuevoProducto = new Product({
      codigo: data.codigo,
      nombre: data.nombre,
      descripcion: data.descripcion,
      categoria: data.categoria,
      unidad: data.unidad,
      stock_mininmo: data.stock_minimo,
      punto_reorden: data.punto_reorden,
      precio_venta: data.precio_venta,
      estado: data.estado || "activo",
      user: userId,
    });

    const saved = await nuevoProducto.save();

    // 3. DEVOLVER TAMBIÉN EL PRODUCTO CREADO
    return { message: "Producto creado correctamente.", product: saved };
  } catch (error) {
    throw new Error(`Error al crear producto: ${error.message}`);
  }
};

export const getProductById = async (id) => {
  try {
    //1. Validación: verificar que el ID sea válido
    const producto = await Product.findById(id);
    if (!producto) {
      throw new Error("Producto no encontrado.");
    }

    //2. Retornar el producto encontrado
    return producto;
  } catch (error) {
    throw new Error(`Error al obtener producto por ID: ${error.message}`);
  }
};

export const deleteProductById = async (id) => {
  try {
    //1. Validación: verificar que el ID sea válido y que el producto exista
    const producto = await Product.findById(id);
    if (!producto) {
      throw new Error("Producto no encontrado.");
    }

    //2. Cambiar de estado a inactivo si tiene compras asociadas
    const comprasAsociadas = await Compra.findOne({ producto: id });
    if (comprasAsociadas) {
      producto.estado = "inactivo";
      await producto.save();
    } else {
      //3. Eliminar el producto si no tiene compras asociadas
      await Product.findByIdAndDelete(id);
    }

    //4. Retornar el mensaje de producto eliminado
    return { message: "Producto eliminado correctamente." };
  } catch (error) {
    throw new Error(`Error al eliminar producto: ${error.message}`);
  }
};

export const updateProductById = async (id, data) => {
  try {
    //1. Validación: verificar que el ID sea válido y que el producto exista
    const producto = await Product.findById(id);
    if (!producto) {
      throw new Error("Producto no encontrado.");
    }

    //2. Validación opcional: evitar duplicados por nombre al actualizar
    if (data.nombre) {
      const productoExistente = await Product.findOne({
        nombre: data.nombre.trim(),
        _id: { $ne: id }, // Excluir el producto actual
      });
      if (productoExistente) {
        throw new Error("Ya existe un producto con ese nombre.");
      }
    }

    //3. Guardar los cambios en el producto
    const updated = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    //4. Retornar el mensaje de producto actualizado
    return { message: "Producto actualizado correctamente.", product: updated };
  } catch (error) {
    throw new Error(`Error al actualizar producto: ${error.message}`);
  }
};
