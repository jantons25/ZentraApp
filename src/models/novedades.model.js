// models/novedades.model.js
import mongoose from "mongoose";

export const TIPOS_NOVEDAD = ["Incidente", "Informativo", "Mantenimiento", "Recordatorio"];
export const ESTADOS_NOVEDAD = ["Pendiente", "En proceso", "Finalizada"];

const novedadSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    descripcion: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    tipo: {
      type: String,
      enum: TIPOS_NOVEDAD,
      default: "Informativo",
      index: true,
    },

    estado: {
      type: String,
      enum: ESTADOS_NOVEDAD,
      default: "Pendiente",
      index: true,
    },

    // Referencia al usuario que registró la novedad (misma convención que el resto de modelos)
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Eliminación lógica: las novedades nunca se borran físicamente
    activo: {
      type: Boolean,
      default: true,
      index: true,
    },

    sede: {
      type: String,
      enum: ["", "Nexus", "ZentraSanJose", "ZentraPlaza", "ZentraBalta"],
      default: "",
    },
  },
  {
    // Nombres de timestamps requeridos por el dominio, usando el mecanismo nativo de mongoose
    timestamps: { createdAt: "fechaRegistro", updatedAt: "fechaActualizacion" },
  }
);

// Consulta principal del módulo: novedades activas de una sede, ordenadas por fecha
novedadSchema.index({ sede: 1, activo: 1, fechaRegistro: -1 });

export default mongoose.model("Novedad", novedadSchema);
