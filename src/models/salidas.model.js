import mongoose from "mongoose";

const salidasSchema = new mongoose.Schema({
  id_lote: {
    type: String,
    default: "000",
  },
  cantidad: {
    type: Number,
    min: 0,
    required: true,
  },
  cantidad_disponible: {
    type: Number,
    min: 0,
    required: true,
  },
  motivo: {
    type: String,
    default: "Uso interno", 
  },
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  lotes_usados: [
    {
      compra: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Compra",
        required: true,
      },
      cantidad_usada: {
        type: Number,
        required: true,
        min: 0,
      },
      precio_compra: {
        type: Number,
        required: true,
        min: 0,
      },
      lote: {
        type: String,
        required: true,
      },
      fecha_vencimiento: {
        type: Date,
        required: false,
      },
    },
  ],
  fecha_vencimiento_min:{
    type: Date,
    required: false,
  }
  ,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: true,
});


export default mongoose.model('Salida', salidasSchema);