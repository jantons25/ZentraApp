import mongoose from "mongoose";

const pagoSchema = new mongoose.Schema(
  {
    fecha_pago: {
      type: Date,
      default: Date.now,
    },
    monto_pago: {
      type: Number,
      required: true,
      min: 0,
    },
    metodo_pago: {
      type: String,
      enum: ["efectivo", "yape", "plin", "transferencia", "tarjeta", "otro"],
      default: "efectivo",
    },
    // ✅ Útil para yape/plin/transferencia: nro operación, ID, etc.
    referencia: {
      type: String,
      trim: true,
      default: "",
    },
    // ✅ Si luego guardas evidencia / voucher
    comprobante_url: {
      type: String,
      trim: true,
      default: "",
    },
    observacion_pago: {
      type: String,
      trim: true,
      default: "",
    },
    // ✅ Auditoría opcional (quién registró el pago)
    registrado_por: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { _id: true }
);

const detalleReservaSchema = new mongoose.Schema(
  {
    // ✅ 1 a 1: un detalle por reserva
    reserva: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reserva",
      required: true,
      unique: true,
      index: true,
    },

    // ✅ Moneda (por si luego facturas en USD o manejas multi-moneda)
    moneda: {
      type: String,
      enum: ["PEN", "USD"],
      default: "PEN",
      index: true,
    },

    // ✅ Total a pagar (lo puedes fijar en el momento de crear la reserva)
    importe_total: {
      type: Number,
      required: true,
      min: 0,
      default: 0.0,
    },

    // ⚠️ Estos campos son DERIVADOS de pagos.
    // Se mantienen para performance/reportes, pero se recalculan automáticamente.
    total_pagado: {
      type: Number,
      min: 0,
      default: 0.0,
    },
    saldo_pendiente: {
      type: Number,
      min: 0,
      default: 0.0,
    },

    estado_pago: {
      type: String,
      enum: ["pendiente", "parcial", "completo", "cancelado"],
      default: "pendiente",
      index: true,
    },

    facturado: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ✅ Si vas a enlazar comprobantes (Boleta/Factura) en el futuro
    comprobante: {
      tipo: {
        type: String,
        enum: ["boleta", "factura", "ninguno"],
        default: "ninguno",
      },
      serie: { type: String, trim: true, default: "" },
      numero: { type: String, trim: true, default: "" },
      fecha_emision: { type: Date, default: null },
    },

    observaciones_generales: {
      type: String,
      default: "",
      trim: true,
    },

    pagos: {
      type: [pagoSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Recalcular totales y estado automáticamente (consistencia)
detalleReservaSchema.methods.recalcular = function () {
  const totalPagado = (this.pagos || []).reduce(
    (acc, p) => acc + (Number(p.monto_pago) || 0),
    0
  );

  // Evitar negativos por redondeos/errores
  const saldo = Math.max(0, Number(this.importe_total || 0) - totalPagado);

  this.total_pagado = Number(totalPagado.toFixed(2));
  this.saldo_pendiente = Number(saldo.toFixed(2));

  if (this.estado_pago === "cancelado") return;

  if (this.total_pagado <= 0) this.estado_pago = "pendiente";
  else if (this.saldo_pendiente > 0) this.estado_pago = "parcial";
  else this.estado_pago = "completo";
};

// ✅ Hooks para mantener consistencia al guardar/actualizar
detalleReservaSchema.pre("validate", function (next) {
  // Importante: si cambia importe_total o pagos, recalcula.
  this.recalcular();
  next();
});

// ✅ Validación extra: no permitir pagos que excedan demasiado el total (opcional)
detalleReservaSchema.pre("save", function (next) {
  if (this.total_pagado > Number(this.importe_total || 0) + 0.01) {
    return next(
      new Error("La suma de pagos no puede exceder el importe total.")
    );
  }
  next();
});

export default mongoose.model("DetalleReserva", detalleReservaSchema);
