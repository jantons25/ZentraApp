import express from "express";
import {
  registrarEspacio,
  obtenerEspacios,
  obtenerEspacioPorId,
  actualizarEspacio,
  eliminarEspacio,
} from "../controllers/espacio.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { resolveSede } from "../middlewares/resolveSede.js";

const router = express.Router();

router.get("/espacios", authRequired, resolveSede, obtenerEspacios);
router.get("/espacios/:id", authRequired, resolveSede, obtenerEspacioPorId);
router.post("/espacios", authRequired, resolveSede, registrarEspacio);

// Si actualizas parcialmente, mejor PATCH. Si mantienes PUT, ok.
router.put("/espacios/:id", authRequired, resolveSede, actualizarEspacio);

// Soft delete
router.delete("/espacios/:id", authRequired, resolveSede, eliminarEspacio);

export default router;