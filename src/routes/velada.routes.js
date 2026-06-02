import { Router } from "express";
import { getVeladas, createVelada, deleteVelada, deleteLoteVeladas, updateLoteVeladas, updateVelada } from "../controllers/velada.controller.js";
import { authRequired } from "../middlewares/validateToken.js";

const router = Router();

router.get('/veladas', authRequired, getVeladas)
router.post('/veladas', authRequired, createVelada)
router.put('/veladas/lote', authRequired, updateLoteVeladas)
router.put('/veladas/:id', authRequired, updateVelada)
router.delete('/veladas/lote/:id_lote', authRequired, deleteLoteVeladas)
router.delete('/veladas/:id', authRequired, deleteVelada)

export default router;