import mongoose from "mongoose";

const loteSchema = new mongoose.Schema({
    codigo: {
        type: String,
        required: true,
        trim: true,
    },
    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    cantidad: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    fecha_vencimiento: {
        type: Date,
        required: true,
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
}, {
    timestamps: true,
});

export default mongoose.model("Lote", loteSchema);