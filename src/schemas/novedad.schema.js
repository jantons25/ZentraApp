import { z } from "zod";
import { TIPOS_NOVEDAD, ESTADOS_NOVEDAD } from "../models/novedades.model.js";

export const createNovedadSchema = z.object({
  titulo: z
    .string({
      required_error: "Título es requerido",
    })
    .min(3, { message: "Título debe tener al menos 3 caracteres" })
    .max(120, { message: "Título no debe superar los 120 caracteres" }),
  descripcion: z
    .string({
      required_error: "Descripción es requerida",
    })
    .min(3, { message: "Descripción debe tener al menos 3 caracteres" })
    .max(2000, { message: "Descripción no debe superar los 2000 caracteres" }),
  tipo: z
    .enum(TIPOS_NOVEDAD, {
      errorMap: () => ({ message: `Tipo debe ser uno de: ${TIPOS_NOVEDAD.join(", ")}` }),
    })
    .optional(),
  estado: z
    .enum(ESTADOS_NOVEDAD, {
      errorMap: () => ({ message: `Estado debe ser uno de: ${ESTADOS_NOVEDAD.join(", ")}` }),
    })
    .optional(),
});

export const updateNovedadSchema = createNovedadSchema.partial();
