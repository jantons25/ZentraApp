import Venta from "../models/venta.model.js";
import {
  crearVentas,
  actualizarLoteVentas,
  eliminarVentaPorId,
  eliminarLoteVentasPorId,
  actualizarVentaIndividual,
} from "../services/venta.service.js";

export const getVentas = async (req, res) => {
  try {
    const ventas = await Venta.find({
      user: req.user.id,
      sede: req.user.sede,
    })
      .populate("user")
      .populate("producto");
    res.json(ventas);
  } catch (error) {
    console.error("Error getVentas:", error.message);
    res.status(500).json({ message: "Error al obtener las ventas" });
  }
};

export const getAllVentas = async (req, res) => {
  try {
    const ventas = await Venta.find({ sede: req.user.sede })
      .populate("user")
      .populate("producto");
    res.json(ventas);
  } catch (error) {
    console.error("Error getAllVentas:", error.message);
    res.status(500).json({ message: "Error al obtener las ventas" });
  }
};

export const createVenta = async (req, res) => {
  try {
    const resultado = await crearVentas(req.body, req.user.id, req.user.sede);
    res.status(201).json(resultado);
  } catch (error) {
    console.error("Error createVenta:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const getVenta = async (req, res) => {
  try {
    const venta = await Venta.findOne({ _id: req.params.id, sede: req.user.sede })
      .populate("user")
      .populate("producto");
    if (!venta) return res.status(404).json({ message: "Venta no encontrada" });
    res.json(venta);
  } catch (error) {
    console.error("Error getVenta:", error.message);
    res.status(500).json({ message: "Error al obtener la venta" });
  }
};

export const deleteVenta = async (req, res) => {
  try {
    const resultado = await eliminarVentaPorId(req.params.id, req.user.sede);
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error deleteVenta:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const deleteLoteVentas = async (req, res) => {
  try {
    const resultado = await eliminarLoteVentasPorId(req.params.id_lote, req.user.sede);
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error deleteLoteVentas:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const updateVentaById = async (req, res) => {
  try {
    const ventaActualizada = await actualizarVentaIndividual(req.params.id, req.body, req.user.sede);
    res.json({ message: "Venta actualizada correctamente", venta: ventaActualizada });
  } catch (error) {
    console.error("Error updateVentaById:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const updateVenta = async (req, res) => {
  try {
    const { ids, nuevasVentas } = req.body;
    const resultado = await actualizarLoteVentas(ids, nuevasVentas, req.user.id, req.user.sede);
    res.json(resultado);
  } catch (error) {
    console.error("Error updateVenta:", error.message);
    res.status(400).json({ message: error.message });
  }
};
