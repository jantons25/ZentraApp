// controllers/cortesia.controller.js
import Cortesia from "../models/cortesia.model.js";
import {
  crearCortesias,
  actualizarLoteCortesias,
  eliminarCortesiaPorId,
  eliminarLoteCortesiasPorId,
} from "../services/cortesia.service.js";

// GET /cortesias
export const getCortesias = async (req, res) => {
  try {
    const cortesias = await Cortesia.find()
      .populate("user")
      .populate("producto");

    res.status(200).json(cortesias);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las cortesías",
      error: error.message,
    });
  }
};

// POST /cortesias
export const createCortesia = async (req, res) => {
  try {
    // req.body puede ser una sola cortesía o un array
    const resultado = await crearCortesias(req.body, req.user.id);

    // resultado = { message, cortesias: [...] }
    res.status(201).json(resultado);
  } catch (error) {
    res.status(500).json({
      message: "Error al crear la cortesía",
      error: error.message,
    });
  }
};

// DELETE /cortesias/:id
export const deleteCortesia = async (req, res) => {
  try {
    const resultado = await eliminarCortesiaPorId(req.params.id);
    res.status(200).json(resultado);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar la cortesía", error: error.message });
  }
};

// DELETE /cortesias/lote/:id_lote
export const deleteLoteCortesias = async (req, res) => {
  try {
    const resultado = await eliminarLoteCortesiasPorId(req.params.id_lote);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el lote de cortesías",
      error: error.message,
    });
  }
};

// PUT /cortesias/lote
export const updateLoteCortesias = async (req, res) => {
  try {
    // Soportamos ambos nombres por si en el frontend usas uno u otro
    const { ids, nuevasCortesias, cortesias } = req.body;
    const payload = nuevasCortesias || cortesias;

    if (!ids || !Array.isArray(ids) || !Array.isArray(payload)) {
      return res.status(400).json({
        message: "Datos inválidos: se esperaban 'ids' y un array de cortesías",
      });
    }

    const resultado = await actualizarLoteCortesias(ids, payload, req.user.id);

    // resultado = { message, cortesias: [...] }
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el lote de cortesías",
      error: error.message,
    });
  }
};
