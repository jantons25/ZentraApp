import Velada from "../models/velada.model.js";
import {
  crearVelada,
  actualizarLoteVeladas,
  actualizarVeladaIndividual,
  eliminarVeladaPorId,
  eliminarLoteVeladasPorId,
} from "../services/velada.service.js";

export const getVeladas = async (req, res) => {
  try {
    const veladas = await Velada.find({ sede: req.user.sede })
      .populate("user")
      .populate("producto");
    res.status(200).json(veladas);
  } catch (error) {
    console.error("Error getVeladas:", error.message);
    res.status(500).json({ message: "Error al obtener las veladas" });
  }
};

export const createVelada = async (req, res) => {
  try {
    const resultado = await crearVelada(req.body, req.user.id, req.user.sede);
    res.status(201).json(resultado);
  } catch (error) {
    console.error("Error createVelada:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const deleteVelada = async (req, res) => {
  try {
    const resultado = await eliminarVeladaPorId(req.params.id, req.user.sede);
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error deleteVelada:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const deleteLoteVeladas = async (req, res) => {
  try {
    const resultado = await eliminarLoteVeladasPorId(req.params.id_lote, req.user.sede);
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error deleteLoteVeladas:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const updateVelada = async (req, res) => {
  try {
    const veladaActualizada = await actualizarVeladaIndividual(req.params.id, req.body, req.user.sede);
    res.json({ message: "Velada actualizada correctamente", velada: veladaActualizada });
  } catch (error) {
    console.error("Error updateVelada:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const updateLoteVeladas = async (req, res) => {
  try {
    const { ids, nuevasVeladas, veladas } = req.body;
    const payload = nuevasVeladas || veladas;

    if (!ids || !Array.isArray(ids) || !Array.isArray(payload)) {
      return res.status(400).json({ message: "Datos inválidos: se esperaban 'ids' y un array de veladas" });
    }

    const resultado = await actualizarLoteVeladas(ids, payload, req.user.id, req.user.sede);
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error updateLoteVeladas:", error.message);
    res.status(400).json({ message: error.message });
  }
};
