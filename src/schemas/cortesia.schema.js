import {z} from 'zod';

export const createCortesiaSchema = z.object({
    producto: z.string({
        required_error: 'Producto es requerido',
    }).min(1, {message: 'Nombre del producto debe tener al menos 1 caracter'}),
    cantidad: z.number({
        required_error: 'Cantidad es requerida',
    }).min(0, {message: 'Cantidad debe ser mayor o igual a 0'}),
    responsable: z.string({
        required_error: 'Responsable es requerido',
    }).min(1, {message: 'Debe especificar el responsable'}).optional(),
    observacion: z.string().optional(),
    date: z.string().datetime().optional()
})