import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { resolveSede } from "../middlewares/resolveSede.js";
import { createProductSchema } from "../schemas/product.schema.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import {
  createNewProduct,
  deleteProduct,
  getProductos,
  updateProduct,
  getProductoPorId,
} from "../controllers/products.controller.js";

const router = Router();

router.get("/products", authRequired, resolveSede, getProductos);
router.get("/products/all", authRequired, resolveSede, getProductos);
router.get("/products/:id", authRequired, resolveSede, getProductoPorId);
router.post(
  "/products",
  authRequired, resolveSede,
  validateSchema(createProductSchema),
  createNewProduct
);
router.put("/products/:id", authRequired, resolveSede, updateProduct);
router.delete("/products/:id", authRequired, resolveSede, deleteProduct);

export default router;
