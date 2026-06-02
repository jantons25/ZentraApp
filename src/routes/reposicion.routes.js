import { Router } from "express";
import {
  getReposiciones,
  createReposicion,
  deleteLoteReposiciones,
  deleteReposicion,
  updateLoteReposiciones,
  updateReposicion,
} from "../controllers/reposicion.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
const router = Router();

router.get("/reposiciones", authRequired, getReposiciones);
router.post("/reposiciones", authRequired, createReposicion);
router.put("/reposiciones/lote", authRequired, updateLoteReposiciones);
router.put("/reposiciones/:id", authRequired, updateReposicion);
router.delete(
  "/reposiciones/lote/:id_lote",
  authRequired,
  deleteLoteReposiciones
);
router.delete("/reposiciones/:id", authRequired, deleteReposicion);

export default router;
