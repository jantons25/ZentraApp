import { Router } from "express";
import {getRelevo, getRelevos, createRelevo, deleteRelevo, updateRelevo, getAllRelevos} from '../controllers/relevo.controller.js';
import { authRequired } from "../middlewares/validateToken.js";
import { resolveSede } from "../middlewares/resolveSede.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import {createRelevoSchema} from '../schemas/relevo.schema.js'

const router = Router();    
router.get('/relevos', authRequired, resolveSede, getRelevos)
router.get('/relevos/all', authRequired, resolveSede, getAllRelevos)
router.get('/relevos/:id', authRequired, resolveSede, getRelevo)
router.post('/relevos', authRequired, resolveSede, validateSchema(createRelevoSchema), createRelevo)
router.delete('/relevos/:id', authRequired, resolveSede, deleteRelevo)
router.put('/relevos/:id', authRequired, resolveSede, updateRelevo)

export default router;