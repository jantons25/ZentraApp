import {
  createEspacio,
  getEspacios,
  getEspacioById,
  updateEspacio,
  deleteEspacio,
} from "../services/espacio.service.js";

// Crear espacio
export const registrarEspacio = async (req, res) => {
  try {
    const resultado = await createEspacio(req.body);
    res.status(201).json(resultado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// Obtener todos los espacios
export const obtenerEspacios = async (req, res) => {
  try {
    const soloActivos = req.query.soloActivos === "true";
    const espacios = await getEspacios({ soloActivos });
    res.status(200).json(espacios);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener espacio por ID
export const obtenerEspacioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const espacio = await getEspacioById(id);
    res.status(200).json(espacio);
  } catch (error) {
    const status = error.message.includes("ID inválido")
      ? 400
      : error.message.includes("no encontrado")
      ? 404
      : 500;

    res.status(status).json({ mensaje: error.message });
  }
};

// Actualizar espacio
export const actualizarEspacio = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await updateEspacio(id, req.body);
    res.status(200).json(resultado);
  } catch (error) {
    const status = error.message.includes("ID inválido")
      ? 400
      : error.message.includes("no encontrado")
      ? 404
      : 400;

    res.status(status).json({ mensaje: error.message });
  }
};

// Eliminar espacio (soft delete)
export const eliminarEspacio = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await deleteEspacio(id);
    res.status(200).json(resultado);
  } catch (error) {
    const status = error.message.includes("ID inválido")
      ? 400
      : error.message.includes("no encontrado")
      ? 404
      : 400;

    res.status(status).json({ mensaje: error.message });
  }
};