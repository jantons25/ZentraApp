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
import { resolveSede } from "../middlewares/resolveSede.js";
const router = Router();

router.get("/reposiciones", authRequired, resolveSede, getReposiciones);
router.post("/reposiciones", authRequired, resolveSede, createReposicion);
router.put("/reposiciones/lote", authRequired, resolveSede, updateLoteReposiciones);
router.put("/reposiciones/:id", authRequired, resolveSede, updateReposicion);
router.delete(
  "/reposiciones/lote/:id_lote",
  authRequired, resolveSede,
  deleteLoteReposiciones
);
router.delete("/reposiciones/:id", authRequired, resolveSede, deleteReposicion);

export default router;
