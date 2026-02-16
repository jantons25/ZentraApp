import {
  crearCategoria,
  getCategorias,
  getCategoriaById,
  updateCategoria,
  deleteCategoria,
} from "../services/categoria.service.js";

//Crear Cliente
export const registrarCategoria = async (req, res) => {
  try {
    const resultado = await crearCategoria(req.body);
    res.status(201).json(resultado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

//Obtener todas las categorías
export const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await getCategorias();
    res.status(200).json(categorias);
  } catch (error) {
    res.status(404).json({ mensaje: error.message });
  }
};

//Obtener categoría por ID
export const obtenerCategoriaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await getCategoriaById(id);
    res.status(200).json(categoria);
  } catch (error) {
    res.status(404).json({ mensaje: error.message });
  }
};

//Eliminar categoría
export const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await deleteCategoria(id);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};
