import { Router } from "express";
import {getUsers, login, logout, profile, register, deleteUser, updateUser, verifyTokenRequest} from '../controllers/auth.controller.js';
import { authRequired } from "../middlewares/validateToken.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import {loginSchema, registerSchema} from '../schemas/auth.schema.js'

const router = Router();

router.get('/users', authRequired, getUsers)
router.post('/register', validateSchema(registerSchema), register)
router.post('/login', validateSchema(loginSchema), login)
router.post('/logout', logout)
router.get('/verify', verifyTokenRequest)
router.get('/profile', authRequired, profile)
router.delete('/users/:id', authRequired, deleteUser)
router.put('/users/:id', authRequired, updateUser)

export default router;