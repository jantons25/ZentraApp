import Reposiciones from "../models/reposicion.model.js";
import {
  eliminarLoteReposicionesPorId,
  eliminarReposicionPorId,
  actualizarLoteReposiciones,
  actualizarReposicionIndividual,
  crearReposiciones,
} from "../services/reposicion.service.js";

export const getReposiciones = async (req, res) => {
  try {
    const reposiciones = await Reposiciones.find({ sede: req.sede })
      .populate("user")
      .populate("producto");
    res.json(reposiciones);
  } catch (error) {
    console.error("Error getReposiciones:", error.message);
    res.status(500).json({ message: "Error al obtener las reposiciones" });
  }
};

export const createReposicion = async (req, res) => {
  try {
    const resultado = await crearReposiciones(req.body, req.user.id, req.sede);
    res.status(201).json(resultado);
  } catch (error) {
    console.error("Error createReposicion:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const deleteReposicion = async (req, res) => {
  try {
    const resultado = await eliminarReposicionPorId(req.params.id, req.sede);
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error deleteReposicion:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const deleteLoteReposiciones = async (req, res) => {
  try {
    const resultado = await eliminarLoteReposicionesPorId(req.params.id_lote, req.sede);
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error deleteLoteReposiciones:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const updateReposicion = async (req, res) => {
  try {
    const reposicionActualizada = await actualizarReposicionIndividual(req.params.id, req.body, req.sede);
    res.json({ message: "Reposición actualizada correctamente", reposicion: reposicionActualizada });
  } catch (error) {
    console.error("Error updateReposicion:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const updateLoteReposiciones = async (req, res) => {
  try {
    const { ids, reposiciones } = req.body;
    const resultado = await actualizarLoteReposiciones(ids, reposiciones, req.user.id, req.sede);
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error updateLoteReposiciones:", error.message);
    res.status(400).json({ message: error.message });
  }
};
