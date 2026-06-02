import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { createdAccessToken } from "../libs/jwt.js";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000,
};

export const register = async (req, res) => {
  const { username, password, name, role, sede } = req.body;

  try {
    const userFound = await User.findOne({ username });
    if (userFound) return res.status(400).json({ message: "Usuario ya existe" });

    const allowedRoles = ["user", "admin", "superadmin"];
    const finalRole = allowedRoles.includes(role) ? role : "user";

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: passwordHash,
      name: name || "",
      role: finalRole,
      status: "active",
      sede: sede || "",
    });

    const userSave = await newUser.save();

    res.status(201).json({
      id: userSave._id,
      username: userSave.username,
      name: userSave.name,
      role: userSave.role,
      sede: userSave.sede,
      createdAt: userSave.createdAt,
      updatedAt: userSave.updatedAt,
    });
  } catch (error) {
    console.error("Error en register:", error.message);
    res.status(500).json({ message: "Error al registrar el usuario" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const userFound = await User.findOne({ username });
    if (!userFound)
      return res.status(400).json({ message: "Usuario no encontrado" });

    if (userFound.status !== "active")
      return res.status(403).json({ message: "Usuario desactivado. Contacta al administrador." });

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch)
      return res.status(400).json({ message: "Contraseña incorrecta" });

    const token = await createdAccessToken({
      id: userFound._id,
      role: userFound.role,
      sede: userFound.sede,
    });

    res.cookie("token", token, COOKIE_OPTIONS);
    res.json({
      id: userFound._id,
      username: userFound.username,
      name: userFound.name,
      role: userFound.role,
      sede: userFound.sede,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    });
  } catch (error) {
    console.error("Error en login:", error.message);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    expires: new Date(0),
  });
  return res.sendStatus(200);
};

export const profile = async (req, res) => {
  try {
    const userFound = await User.findById(req.user.id);
    if (!userFound)
      return res.status(400).json({ message: "Usuario no encontrado" });

    return res.json({
      id: userFound._id,
      username: userFound.username,
      name: userFound.name,
      role: userFound.role,
      sede: userFound.sede,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    });
  } catch (error) {
    console.error("Error en profile:", error.message);
    res.status(500).json({ message: "Error al obtener perfil" });
  }
};

export const verifyTokenRequest = async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).json({ message: "No autorizado" });

  try {
    const user = jwt.verify(token, TOKEN_SECRET);
    const userFound = await User.findById(user.id);
    if (!userFound)
      return res.status(401).json({ message: "Usuario no encontrado" });

    return res.json({
      id: userFound._id,
      username: userFound.username,
      name: userFound.name,
      role: userFound.role,
      sede: userFound.sede,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    });
  } catch (err) {
    return res.status(401).json({ message: "No autorizado" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      "username name role status sede createdAt updatedAt"
    );
    res.json(users);
  } catch (error) {
    console.error("Error en getUsers:", error.message);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "inactive" },
      { new: true }
    );

    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    return res.json({ message: "Usuario desactivado correctamente" });
  } catch (error) {
    console.error("Error al desactivar usuario:", error.message);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

export const updateUser = async (req, res) => {
  const { password, username, name, sede, status, role } = req.body;

  try {
    const updateData = {};

    if (username !== undefined) updateData.username = username;
    if (name !== undefined) updateData.name = name;
    if (sede !== undefined) updateData.sede = sede;

    if (req.user.role === "superadmin" || req.user.role === "admin") {
      if (status !== undefined) updateData.status = status;
      if (role !== undefined) updateData.role = role;
    }

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select("-password");

    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(user);
  } catch (error) {
    console.error("Error al actualizar usuario:", error.message);
    res.status(500).json({ message: "Error del servidor" });
  }
};
