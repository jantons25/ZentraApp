import Reposiciones from "../models/reposicion.model.js";
import {
  eliminarLoteReposicionesPorId,
  eliminarReposicionPorId,
  actualizarLoteReposiciones,
  crearReposiciones,
} from "../services/reposicion.service.js";

export const getReposiciones = async (req, res) => {
  try {
    const reposiciones = await Reposiciones.find()
      .populate("user")
      .populate("producto");
    res.json(reposiciones);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al obtener las reposiciones",
        error: error.message,
      });
  }
};

export const createReposicion = async (req, res) => {
  try {
    const resultado = await crearReposiciones(req.body, req.user.id);
    res.status(201).json(resultado);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al crear la reposición", error: error.message });
  }
};

export const deleteReposicion = async (req, res) => {
  try {
    const resultado = await eliminarReposicionPorId(req.params.id);
    res.status(200).json(resultado);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al eliminar la reposición",
        error: error.message,
      });
  }
};

export const deleteLoteReposiciones = async (req, res) => {
  try {
    const resultado = await eliminarLoteReposicionesPorId(req.params.id_lote);
    res.status(200).json(resultado);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al eliminar el lote de reposiciones",
        error: error.message,
      });
  }
};

export const updateLoteReposiciones = async (req, res) => {
  try {
    const { ids, reposiciones } = req.body;
    const resultado = await actualizarLoteReposiciones(
      ids,
      reposiciones,
      req.user.id
    );
    res.status(200).json(resultado);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al actualizar el lote de reposiciones",
        error: error.message,
      });
  }
};
