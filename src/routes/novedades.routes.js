import { Router } from "express";
import {
  getNovedades,
  getNovedad,
  createNovedad,
  updateNovedad,
  deleteNovedad,
} from "../controllers/novedades.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { requireRole } from "../middlewares/requireRole.js";
import { validateObjectId } from "../middlewares/validateObjectId.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { createNovedadSchema, updateNovedadSchema } from "../schemas/novedad.schema.js";

const router = Router();

const ROLES_GESTION = ["recepcionista", "admin", "superadmin"];

router.get("/novedades", authRequired, getNovedades);
router.get("/novedades/:id", authRequired, validateObjectId(), getNovedad);
router.post(
  "/novedades",
  authRequired,
  requireRole(...ROLES_GESTION),
  validateSchema(createNovedadSchema),
  createNovedad
);
router.put(
  "/novedades/:id",
  authRequired,
  requireRole(...ROLES_GESTION),
  validateObjectId(),
  validateSchema(updateNovedadSchema),
  updateNovedad
);
router.delete(
  "/novedades/:id",
  authRequired,
  requireRole(...ROLES_GESTION),
  validateObjectId(),
  deleteNovedad
);

export default router;
