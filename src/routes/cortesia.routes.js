import { Router } from "express";
import { getCortesias, createCortesia, deleteCortesia, deleteLoteCortesias, updateLoteCortesias, updateCortesia } from "../controllers/cortesia.controller.js";
import { authRequired } from "../middlewares/validateToken.js";

const router = Router();

router.get('/cortesias', authRequired, getCortesias)
router.post('/cortesias', authRequired, createCortesia)
router.put('/cortesias/lote', authRequired, updateLoteCortesias)
router.put('/cortesias/:id', authRequired, updateCortesia)
router.delete('/cortesias/lote/:id_lote', authRequired, deleteLoteCortesias)
router.delete('/cortesias/:id', authRequired, deleteCortesia)

export default router;