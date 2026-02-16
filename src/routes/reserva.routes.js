import { Router } from "express";
import {
  registrarReserva,
  obtenerReservas,
  obtenerReservaPorId,
  editarReserva,
  cancelarReserva,
} from "../controllers/reserva.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
const router = Router();

router.get("/reservas", authRequired, obtenerReservas);
router.get("/reservas/:id", authRequired, obtenerReservaPorId);

router.post("/reservas", authRequired, registrarReserva);
router.patch("/reservas/:id", authRequired, editarReserva);
router.patch("/reservas/:id/cancelar", authRequired, cancelarReserva);

export default router;
