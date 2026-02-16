// models/cortesia.model.js
import mongoose from "mongoose";

const cortesiaSchema = new mongoose.Schema(
  {
    // Lote lógico, misma idea que en Reposición
    id_lote: {
      type: String,
      default: "000",
    },

    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    // Cantidad total entregada en cortesía
    cantidad: {
      type: Number,
      min: 1,
      required: true,
    },

    // Quién entrega / autoriza la cortesía
    responsable: {
      type: String,
      default: "",
      trim: true,
    },

    // Comentarios adicionales (motivo, habitación, huésped, etc.)
    observacion: {
      type: String,
      default: "",
      trim: true,
    },

    // Detalle FIFO desde Salidas (misma estructura que lotes_repuestos)
    lotes_cortesias: [
      {
        salida_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Salida",
          required: true,
          index: true,
        },
        cantidad: {
          type: Number,
          required: true,
          min: 1,
        },
        // Datos de trazabilidad tomados del primer lote de la salida
        precio_compra: {
          type: Number,
          required: true, // igual que en reposición
          min: 0,
        },
        lote: {
          type: String,
          required: true,
        },
        fecha_vencimiento: {
          type: Date,
        },
      },
    ],

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Índices útiles para consultas FIFO y navegación por lote
cortesiaSchema.index({ id_lote: 1 });
cortesiaSchema.index({ producto: 1, createdAt: 1 });

export default mongoose.model("Cortesia", cortesiaSchema);
