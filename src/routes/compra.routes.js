import { Router } from "express";
import {
  getCompras,
  getAllCompras,
  getCompra,
  createCompra,
  updateCompra,
  updateLoteCompra,
  deleteCompra,
  deleteLoteCompras,
} from "../controllers/compra.controller.js";

import { authRequired } from "../middlewares/validateToken.js";
import { resolveSede } from "../middlewares/resolveSede.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import {
  createCompraSchema,
  updateCompraSchema,
  updateCompraUnitSchema,
} from "../schemas/compra.schema.js";

const router = Router();

// Obtener compras
router.get("/compras", authRequired, resolveSede, getCompras);
router.get("/compras/all", authRequired, resolveSede, getAllCompras);
router.get("/compras/:id", authRequired, resolveSede, getCompra);

// Crear compras (una o varias)
router.post(
  "/compras",
  authRequired, resolveSede,
  validateSchema(createCompraSchema),
  createCompra
);

// Actualizar compras (lote)
router.put(
  "/compras/lote",
  authRequired, resolveSede,
  validateSchema(updateCompraSchema),
  updateLoteCompra
);

// Actualizar compra individual
router.put(
  "/compras/:id",
  authRequired, resolveSede,
  validateSchema(updateCompraUnitSchema),
  updateCompra
);

// Eliminar compras por lote (debe ir antes que /:id para evitar conflicto)
router.delete("/compras/lote/:id_lote", authRequired, resolveSede, deleteLoteCompras);

// Eliminar compra individual
router.delete("/compras/:id", authRequired, resolveSede, deleteCompra);

export default router;
