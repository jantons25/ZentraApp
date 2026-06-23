import { Router } from "express";
import { getVeladas, createVelada, deleteVelada, deleteLoteVeladas, updateLoteVeladas, updateVelada } from "../controllers/velada.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { resolveSede } from "../middlewares/resolveSede.js";

const router = Router();

router.get('/veladas', authRequired, resolveSede, getVeladas)
router.post('/veladas', authRequired, resolveSede, createVelada)
router.put('/veladas/lote', authRequired, resolveSede, updateLoteVeladas)
router.put('/veladas/:id', authRequired, resolveSede, updateVelada)
router.delete('/veladas/lote/:id_lote', authRequired, resolveSede, deleteLoteVeladas)
router.delete('/veladas/:id', authRequired, resolveSede, deleteVelada)

export default router;