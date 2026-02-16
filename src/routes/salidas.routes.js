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
import { validateSchema } from "../middlewares/validator.middleware.js";
import {
  createSalidasSchema,
  updateSalidaSchema,
  updateSalidaUnitSchema,
} from "../schemas/salidas.schema.js";

const router = Router();

// Obtener salidas
router.get("/salidas", authRequired, getSalidas);
router.get("/salidas/all", authRequired, getAllSalidas);
router.get("/salidas/:id", authRequired, getSalida);

// Crear salidas (individual o lote)
router.post(
  "/salidas",
  authRequired,
  validateSchema(createSalidasSchema),
  createSalida
);

// Actualizar lote de salidas
router.put(
  "/salidas/lote",
  authRequired,
  validateSchema(updateSalidaSchema),
  updateLoteSalidas
);

// Actualizar salida individual
router.put(
  "/salidas/:id",
  authRequired,
  validateSchema(updateSalidaUnitSchema),
  updateSalida
);

// Eliminar salida individual
router.delete("/salidas/:id", authRequired, deleteSalida);

// Eliminar lote de salidas
router.delete("/salidas/lote/:id_lote", authRequired, deleteLoteSalida);

// Eliminar lote de salidas completo
router.delete("/salidas/lote/completo/:id_lote", authRequired, deleteLoteSalidaCompleta);

export default router;
