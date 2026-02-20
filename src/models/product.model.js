import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      trim: true,
      default: "",
    },
    nombre: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: "",
    },
    descripcion: {
      type: String,
      default: "",
    },
    categoria: {
      type: String,
      default: "General",
      trim: true,
    },
    unidad: {
      type: String,
      default: "Unidad",
    },
    stock_total: {
      type: Number,
      default: 0,
      min: 0,
    },
    stock_minimo: {
      type: Number,
      default: 0,
      min: 0,
    },
    punto_reorden: {
      type: Number,
      default: 0,
      min: 0,
    },
    precio_compra_ponderado: {
      type: Number,
      default: 0,
      min: 0,
    },
    precio_compra_unidad: {
      type: Number,
      min: 0,
      default: 0,
    },
    precio_venta_base: {
      type: Number,
      default: 0.0,
      min: 0.0,
    },
    precio_venta: {
      type: Number,
      default: 0.0,
      min: 0.0,
    },
    estado: {
      type: String,
      enum: ["activo", "inactivo"],
      default: "activo",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cantidad_vendida: {
      type: Number,
      default: 0,
    },
    cantidad_repuesta: {
      type: Number,
      default: 0,
    },
    cantidad_cortesia: {
      type: Number,
      default: 0,
    },
    cantidad_velada: {
      type: Number,
      default: 0,
    },
    ingresos: {
      type: Number,
      default: 0,
    },
    salidas: {
      type: Number,
      default: 0,
    },
    precio_venta: {
      type: Number,
      default: 0.0,
    },
    importe_compra: {
      type: Number,
      default: 0.0,
    },
    importe_venta: {
      type: Number,
      default: 0.0,
    },
    margen_unitario: {
      type: Number,
      default: 0.0,
    },
    margen_acumulado: {
      type: Number,
      default: 0.0,
    },
    importe_venta: {
      type: Number,
      default: 0.0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);
