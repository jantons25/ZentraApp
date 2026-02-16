import express from "express";
import {
  registrarEspacio,
  obtenerEspacios,
  obtenerEspacioPorId,
  actualizarEspacio,
  eliminarEspacio,
} from "../controllers/espacio.controller.js";
import { authRequired } from "../middlewares/validateToken.js";

const router = express.Router();

router.get("/espacios", authRequired, obtenerEspacios);
router.get("/espacios/:id", authRequired, obtenerEspacioPorId);
router.post("/espacios", authRequired, registrarEspacio);

// Si actualizas parcialmente, mejor PATCH. Si mantienes PUT, ok.
router.put("/espacios/:id", authRequired, actualizarEspacio);

// Soft delete
router.delete("/espacios/:id", authRequired, eliminarEspacio);

export default router;