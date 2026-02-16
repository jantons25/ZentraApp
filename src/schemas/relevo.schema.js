import {z} from 'zod';

export const createRelevoSchema = z.object({
    responsable: z.string({
        required_error: 'Responsable es requerido',
    }).min(1, {message: 'Debe especificar el responsable'}),
    recepcionista: z.string({
        required_error: 'Recepcionista es requerido',
    }).min(1, {message: 'Debe especificar el recepcionista'}),
    observacion: z.string().optional(),
    conformidad: z.string().optional(),
    user: z.string().optional()
});