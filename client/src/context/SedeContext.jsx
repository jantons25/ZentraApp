import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import {
  SEDES_VALIDAS,
  SEDE_POR_DEFECTO,
  esSedeValida,
  etiquetaDeSede,
} from "../constants/sedes.js";
import {
  getSede,
  setSede as setSedeStore,
  readPersistedSede,
  clearSede,
} from "../lib/sedeStore.js";

const SedeContext = createContext(null);

export const useSede = () => {
  const ctx = useContext(SedeContext);
  if (!ctx) throw new Error("useSede must be used within a SedeProvider");
  return ctx;
};

const ROLES_MULTI_SEDE = ["admin", "superadmin"];

export const SedeProvider = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [sedeActiva, setSedeActivaState] = useState(() => getSede());

  const puedeCambiarSede = !!user && ROLES_MULTI_SEDE.includes(user.role);

  // Sincroniza estado interno + sedeStore + localStorage en un solo lugar.
  const aplicarSede = (sede) => {
    setSedeStore(sede);
    setSedeActivaState(sede || null);
  };

  // Decide la sede activa según el rol del usuario autenticado.
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user) {
      // Sin sesión: limpiamos cualquier rastro previo.
      clearSede();
      setSedeActivaState(null);
      return;
    }

    if (user.role === "recepcionista") {
      // Sede fija dictada por la BD; ignoramos el localStorage.
      if (esSedeValida(user.sede)) {
        aplicarSede(user.sede);
      } else {
        // Recepcionista mal configurado: no fijamos sede, el backend devolverá 403.
        clearSede();
        setSedeActivaState(null);
      }
      return;
    }

    if (ROLES_MULTI_SEDE.includes(user.role)) {
      const persistida = readPersistedSede();
      aplicarSede(persistida || SEDE_POR_DEFECTO);
      return;
    }

    // Cualquier otro rol: sin sede.
    clearSede();
    setSedeActivaState(null);
  }, [user, isAuthenticated, loading]);

  // Refleja la sede activa en el título de la pestaña (UX: identificar de un vistazo).
  useEffect(() => {
    if (sedeActiva) {
      document.title = `Zentra · ${etiquetaDeSede(sedeActiva)}`;
    } else {
      document.title = "Zentra";
    }
  }, [sedeActiva]);

  // Setter público: solo aplica para roles multi-sede.
  const setSedeActiva = (nueva) => {
    if (!puedeCambiarSede) return;
    if (!esSedeValida(nueva)) return;
    aplicarSede(nueva);
  };

  const value = {
    sedeActiva,
    setSedeActiva,
    puedeCambiarSede,
    sedesDisponibles: SEDES_VALIDAS,
  };

  return <SedeContext.Provider value={value}>{children}</SedeContext.Provider>;
};
