import { z } from "zod";

// Esquema individual de venta
export const ventaItemSchema = z.object({
  cantidad: z
    .number({ required_error: "Cantidad es requerida" })
    .min(0, { message: "Cantidad debe ser mayor o igual a 0" }),

  pago_registrado: z
    .string({ required_error: "Confirmación de pago es requerido" })
    .min(1, { message: "Confirmación de pago debe tener al menos 1 caracter" }),

  precio_venta: z
    .number({ required_error: "Precio de venta es requerido" })
    .min(0, { message: "Precio de venta debe ser mayor o igual a 0" }),

  producto: z
    .string({ required_error: "Producto es requerido" })
    .min(1, { message: "Nombre del producto debe tener al menos 1 caracter" }),

  date: z.string().datetime().optional(),
  habitacion: z.string().optional(), // si aplica
});

export const createVentaSchema = z.preprocess((val) => {
  if (!Array.isArray(val)) return [val];
  return val;
}, z.array(ventaItemSchema));

export const updateVentaSchema = z.object({
  ids: z.array(z.string().min(1, "ID inválido")).nonempty("Se requiere al menos un ID"),
  nuevasVentas: z.array(ventaItemSchema).nonempty("Se requiere al menos una venta"),
});

export const updateVentaUnitSchema = z.object({
  cantidad: z.number().min(0).optional(),
  pago_registrado: z.string().min(1, "Pago registrado es requerido").optional(),
  habitacion: z.string().optional(),
  precio_venta: z.number().min(0).optional(),
  importe_venta: z.number().min(0).optional(),
  producto: z.string().min(1).optional(),
});
