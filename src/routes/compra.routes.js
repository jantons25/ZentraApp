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
import { validateSchema } from "../middlewares/validator.middleware.js";
import {
  createCompraSchema,
  updateCompraSchema,
  updateCompraUnitSchema,
} from "../schemas/compra.schema.js";

const router = Router();

// Obtener compras
router.get("/compras", authRequired, getCompras);
router.get("/compras/all", authRequired, getAllCompras);
router.get("/compras/:id", authRequired, getCompra);

// Crear compras (una o varias)
router.post(
  "/compras",
  authRequired,
  validateSchema(createCompraSchema),
  createCompra
);

// Actualizar compras (lote)
router.put(
  "/compras/lote",
  authRequired,
  validateSchema(updateCompraSchema),
  updateLoteCompra
);

// Actualizar compra individual
router.put(
  "/compras/:id",
  authRequired,
  validateSchema(updateCompraUnitSchema),
  updateCompra
);

// Eliminar compra individual
router.delete("/compras/:id", authRequired, deleteCompra);

// Eliminar compras por lote
router.delete("/compras/lote/:id_lote", authRequired, deleteLoteCompras);

export default router;
