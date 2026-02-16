import { z } from "zod";

// Subesquema para lotes usados en FIFO
const loteUsadoSchema = z.object({
  compra: z.string({ required_error: "ID de compra es requerido" }),
  cantidad: z.number().min(0, "Cantidad debe ser mayor o igual a 0"),
  precio_compra: z.number().min(0).optional(),
  lote: z.string().optional(),
});

export const salidaItemSchema = z.object({
  cantidad: z
    .number({ required_error: "Cantidad es requerida" })
    .min(0, { message: "Cantidad debe ser mayor o igual a 0" }),

  producto: z
    .string({ required_error: "Producto es requerido" })
    .min(1, { message: "Nombre del producto debe tener al menos 1 caracter" }),

  lotes_usados: z.array(loteUsadoSchema).optional(), 
});

export const createSalidasSchema = z.preprocess((val) => {
  if (!Array.isArray(val)) return [val];
  return val;
}, z.array(salidaItemSchema));

export const updateSalidaSchema = z.object({
  ids: z
    .array(z.string().min(1, "ID inválido"))
    .nonempty("Se requiere al menos un ID"),
  nuevasSalidas: z
    .array(salidaItemSchema)
    .nonempty("Se requiere al menos una salida"),
});

// Actualización individual
export const updateSalidaUnitSchema = z.object({
  cantidad: z.number().min(0).optional(),
  producto: z.string().min(1).optional(),
  lotes_usados: z.array(loteUsadoSchema).optional(), 
});
