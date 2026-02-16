import mongoose from "mongoose";

const categoriaSchema = new mongoose.Schema(
  {
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
    estado: {
      type: Boolean,
      enum: ["activo", "inactivo"],
      default: "activo",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Categoria", categoriaSchema);
