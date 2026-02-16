import mongoose from "mongoose";

const clienteSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
      default: "Cliente",
      index: true,
    },

    // ⚠️ Si el correo NO es obligatorio, debe ser sparse
    // para evitar colisiones con unique + ""
    correo: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      default: undefined,
      index: true,
    },

    // 🔐 Password siempre debe almacenarse hasheado
    // (el hash se hace en el service/controller)
    password: {
      type: String,
      select: false, // no se devuelve por defecto
      default: null,
    },

    // Rol del cliente dentro del sistema
    rol: {
      type: String,
      enum: ["cliente", "admin", "superadmin"],
      default: "cliente",
      index: true,
    },

    telefono: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    // DNI opcional pero único si existe
    dni: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },

    estado: {
      type: String,
      enum: ["activo", "inactivo"],
      default: "activo",
      index: true,
    },

    // ✅ Campos útiles para escalabilidad / auditoría
    ultimo_acceso: {
      type: Date,
      default: null,
    },
    origen_registro: {
      type: String,
      enum: ["interno", "web"],
      default: "interno",
    },
  },
  {
    timestamps: true,
  }
);

// 🔐 Asegurar al menos un medio de contacto
clienteSchema.pre("validate", function (next) {
  if (!this.correo && !this.telefono) {
    return next(
      new Error("El cliente debe tener al menos un correo o teléfono.")
    );
  }
  next();
});

export default mongoose.model("Cliente", clienteSchema);
