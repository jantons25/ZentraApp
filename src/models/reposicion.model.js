// models/reposicion.model.js
import mongoose from "mongoose";

const reposicionSchema = new mongoose.Schema(
  {
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

    // Cantidad total repuesta (suma de lotes_repuestos[].cantidad)
    cantidad: {
      type: Number,
      min: 1,
      required: true,
    },

    // Destino de la reposición (habitación/oficina)
    habitacion: {
      type: String,
      default: "",
      trim: true,
    },

    // Quién entrega/autoriza
    responsable: {
      type: String,
      default: "",
      trim: true,
    },

    observacion: {
      type: String,
      default: "",
      trim: true,
    },

    // Detalle FIFO desde Salidas (igual idea que lotes_vendidos en Ventas)
    lotes_repuestos: [
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
        // Datos de trazabilidad tomados del primer lote de la salida (o costo promedio si lo calculas)
        precio_compra: {
          type: Number,
          required: true, // deja true si quieres costo obligatorio; si no, pon default: 0 y quita required
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

// Indices útiles para consultas FIFO y navegación por lote
reposicionSchema.index({ id_lote: 1 });
reposicionSchema.index({ producto: 1, createdAt: 1 });

export default mongoose.model("Reposicion", reposicionSchema);
