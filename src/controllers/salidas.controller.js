import {
  crearSalidas,
  actualizarLoteSalidas,
  eliminarSalidaPorId,
  eliminarLoteSalidasPorId,
  actualizarSalidaIndividual,
  eliminarLoteSalidasPorIdCompleto,
} from "../services/salidas.service.js";
import Salidas from "../models/salidas.model.js";

export const getSalidas = async (req, res) => {
  try {
    const salidas = await Salidas.find({ user: req.user.id, sede: req.sede })
      .populate("user")
      .populate("producto")
      .select("-__v");
    res.json(salidas);
  } catch (error) {
    console.error("Error getSalidas:", error.message);
    res.status(500).json({ message: "Error al obtener las salidas" });
  }
};

export const getAllSalidas = async (req, res) => {
  try {
    const salidas = await Salidas.find({ sede: req.sede })
      .populate("user")
      .populate("producto")
      .select("-__v");
    res.json(salidas);
  } catch (error) {
    console.error("Error getAllSalidas:", error.message);
    res.status(500).json({ message: "Error al obtener las salidas" });
  }
};

export const createSalida = async (req, res) => {
  try {
    const data = await crearSalidas(req.body, req.user.id, req.sede);
    res.json(data);
  } catch (error) {
    console.error("Error createSalida:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const getSalida = async (req, res) => {
  try {
    const salida = await Salidas.findOne({ _id: req.params.id, sede: req.sede })
      .populate("user")
      .populate("producto")
      .select("-__v");
    if (!salida) return res.status(404).json({ message: "Salida no registrada" });
    res.json(salida);
  } catch (error) {
    console.error("Error getSalida:", error.message);
    res.status(500).json({ message: "Error al obtener la salida" });
  }
};

export const deleteSalida = async (req, res) => {
  try {
    await eliminarSalidaPorId(req.params.id, req.sede);
    res.json({ message: "Salida eliminada correctamente" });
  } catch (error) {
    console.error("Error deleteSalida:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const deleteLoteSalida = async (req, res) => {
  try {
    const data = await eliminarLoteSalidasPorId(req.params.id_lote, req.sede);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error deleteLoteSalida:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const deleteLoteSalidaCompleta = async (req, res) => {
  try {
    const data = await eliminarLoteSalidasPorIdCompleto(req.params.id_lote, req.sede);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error deleteLoteSalidaCompleta:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const updateSalida = async (req, res) => {
  try {
    const salidaActualizada = await actualizarSalidaIndividual(req.params.id, req.body, req.sede);
    res.json(salidaActualizada);
  } catch (error) {
    console.error("Error updateSalida:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const updateLoteSalidas = async (req, res) => {
  try {
    const { ids, nuevasSalidas } = req.body;
    const data = await actualizarLoteSalidas(ids, nuevasSalidas, req.user.id, req.sede);
    res.json(data);
  } catch (error) {
    console.error("Error updateLoteSalidas:", error.message);
    res.status(400).json({ message: error.message });
  }
};
