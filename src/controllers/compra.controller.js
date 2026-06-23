import Compra from "../models/compra.model.js";
import {
  crearCompras,
  actualizarLoteCompras,
  eliminarCompraPorId,
  actualizarCompraIndividual,
  eliminarLoteComprasPorId,
} from "../services/compra.service.js";

export const getCompras = async (req, res) => {
  try {
    const compras = await Compra.find({ user: req.user.id, sede: req.sede })
      .populate("user")
      .populate("producto");
    res.json(compras);
  } catch (error) {
    console.error("Error getCompras:", error.message);
    res.status(500).json({ message: "Error al obtener las compras" });
  }
};

export const getAllCompras = async (req, res) => {
  try {
    const compras = await Compra.find({ sede: req.sede })
      .populate("user")
      .populate("producto");
    res.json(compras);
  } catch (error) {
    console.error("Error getAllCompras:", error.message);
    res.status(500).json({ message: "Error al obtener las compras" });
  }
};

export const createCompra = async (req, res) => {
  try {
    const resultado = await crearCompras(req.body, req.user.id, req.sede);
    res.status(201).json(resultado);
  } catch (error) {
    console.error("Error createCompra:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const updateCompra = async (req, res) => {
  try {
    const compraActualizada = await actualizarCompraIndividual(req.params.id, req.body, req.sede);
    res.json({ message: "Compra actualizada correctamente", compra: compraActualizada });
  } catch (error) {
    console.error("Error updateCompra:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const updateLoteCompra = async (req, res) => {
  try {
    const { ids, nuevasCompras } = req.body;
    const resultado = await actualizarLoteCompras(ids, nuevasCompras, req.user.id, req.sede);
    res.json(resultado);
  } catch (error) {
    console.error("Error updateLoteCompra:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const deleteCompra = async (req, res) => {
  try {
    const resultado = await eliminarCompraPorId(req.params.id, req.sede);
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error deleteCompra:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const deleteLoteCompras = async (req, res) => {
  try {
    const data = await eliminarLoteComprasPorId(req.params.id_lote, req.sede);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error deleteLoteCompras:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const getCompra = async (req, res) => {
  try {
    const compra = await Compra.findOne({ _id: req.params.id, sede: req.sede })
      .populate("user")
      .populate("producto");
    if (!compra) return res.status(404).json({ message: "Compra no registrada" });
    res.json(compra);
  } catch (error) {
    console.error("Error getCompra:", error.message);
    res.status(500).json({ message: "Error al obtener la compra" });
  }
};
