import { Router } from "express";
import {
  registrarReserva,
  obtenerReservas,
  obtenerReservaPorId,
  editarReserva,
  cancelarReserva,
} from "../controllers/reserva.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { resolveSede } from "../middlewares/resolveSede.js";
const router = Router();

router.get("/reservas", authRequired, resolveSede, obtenerReservas);
router.get("/reservas/:id", authRequired, resolveSede, obtenerReservaPorId);

router.post("/reservas", authRequired, resolveSede, registrarReserva);
router.patch("/reservas/:id", authRequired, resolveSede, editarReserva);
router.patch("/reservas/:id/cancelar", authRequired, resolveSede, cancelarReserva);

export default router;
