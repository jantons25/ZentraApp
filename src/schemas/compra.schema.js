import { z } from "zod";

// Esquema individual de compra
export const compraItemSchema = z.object({
  cantidad: z
    .number({ required_error: "Cantidad es requerida" })
    .min(0, { message: "Cantidad debe ser mayor o igual a 0" }),

  precio_compra: z
    .number({ required_error: "Precio de compra es requerido" })
    .min(0, { message: "Precio debe ser mayor o igual a 0" }),

  producto: z
    .string({ required_error: "Producto es requerido" })
    .min(1, { message: "Producto debe tener al menos 1 caracter" }),

  fecha_vencimiento: z.string().datetime().optional(),
});

// Validación para crear una o más compras
export const createCompraSchema = z.preprocess((val) => {
  if (!Array.isArray(val)) return [val];
  return val;
}, z.array(compraItemSchema));

// Validación para actualizar compras en lote
export const updateCompraSchema = z.object({
  ids: z.array(z.string().min(1, "ID inválido")).nonempty("Se requiere al menos un ID"),
  nuevasCompras: z.array(compraItemSchema).nonempty("Se requiere al menos una compra"),
});

// Validación para actualizar una sola compra
export const updateCompraUnitSchema = z.object({
  cantidad: z.number().min(0).optional(),
  precio_compra: z.number().min(0).optional(),
  importe_compra: z.number().min(0).optional(),
  producto: z.string().min(1).optional(),
  fecha_vencimiento: z.string().datetime().optional(),
});
