import { Router } from "express";
import { getCortesias, createCortesia, deleteCortesia, deleteLoteCortesias, updateLoteCortesias, updateCortesia } from "../controllers/cortesia.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { resolveSede } from "../middlewares/resolveSede.js";

const router = Router();

router.get('/cortesias', authRequired, resolveSede, getCortesias)
router.post('/cortesias', authRequired, resolveSede, createCortesia)
router.put('/cortesias/lote', authRequired, resolveSede, updateLoteCortesias)
router.put('/cortesias/:id', authRequired, resolveSede, updateCortesia)
router.delete('/cortesias/lote/:id_lote', authRequired, resolveSede, deleteLoteCortesias)
router.delete('/cortesias/:id', authRequired, resolveSede, deleteCortesia)

export default router;