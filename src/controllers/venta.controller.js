import Venta from "../models/venta.model.js";
import {
  crearVentas,
  actualizarLoteVentas,
  eliminarVentaPorId,
  eliminarLoteVentasPorId,
} from "../services/venta.service.js";

export const getVentas = async (req, res) => {
  try {
    const ventas = await Venta.find({
      user: req.user.id,
    })
      .populate("user")
      .populate("producto");
    res.json(ventas);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener las ventas", error: error.message });
  }
};

export const getAllVentas = async (req, res) => {
  try {
    const ventas = await Venta.find().populate("user").populate("producto");
    res.json(ventas);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener las ventas", error: error.message });
  }
};

export const createVenta = async (req, res) => {
  try {
    const resultado = await crearVentas(req.body, req.user.id);
    res.status(201).json(resultado);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al crear la venta", error: error.message });
  }
};

export const getVenta = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
      .populate("user")
      .populate("producto");
    if (!venta) return res.status(404).json({ message: "Venta no encontrada" });
    res.json(venta);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener la venta", error: error.message });
  }
};

export const deleteVenta = async (req, res) => {
  try {
    const resultado = await eliminarVentaPorId(req.params.id);
    res.status(200).json(resultado);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar venta", error: error.message });
  }
};

export const deleteLoteVentas = async (req, res) => {
  try {
    const resultado = await eliminarLoteVentasPorId(req.params.id_lote);
    res.status(200).json(resultado);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al eliminar lote de ventas",
        error: error.message,
      });
  }
};

export const updateVenta = async (req, res) => {
  try {
    const { ids, nuevasVentas } = req.body;
    const resultado = await actualizarLoteVentas(
      ids,
      nuevasVentas,
      req.user.id
    );
    res.json(resultado);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al actualizar las ventas",
        error: error.message,
      });
  }
};
