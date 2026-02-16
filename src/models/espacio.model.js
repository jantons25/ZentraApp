import mongoose from "mongoose";

const tarifaSchema = new mongoose.Schema(
  {
    // ✅ Permite escalar: por hora / día / mes / evento, etc.
    tipo: {
      type: String,
      enum: ["hora", "dia", "mes", "evento"],
      default: "hora",
    },
    precio: {
      type: Number,
      required: true,
      min: 0,
    },
    // ✅ Opcional: rango horario (ej: tarifa nocturna)
    hora_inicio: { type: String, trim: true, default: "" }, // "HH:mm"
    hora_fin: { type: String, trim: true, default: "" }, // "HH:mm"
    // ✅ Opcional: días aplicables (0=Dom ... 6=Sáb)
    dias_semana: {
      type: [Number],
      default: [], // vacío = aplica a todos
    },
    activo: { type: Boolean, default: true },
  },
  { _id: true }
);

const espacioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      default: "",
    },

    // ✅ Si luego tienes más de una sede/piso (Nexus crece)
    sede: {
      type: String,
      trim: true,
      default: "Nexus Cowork",
      index: true,
    },
    piso: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
      index: true,
    },

    tipo: {
      type: String,
      enum: ["oficina", "sala", "compartido", "auditorio", "oficina_virtual"],
      default: "oficina",
      index: true,
    },

    capacidad: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      default: 1,
    },

    // ✅ Mantengo tu campo para compatibilidad, pero sugiero usar "tarifas"
    // como fuente principal si vas a crecer en planes/promos.
    precio_por_hora: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // ✅ Escalable: múltiples reglas de precio
    tarifas: {
      type: [tarifaSchema],
      default: [],
    },

    // ⚠️ "disponibilidad" como boolean fijo suele confundir.
    // Mejor: "habilitado_reservas" para bloquear reservas sin tocar "estado".
    habilitado_reservas: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Estado del recurso (si está activo/publicable)
    estado: {
      type: String,
      enum: ["disponible", "inactivo", "mantenimiento", "reservado", "no_disponible"],
      default: "disponible",
      index: true,
    },

    descripcion: {
      type: String,
      trim: true,
      default: "",
    },

    servicios: {
      type: [String],
      default: [],
    },

    // ✅ Para gestión más pro: inventario/activos del espacio
    equipamiento: {
      type: [String],
      default: [],
    },

    // ✅ Metadatos útiles para UI/listados
    imagenes: {
      type: [String], // urls
      default: [],
    },
    color_tag: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Índices adicionales para listados rápidos
espacioSchema.index({ sede: 1, piso: 1, tipo: 1, estado: 1 });

// Nota:
// La disponibilidad real por horario NO debe depender de un boolean.
// Se calcula con las Reservas (inicio/fin) + estado + habilitado_reservas.

export default mongoose.model("Espacio", espacioSchema);
