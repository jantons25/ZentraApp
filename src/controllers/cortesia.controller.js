import Cortesia from "../models/cortesia.model.js";
import {
  crearCortesias,
  actualizarLoteCortesias,
  actualizarCortesiaIndividual,
  eliminarCortesiaPorId,
  eliminarLoteCortesiasPorId,
} from "../services/cortesia.service.js";

export const getCortesias = async (req, res) => {
  try {
    const cortesias = await Cortesia.find({ sede: req.sede })
      .populate("user")
      .populate("producto");
    res.status(200).json(cortesias);
  } catch (error) {
    console.error("Error getCortesias:", error.message);
    res.status(500).json({ message: "Error al obtener las cortesías" });
  }
};

export const createCortesia = async (req, res) => {
  try {
    const resultado = await crearCortesias(req.body, req.user.id, req.sede);
    res.status(201).json(resultado);
  } catch (error) {
    console.error("Error createCortesia:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const deleteCortesia = async (req, res) => {
  try {
    const resultado = await eliminarCortesiaPorId(req.params.id, req.sede);
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error deleteCortesia:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const deleteLoteCortesias = async (req, res) => {
  try {
    const resultado = await eliminarLoteCortesiasPorId(req.params.id_lote, req.sede);
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error deleteLoteCortesias:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const updateCortesia = async (req, res) => {
  try {
    const cortesiaActualizada = await actualizarCortesiaIndividual(req.params.id, req.body, req.sede);
    res.json({ message: "Cortesía actualizada correctamente", cortesia: cortesiaActualizada });
  } catch (error) {
    console.error("Error updateCortesia:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const updateLoteCortesias = async (req, res) => {
  try {
    const { ids, nuevasCortesias, cortesias } = req.body;
    const payload = nuevasCortesias || cortesias;

    if (!ids || !Array.isArray(ids) || !Array.isArray(payload)) {
      return res.status(400).json({ message: "Datos inválidos: se esperaban 'ids' y un array de cortesías" });
    }

    const resultado = await actualizarLoteCortesias(ids, payload, req.user.id, req.sede);
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error updateLoteCortesias:", error.message);
    res.status(400).json({ message: error.message });
  }
};
