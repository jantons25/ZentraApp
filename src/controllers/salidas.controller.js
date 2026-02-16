import {
  crearSalidas,
  actualizarLoteSalidas,
  eliminarSalidaPorId,
  eliminarLoteSalidasPorId,
  actualizarSalidaIndividual,
  eliminarLoteSalidasPorIdCompleto,
} from "../services/salidas.service.js";
import Salidas from "../models/salidas.model.js";

// Obtener solo salidas del usuario actual
export const getSalidas = async (req, res) => {
  try {
    const salidas = await Salidas.find({ user: req.user.id })
      .populate("user")
      .populate("producto")
      .select("-__v");
    res.json(salidas);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener las salidas", error: error.message });
  }
};

export const getAllSalidas = async (req, res) => {
  try {
    const salidas = await Salidas.find()
      .populate("user")
      .populate("producto")
      .select("-__v");
    res.json(salidas);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener las salidas", error: error.message });
  }
};

export const createSalida = async (req, res) => {
  try {
    const data = await crearSalidas(req.body, req.user.id);
    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al crear la salida", error: error.message });
  }
};

export const getSalida = async (req, res) => {
  try {
    const salida = await Salidas.findById(req.params.id)
      .populate("user")
      .populate("producto")
      .select("-__v");
    if (!salida)
      return res.status(404).json({ message: "Salida no registrada" });
    res.json(salida);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener la salida", error: error.message });
  }
};

export const deleteSalida = async (req, res) => {
  try {
    await eliminarSalidaPorId(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar la salida", error: error.message });
  }
};

export const deleteLoteSalida = async (req, res) => {
  try {
    const data = await eliminarLoteSalidasPorId(req.params.id_lote);
    res.status(200).json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar el lote", error: error.message });
  }
};

export const deleteLoteSalidaCompleta = async (req, res) => {
  try {
    const data = await eliminarLoteSalidasPorIdCompleto(req.params.id_lote);
    res.status(200).json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar el lote", error: error.message });
  }
};

export const updateSalida = async (req, res) => {
  try {
    const salidaActualizada = await actualizarSalidaIndividual(
      req.params.id,
      req.body
    );
    res.json(salidaActualizada);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar la salida", error: error.message });
  }
};

export const updateLoteSalidas = async (req, res) => {
  try {
    const { ids, nuevasSalidas } = req.body;
    const data = await actualizarLoteSalidas(ids, nuevasSalidas, req.user.id);
    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar el lote", error: error.message });
  }
};
