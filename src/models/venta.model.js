import mongoose from "mongoose";

const ventaSchema = new mongoose.Schema({
  id_lote: {
    type: String,
    default: "000",
  },
  cantidad: {
    type: Number,
    default: 0,
  },
  pago_registrado: {
    type: String,
    required: true,
  },
  habitacion: {
    type: String,
    default: "",
  },
  precio_venta: {
    type: Number,
    default: 0.0,
  },
  importe_venta: {
    type: Number,
    default: 0.0,
  },
  lotes_vendidos: [
    {
      salida_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Salida",
        required: true,
      },
      cantidad: {
        type: Number,
        required: true,
      },
      precio_compra: {
        type: Number,
        required: true,
      },
      margen_unitario: {
        type: Number,
        required: true,
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
  },
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model("Venta", ventaSchema);
