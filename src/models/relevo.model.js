import mongoose from "mongoose";

const relevoSchema = new mongoose.Schema(
  {
    responsable: {
      type: String,
      required: true,
    },
    recepcioista: {
      type: String,
      required: true,
    },
    observacion: {
      type: String,
      default: "",
    },
    conformidad: {
      type: String,
      default: "",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Relevo", relevoSchema);