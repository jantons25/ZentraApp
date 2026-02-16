import { Router } from "express";
import {
  getReposiciones,
  createReposicion,
  deleteLoteReposiciones,
  deleteReposicion,
  updateLoteReposiciones,
} from "../controllers/reposicion.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
const router = Router();

router.get("/reposiciones", authRequired, getReposiciones);
router.post("/reposiciones", authRequired, createReposicion);
router.delete("/reposiciones/:id", authRequired, deleteReposicion);
router.delete(
  "/reposiciones/lote/:id_lote",
  authRequired,
  deleteLoteReposiciones
);
router.put("/reposiciones/lote", authRequired, updateLoteReposiciones);

export default router;
