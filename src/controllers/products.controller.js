import {
  getProducts,
  createProduct,
  getProductById,
  deleteProductById,
  updateProductById,
} from "../services/product.service.js";

export const createNewProduct = async (req, res) => {
  try {
    const product = await createProduct(req.body, req.user.id, req.user.sede);
    res.status(201).json(product);
  } catch (error) {
    console.error("Error createProduct:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const getProductos = async (req, res) => {
  try {
    const products = await getProducts(req.user.sede);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error getProductos:", error.message);
    res.status(404).json({ message: error.message });
  }
};

export const getProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);
    res.status(200).json(product);
  } catch (error) {
    console.error("Error getProductoPorId:", error.message);
    res.status(404).json({ message: "Producto no encontrado" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await updateProductById(id, req.body);
    res.status(200).json(product);
  } catch (error) {
    console.error("Error updateProduct:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteProductById(id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleteProduct:", error.message);
    res.status(400).json({ message: error.message });
  }
};
