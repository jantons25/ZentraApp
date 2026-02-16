import {
  getProducts,
  createProduct,
  getProductById,
  deleteProductById,
  updateProductById,
} from "../services/product.service.js";

//crear producto
export const createNewProduct = async (req, res) => {
  try {
    const product = await createProduct(req.body, req.user.id);
    res.status(201).json(product);
  } catch (error) {
    res
      .status(400)
      .json({
        message: "Error al registrar el producto",
        error: error.message,
      });
  }
};

//Obtener todos los productos
export const getProductos = async (req, res) => {
  try {
    const products = await getProducts();
    res.status(200).json(products);
  } catch (error) {
    res
      .status(404)
      .json({
        message: "Error al obtener los productos",
        error: error.message,
      });
  }
};

//Obtener producto por ID
export const getProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);
    res.status(200).json(product);
  } catch (error) {
    res
      .status(404)
      .json({ message: "Producto no encontrado", error: error.message });
  }
};

//Actualizar producto
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await updateProductById(id, req.body);
    res.status(200).json(product);
  } catch (error) {
    res
      .status(400)
      .json({
        message: "Error al actualizar el producto",
        error: error.message,
      });
  }
};

//Eliminar producto
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteProductById(id);
    res.status(204).json(result);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error al eliminar el producto", error: error.message });
  }
};
