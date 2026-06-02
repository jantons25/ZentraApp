import dotenv from "dotenv";
dotenv.config();
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import CompraRoutes from "./routes/compra.routes.js";
import VentaRoutes from "./routes/venta.routes.js";
import SalidaRoutes from "./routes/salidas.routes.js";
import ReposicionesRoutes from "./routes/reposicion.routes.js";
import CortesiasRoutes from "./routes/cortesia.routes.js";
import RelevoRoutes from "./routes/relevo.routes.js";
import ReservaRoutes from "./routes/reserva.routes.js";
import DetalleReservaRoutes from "./routes/detalleReserva.routes.js";
import Cliente from "./routes/cliente.routes.js";
import Espacio from "./routes/espacio.routes.js";
import VeladaRoutes from "./routes/velada.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(helmet());

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173").split(",");
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origin no permitido por CORS"));
      }
    },
    credentials: true,
  })
);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiadas solicitudes, intenta de nuevo más tarde." },
});
app.use(globalLimiter);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "API funcionando correctamente",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", authRoutes);
app.use("/api", productRoutes);
app.use("/api", CompraRoutes);
app.use("/api", VentaRoutes);
app.use("/api", SalidaRoutes);
app.use("/api", ReposicionesRoutes);
app.use("/api", CortesiasRoutes);
app.use("/api", RelevoRoutes);
app.use("/api", ReservaRoutes);
app.use("/api", DetalleReservaRoutes);
app.use("/api", Cliente);
app.use("/api", Espacio);
app.use("/api", VeladaRoutes);

app.use(errorHandler);

export default app;
