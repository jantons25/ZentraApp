import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
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

router.get("/products", authRequired, getProductos);
router.get("/products/all", authRequired, getProductos);
router.get("/products/:id", authRequired, getProductoPorId);
router.post(
  "/products",
  authRequired,
  validateSchema(createProductSchema),
  createNewProduct
);
router.put("/products/:id", authRequired, updateProduct);
router.delete("/products/:id", authRequired, deleteProduct);

export default router;
