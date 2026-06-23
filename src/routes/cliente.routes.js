import { Router } from "express";
import {
  registrarCliente,
  obtenerClientes,
  obtenerClientePorId,
  actualizarCliente,
  cambiarContrasenaCliente,
  eliminarCliente,
} from "../controllers/cliente.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { resolveSede } from "../middlewares/resolveSede.js";

const router = Router();

router.get("/clientes", authRequired, resolveSede, obtenerClientes);
router.get("/clientes/:id", authRequired, resolveSede, obtenerClientePorId);
router.post("/clientes", authRequired, resolveSede, registrarCliente);
router.put("/clientes/:id", authRequired, resolveSede, actualizarCliente);

// ruta específica para cambiar contraseña (mejor que mezclarlo con update)
router.patch("/clientes/:id/password", authRequired, resolveSede, cambiarContrasenaCliente);

router.delete("/clientes/:id", authRequired, resolveSede, eliminarCliente);

export default router;
