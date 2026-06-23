import {
  obtenerNovedades,
  obtenerNovedadPorId,
  crearNovedad,
  actualizarNovedad,
  eliminarNovedad,
} from "../services/novedades.service.js";

export const getNovedades = async (req, res) => {
  try {
    const { tipo, estado, usuario, busqueda } = req.query;
    const novedades = await obtenerNovedades(req.sede, { tipo, estado, usuario, busqueda });
    res.status(200).json(novedades);
  } catch (error) {
    console.error("Error getNovedades:", error.message);
    res.status(500).json({ message: "Error al obtener las novedades" });
  }
};

export const getNovedad = async (req, res) => {
  try {
    const novedad = await obtenerNovedadPorId(req.params.id);
    res.status(200).json(novedad);
  } catch (error) {
    console.error("Error getNovedad:", error.message);
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

export const createNovedad = async (req, res) => {
  try {
    const resultado = await crearNovedad(req.body, req.user.id, req.sede);
    res.status(201).json(resultado);
  } catch (error) {
    console.error("Error createNovedad:", error.message);
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

export const updateNovedad = async (req, res) => {
  try {
    const resultado = await actualizarNovedad(req.params.id, req.body, req.user);
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error updateNovedad:", error.message);
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

export const deleteNovedad = async (req, res) => {
  try {
    const resultado = await eliminarNovedad(req.params.id, req.user);
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error deleteNovedad:", error.message);
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};
