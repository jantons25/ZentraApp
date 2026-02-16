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

const router = Router();

router.get("/clientes", authRequired, obtenerClientes);
router.get("/clientes/:id", authRequired, obtenerClientePorId);
router.post("/clientes", authRequired, registrarCliente);
router.put("/clientes/:id", authRequired, actualizarCliente);

// ruta específica para cambiar contraseña (mejor que mezclarlo con update)
router.patch("/clientes/:id/password", authRequired, cambiarContrasenaCliente);

router.delete("/clientes/:id", authRequired, eliminarCliente);

export default router;
