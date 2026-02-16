import mongoose from "mongoose";
import DetalleReserva from "../models/detalle_reserva.js";
import Reserva from "../models/reserva.model.js";

export const crearDetalleReserva = async ({
  reservaId,
  importe_total,
  moneda = "PEN",
  pago_inicial = 0,
  metodo_pago = "efectivo",
  observacion_pago = "",
  referencia = "",
  comprobante_url = "",
  observaciones_generales = "",
  registrado_por = null,
}) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(reservaId)) {
      throw new Error("reservaId inválido.");
    }

    // 1) Verificar que la reserva exista (en la colección correcta)
    const reservaExiste = await Reserva.findById(reservaId).select(
      "_id estado"
    );
    if (!reservaExiste) throw new Error("Reserva no encontrada.");

    // (opcional) no crear detalle si está cancelada
    if (reservaExiste.estado === "cancelada") {
      throw new Error("No se puede crear detalle para una reserva cancelada.");
    }

    // 2) Evitar duplicado (1 a 1)
    const yaExiste = await DetalleReserva.findOne({
      reserva: reservaId,
    }).select("_id");
    if (yaExiste) {
      throw new Error("Ya existe un detalle para esta reserva.");
    }

    const total = Number(importe_total || 0);
    if (total < 0) throw new Error("El importe_total no puede ser negativo.");

    // 3) Construir pagos iniciales (si aplica)
    const pagos = [];
    if (Number(pago_inicial) > 0) {
      pagos.push({
        monto_pago: Number(pago_inicial),
        metodo_pago,
        observacion_pago,
        referencia,
        comprobante_url,
        registrado_por,
        fecha_pago: new Date(),
      });
    }

    // 4) Crear detalle (el schema recalcula saldo/estado)
    const detalle = new DetalleReserva({
      reserva: reservaId,
      moneda,
      importe_total: total,
      pagos,
      observaciones_generales,
      facturado: false,
    });

    const detalleCreado = await detalle.save();

    return {
      mensaje: "Detalle de reserva creado correctamente.",
      detalle: detalleCreado,
    };
  } catch (error) {
    // Manejo bonito del unique index
    if (String(error.message).includes("E11000")) {
      throw new Error("Ya existe un detalle para esta reserva (duplicado).");
    }
    throw new Error(`Error al crear detalle de reserva: ${error.message}`);
  }
};

export const agregarPagoDetalleReserva = async ({
  reservaId,
  monto_pago,
  metodo_pago = "efectivo",
  observacion_pago = "",
  referencia = "",
  comprobante_url = "",
  registrado_por = null,
  fecha_pago = null,
}) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(reservaId)) {
      throw new Error("reservaId inválido.");
    }

    const detalle = await DetalleReserva.findOne({ reserva: reservaId });
    if (!detalle) throw new Error("Detalle de reserva no encontrado.");

    const monto = Number(monto_pago);
    if (!monto || monto <= 0) {
      throw new Error("El monto de pago debe ser un número positivo.");
    }

    // Política: no permitir pagos si ya está cancelado
    if (detalle.estado_pago === "cancelado") {
      throw new Error("No se pueden agregar pagos a un detalle cancelado.");
    }

    // Agregar pago
    detalle.pagos.push({
      fecha_pago: fecha_pago ? new Date(fecha_pago) : new Date(),
      monto_pago: monto,
      metodo_pago,
      observacion_pago,
      referencia,
      comprobante_url,
      registrado_por,
    });

    // Guardar para recalcular total_pagado/saldo/estado
    const detalleActualizado = await detalle.save();

    return {
      mensaje: "Pago agregado correctamente al detalle de reserva.",
      detalle: detalleActualizado,
    };
  } catch (error) {
    throw new Error(
      `Error al agregar pago al detalle de reserva: ${error.message}`
    );
  }
};
