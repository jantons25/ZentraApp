import * as yup from "yup";

export const TIPOS_NOVEDAD = ["Incidente", "Informativo", "Mantenimiento", "Recordatorio"];
export const ESTADOS_NOVEDAD = ["Pendiente", "En proceso", "Finalizada"];

export const novedadSchema = yup.object().shape({
  titulo: yup
    .string()
    .trim()
    .required("El título es obligatorio")
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(120, "El título no debe superar los 120 caracteres"),
  descripcion: yup
    .string()
    .trim()
    .required("La descripción es obligatoria")
    .min(3, "La descripción debe tener al menos 3 caracteres")
    .max(2000, "La descripción no debe superar los 2000 caracteres"),
  tipo: yup
    .string()
    .oneOf(TIPOS_NOVEDAD, "Tipo inválido")
    .required("El tipo es obligatorio"),
  estado: yup
    .string()
    .oneOf(ESTADOS_NOVEDAD, "Estado inválido")
    .required("El estado es obligatorio"),
});
