import { Router } from "express";
import { getVeladas, createVelada, deleteVelada, deleteLoteVeladas, updateLoteVeladas } from "../controllers/velada.controller.js";
import { authRequired } from "../middlewares/validateToken.js";

const router = Router();

router.get('/veladas', authRequired, getVeladas)
router.post('/veladas', authRequired, createVelada)
router.delete('/veladas/:id', authRequired, deleteVelada)
router.delete('/veladas/lote/:id_lote', authRequired, deleteLoteVeladas)
router.put('/veladas/lote', authRequired, updateLoteVeladas)

export default router;