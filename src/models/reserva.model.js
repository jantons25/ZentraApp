import mongoose from "mongoose";

/* =========================
   Subschemas: Pagos y Detalle
========================= */

const pagoSchema = new mongoose.Schema(
  {
    monto_pago: { type: Number, default: 0, min: 0 },
    metodo_pago: { type: String, default: "efectivo", trim: true },
    observacion_pago: { type: String, default: "", trim: true },
    registrado_por: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    fecha_pago: { type: Date, default: Date.now },
  },
  { _id: true }
);

const detalleSchema = new mongoose.Schema(
  {
    moneda: { type: String, default: "PEN", trim: true },
    importe_total: { type: Number, default: 0, min: 0 },
    pagos: { type: [pagoSchema], default: [] },
    observaciones_generales: { type: String, default: "", trim: true },
  },
  { _id: false }
);

/* =========================
   Schema principal: Reserva
========================= */

const reservaSchema = new mongoose.Schema(
  {
    // Quién registró/gestionó la reserva (usuario del sistema)
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Quién reserva (cliente)
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cliente",
      required: true,
      index: true,
    },

    // Cuándo se creó la reserva (audit)
    fecha_reserva: {
      type: Date,
      default: Date.now,
    },

    // Qué se reservó
    espacio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Espacio",
      required: true,
      index: true,
    },

    // Fechas/horas reales para consultas y solapamientos
    inicio: {
      type: Date,
      required: true,
      index: true,
    },
    fin: {
      type: Date,
      required: true,
      index: true,
    },

    // Opcional: zona horaria
    timezone: {
      type: String,
      default: "America/Lima",
      trim: true,
    },

    descripcion: {
      type: String,
      default: "",
      trim: true,
    },

    tipo: {
      type: String,
      enum: ["interna", "web"],
      default: "interna",
      index: true,
    },

    estado: {
      type: String,
      enum: ["pendiente", "confirmada", "rechazada", "cancelada", "finalizada"],
      default: "pendiente",
      index: true,
    },

    observaciones: {
      type: String,
      default: "",
      trim: true,
    },

    // ✅ NUEVO: Detalle embebido (Opción 2)
    detalle: {
      type: detalleSchema,
      default: () => ({
        moneda: "PEN",
        importe_total: 0,
        pagos: [],
        observaciones_generales: "",
      }),
    },

    // Auditoría de cancelación
    cancelado_por: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    motivo_cancelacion: {
      type: String,
      trim: true,
      default: "",
    },
    fecha_cancelacion: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   Validaciones y Índices
========================= */

// ✅ Validación: fin debe ser mayor que inicio
reservaSchema.pre("validate", function (next) {
  if (this.inicio && this.fin && this.fin <= this.inicio) {
    return next(
      new Error(
        "La fecha/hora de fin debe ser mayor que la fecha/hora de inicio."
      )
    );
  }
  next();
});

// ✅ Índices para consultas comunes (historial y agenda)
reservaSchema.index({ espacio: 1, inicio: 1, fin: 1 });
reservaSchema.index({ cliente: 1, inicio: -1 });
reservaSchema.index({ estado: 1, inicio: 1 });

export default mongoose.model("Reserva", reservaSchema);
