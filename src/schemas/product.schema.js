import {z} from 'zod';

export const createProductSchema = z.object({
    nombre: z.string({
        required_error: 'Nombre es requerido',
    }).min(1, {message: 'Nombre debe tener al menos 1 caracter'}),
    categoria: z.string({
        required_error: 'Categoria es requerida',
    }).min(1, {message: 'Categoria debe tener al menos 1 caracter'}),
    date: z.string().datetime().optional()
})