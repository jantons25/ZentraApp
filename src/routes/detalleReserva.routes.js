import { Router } from "express";
import {
  registrarDetalleReserva,
  registrarPagoDetalleReserva,
} from "../controllers/detalleReserva.controller.js";
import { authRequired } from "../middlewares/validateToken.js";

const router = Router();

// Crear detalle (1–1 con reserva)
router.post(
  "/reservas/:reservaId/detalle",
  authRequired,
  registrarDetalleReserva
);

// Agregar pago a una reserva
router.post(
  "/reservas/:reservaId/detalle/pagos",
  authRequired,
  registrarPagoDetalleReserva
);

export default router;
