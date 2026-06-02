import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  getUsers, login, logout, profile, register,
  deleteUser, updateUser, verifyTokenRequest,
} from "../controllers/auth.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { requireRole } from "../middlewares/requireRole.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { validateObjectId } from "../middlewares/validateObjectId.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Demasiados intentos de login, intenta en 15 minutos." },
});

const router = Router();

router.get("/users", authRequired, requireRole("admin", "superadmin"), getUsers);
router.post("/register", authRequired, requireRole("admin", "superadmin"), validateSchema(registerSchema), register);
router.post("/login", authLimiter, validateSchema(loginSchema), login);
router.post("/logout", logout);
router.get("/verify", verifyTokenRequest);
router.get("/profile", authRequired, profile);
router.delete("/users/:id", authRequired, requireRole("admin", "superadmin"), validateObjectId(), deleteUser);
router.put("/users/:id", authRequired, validateObjectId(), updateUser);

export default router;
