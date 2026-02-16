import { Router } from "express";
import {getRelevo, getRelevos, createRelevo, deleteRelevo, updateRelevo, getAllRelevos} from '../controllers/relevo.controller.js';
import { authRequired } from "../middlewares/validateToken.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import {createRelevoSchema} from '../schemas/relevo.schema.js'

const router = Router();    
router.get('/relevos', authRequired, getRelevos)
router.get('/relevos/all', authRequired, getAllRelevos)
router.get('/relevos/:id', authRequired, getRelevo)
router.post('/relevos', authRequired, validateSchema(createRelevoSchema), createRelevo)
router.delete('/relevos/:id', authRequired, deleteRelevo)
router.put('/relevos/:id', authRequired, updateRelevo)

export default router;