import mongoose from "mongoose";

const relevoSchema = new mongoose.Schema(
  {
    responsable: {
      type: String,
      required: true,
    },
    recepcionista: {
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

export default mongoose.model("Relevo", relevoSchema);