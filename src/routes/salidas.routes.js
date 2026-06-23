import { Router } from "express";
import {
  getSalidas,
  getAllSalidas,
  getSalida,
  createSalida,
  updateSalida,
  deleteSalida,
  deleteLoteSalida,
  updateLoteSalidas,
  deleteLoteSalidaCompleta,
} from "../controllers/salidas.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { resolveSede } from "../middlewares/resolveSede.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import {
  createSalidasSchema,
  updateSalidaSchema,
  updateSalidaUnitSchema,
} from "../schemas/salidas.schema.js";

const router = Router();

// Obtener salidas
router.get("/salidas", authRequired, resolveSede, getSalidas);
router.get("/salidas/all", authRequired, resolveSede, getAllSalidas);
router.get("/salidas/:id", authRequired, resolveSede, getSalida);

// Crear salidas (individual o lote)
router.post(
  "/salidas",
  authRequired, resolveSede,
  validateSchema(createSalidasSchema),
  createSalida
);

// Actualizar lote de salidas
router.put(
  "/salidas/lote",
  authRequired, resolveSede,
  validateSchema(updateSalidaSchema),
  updateLoteSalidas
);

// Actualizar salida individual
router.put(
  "/salidas/:id",
  authRequired, resolveSede,
  validateSchema(updateSalidaUnitSchema),
  updateSalida
);

// Eliminar lote de salidas completo (debe ir primero para evitar conflicto con /:id)
router.delete("/salidas/lote/completo/:id_lote", authRequired, resolveSede, deleteLoteSalidaCompleta);

// Eliminar lote de salidas
router.delete("/salidas/lote/:id_lote", authRequired, resolveSede, deleteLoteSalida);

// Eliminar salida individual
router.delete("/salidas/:id", authRequired, resolveSede, deleteSalida);

export default router;
