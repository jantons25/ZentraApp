// Helpers visuales compartidos por las tres vistas de Novedades

export const TIPO_DOT = {
  Incidente: "bg-red-500",
  Informativo: "bg-blue-500",
  Mantenimiento: "bg-yellow-500",
  Recordatorio: "bg-purple-500",
};

export const ESTADO_BADGE = {
  Pendiente: "bg-red-100 text-red-700",
  "En proceso": "bg-yellow-100 text-yellow-700",
  Finalizada: "bg-green-100 text-green-700",
};

export const formatearFechaNovedad = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";
