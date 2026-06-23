import { SEDES_VALIDAS } from "../constants/sedes.js";

// Store plano (sin React) que mantiene la sede activa de la pestaña.
// Sirve para que axios pueda leerla en su interceptor sin depender de hooks.
// La fuente de verdad sigue siendo SedeContext: este módulo es un espejo
// sincronizado por el provider.

const STORAGE_KEY = "sede_activa";

let sedeActual = null;

export const getSede = () => sedeActual;

export const setSede = (sede) => {
  if (sede && !SEDES_VALIDAS.includes(sede)) {
    // No persistimos valores inválidos para no envenenar el storage.
    return;
  }
  sedeActual = sede || null;
  if (sede) {
    localStorage.setItem(STORAGE_KEY, sede);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const readPersistedSede = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw && SEDES_VALIDAS.includes(raw) ? raw : null;
};

export const clearSede = () => {
  sedeActual = null;
  localStorage.removeItem(STORAGE_KEY);
};
