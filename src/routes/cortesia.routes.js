import { Router } from "express";
import { getCortesias, createCortesia, deleteCortesia, deleteLoteCortesias, updateLoteCortesias } from "../controllers/cortesia.controller.js";
import { authRequired } from "../middlewares/validateToken.js";

const router = Router();

router.get('/cortesias', authRequired, getCortesias)
router.post('/cortesias', authRequired, createCortesia)
router.delete('/cortesias/:id', authRequired, deleteCortesia)
router.delete('/cortesias/lote/:id_lote', authRequired, deleteLoteCortesias)
router.put('/cortesias/lote', authRequired, updateLoteCortesias)

export default router;
