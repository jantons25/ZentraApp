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
      type: String,
      enum: ["activo", "inactivo"],
      default: "activo",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sede: {
      type: String,
      enum: ["", "Nexus", "ZentraSanJose", "ZentraPlaza", "ZentraBalta"],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Categoria", categoriaSchema);
