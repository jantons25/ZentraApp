/**
 * Script para crear el usuario superadmin inicial.
 * Uso: JWT_SECRET=xxx SUPER_ADMIN_USER=admin SUPER_ADMIN_PASS=secret node src/scripts/createSuperAdmin.js
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const USERNAME = process.env.SUPER_ADMIN_USER;
const NAME = process.env.SUPER_ADMIN_NAME || "Admin";
const PASSWORD = process.env.SUPER_ADMIN_PASS;
const ROLE = "superadmin";

if (!USERNAME || !PASSWORD) {
  console.error("SUPER_ADMIN_USER y SUPER_ADMIN_PASS son requeridos como variables de entorno.");
  process.exit(1);
}

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost/ZentraBD";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  name:     { type: String, default: "" },
  role:     { type: String, default: "user" },
  status:   { type: String, default: "active" },
  sede:     {
    type: String,
    enum: ["Nexus", "ZentraSanJose", "ZentraPlaza", "ZentraBalta", ""],
    default: "",
  },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Conectado a MongoDB:", MONGO_URI);

    const existe = await User.findOne({ username: USERNAME });
    if (existe) {
      console.log(`El usuario "${USERNAME}" ya existe (id: ${existe._id}). No se creo de nuevo.`);
      await mongoose.disconnect();
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(PASSWORD, 10);

    const nuevoUsuario = new User({
      username: USERNAME,
      password: passwordHash,
      name:     NAME,
      role:     ROLE,
      status:   "active",
      sede:     "",
    });

    await nuevoUsuario.save();

    console.log("Usuario superadmin creado exitosamente:");
    console.log(`   ID       : ${nuevoUsuario._id}`);
    console.log(`   Username : ${nuevoUsuario.username}`);
    console.log(`   Nombre   : ${nuevoUsuario.name}`);
    console.log(`   Rol      : ${nuevoUsuario.role}`);

  } catch (error) {
    console.error("Error al crear el usuario:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

run();
