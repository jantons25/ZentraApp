import mongoose from "mongoose";

const compraSchema = new mongoose.Schema({
  id_lote: {
    type: String, 
    default: "000"
  },
  cantidad: {
    type: Number,
    min: 0,
    default: 0
  },
  cantidad_disponible: {                  
    type: Number,
    min: 0,
    default: 0
  },
  precio_compra: {
    type: Number,
    default: 0.00
  },
  importe_compra: {
    type: Number,
    default: 0.00
  },
  fecha_vencimiento: {
    type: Date,
    default: null
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Compra', compraSchema);
