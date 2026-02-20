// controllers/velada.controller.js
import Velada from "../models/velada.model.js";
import {
  crearVelada,
  actualizarLoteVeladas,
  eliminarVeladaPorId,
  eliminarLoteVeladasPorId,
} from "../services/velada.service.js";

// GET /veladas
export const getVeladas = async (req, res) => {
  try {
    const veladas = await Velada.find().populate("user").populate("producto");

    res.status(200).json(veladas);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las veladas",
      error: error.message,
    });
  }
};

// POST /veladas
export const createVelada = async (req, res) => {
  try {
    // req.body puede ser una sola velada o un array
    const resultado = await crearVelada(req.body, req.user.id);

    // resultado = { message, veladas: [...] }
    res.status(201).json(resultado);
  } catch (error) {
    res.status(500).json({
      message: "Error al crear la velada",
      error: error.message,
    });
  }
};

// DELETE /veladas/:id
export const deleteVelada = async (req, res) => {
  try {
    const resultado = await eliminarVeladaPorId(req.params.id);
    res.status(200).json(resultado);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar la velada", error: error.message });
  }
};

// DELETE /veladas/lote/:id_lote
export const deleteLoteVeladas = async (req, res) => {
  try {
    const resultado = await eliminarLoteVeladasPorId(req.params.id_lote);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el lote de veladas",
      error: error.message,
    });
  }
};

// PUT /veladas/lote
export const updateLoteVeladas = async (req, res) => {
  try {
    // Soportamos ambos nombres por si en el frontend usas uno u otro
    const { ids, nuevasVeladas, veladas } = req.body;
    const payload = nuevasVeladas || veladas;

    if (!ids || !Array.isArray(ids) || !Array.isArray(payload)) {
      return res.status(400).json({
        message: "Datos inválidos: se esperaban 'ids' y un array de veladas",
      });
    }

    const resultado = await actualizarLoteVeladas(ids, payload, req.user.id);

    // resultado = { message, veladas: [...] }
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el lote de veladas",
      error: error.message,
    });
  }
};
