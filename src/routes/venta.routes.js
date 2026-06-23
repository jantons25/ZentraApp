import { Router } from "express";
import {
  getVentas,
  createVenta,
  getVenta,
  deleteVenta,
  updateVenta,
  updateVentaById,
  getAllVentas,
  deleteLoteVentas,
} from "../controllers/venta.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { resolveSede } from "../middlewares/resolveSede.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import {
  createVentaSchema,
  updateVentaSchema,
  updateVentaUnitSchema,
} from "../schemas/venta.schema.js";

const router = Router();

router.get("/ventas", authRequired, resolveSede, getVentas);
router.get("/ventas/all", authRequired, resolveSede, getAllVentas);
router.get("/ventas/:id", authRequired, resolveSede, getVenta);

router.post(
  "/ventas",
  authRequired, resolveSede,
  validateSchema(createVentaSchema),
  createVenta
);

router.put(
  "/ventas/lote",
  authRequired, resolveSede,
  validateSchema(updateVentaSchema),
  updateVenta
);

router.put(
  "/ventas/:id",
  authRequired, resolveSede,
  validateSchema(updateVentaUnitSchema),
  updateVentaById
);

router.delete("/ventas/lote/:id_lote", authRequired, resolveSede, deleteLoteVentas);
router.delete("/ventas/:id", authRequired, resolveSede, deleteVenta);

export default router;
