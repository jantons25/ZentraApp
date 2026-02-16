import { Router } from "express";
import {
  getVentas,
  createVenta,
  getVenta,
  deleteVenta,
  updateVenta,
  getAllVentas,
  deleteLoteVentas,
} from "../controllers/venta.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import {
  createVentaSchema,
  updateVentaSchema,
  updateVentaUnitSchema,
} from "../schemas/venta.schema.js";

const router = Router();

router.get("/ventas", authRequired, getVentas);
router.get("/ventas/all", authRequired, getAllVentas);
router.get("/ventas/:id", authRequired, getVenta);

router.post(
  "/ventas",
  authRequired,
  validateSchema(createVentaSchema),
  createVenta
);

router.put(
  "/ventas/lote",
  authRequired,
  validateSchema(updateVentaSchema),
  updateVenta
);

router.delete("/ventas/:id", authRequired, deleteVenta);
router.delete("/ventas/lote/:id_lote", authRequired, deleteLoteVentas);

export default router;
