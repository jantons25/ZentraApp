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
    const compras = await Compra.find({ user: req.user.id })
      .populate("user")
      .populate("producto");
    res.json(compras);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener las compras", error: error.message });
  }
};

export const getAllCompras = async (req, res) => {
  try {
    const compras = await Compra.find().populate("user").populate("producto");
    res.json(compras);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las compras",
      error: error.message,
    });
  }
};

export const createCompra = async (req, res) => {
  try {
    const resultado = await crearCompras(req.body, req.user.id);
    res.status(201).json(resultado);
  } catch (error) {
    res.status(500).json({
      message: "Error al crear la compra",
      error: error.message,
    });
  }
};

export const updateCompra = async (req, res) => {
  try {
    const compraActualizada = await actualizarCompraIndividual(
      req.params.id,
      req.body
    );
    res.json({
      message: "Compra actualizada correctamente",
      compra: compraActualizada,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar la compra",
      error: error.message,
    });
  }
};

export const updateLoteCompra = async (req, res) => {
  try {
    const { ids, nuevasCompras } = req.body;
    const resultado = await actualizarLoteCompras(
      ids,
      nuevasCompras,
      req.user.id
    );
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el lote de compras",
      error: error.message,
    });
  }
};

export const deleteCompra = async (req, res) => {
  try {
    const resultado = await eliminarCompraPorId(req.params.id);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar la compra",
      error: error.message,
    });
  }
};

export const deleteLoteCompras = async (req, res) => {
  try {
    const data = await eliminarLoteComprasPorId(req.params.id_lote);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el lote de compras",
      error: error.message,
    });
  }
};

export const getCompra = async (req, res) => {
  try {
    const compra = await Compra.findById(req.params.id)
      .populate("user")
      .populate("producto");
    if (!compra)
      return res.status(404).json({ message: "Compra no registrada" });
    res.json(compra);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener la compra", error: error.message });
  }
};
