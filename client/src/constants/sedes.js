// Espejo del backend (src/constants/sedes.js). Mantener sincronizado.
export const SEDES_VALIDAS = ["ZentraSanJose", "ZentraPlaza", "ZentraBalta"];

export const SEDE_POR_DEFECTO = "ZentraBalta";

export const esSedeValida = (sede) => SEDES_VALIDAS.includes(sede);

// Etiquetas legibles para la UI.
export const SEDE_LABELS = {
  ZentraSanJose: "Zentra San José",
  ZentraPlaza: "Zentra Plaza",
  ZentraBalta: "Zentra Balta",
};

export const etiquetaDeSede = (sede) => SEDE_LABELS[sede] || sede || "";
