import { toast } from "react-hot-toast";
import { createContext, useContext, useState } from "react";
import {
  getNovedadesRequest,
  getNovedadRequest,
  createNovedadRequest,
  updateNovedadRequest,
  deleteNovedadRequest,
} from "../api/novedades.js";

const NovedadContext = createContext();

export const useNovedad = () => {
  const context = useContext(NovedadContext);
  if (!context) {
    throw new Error("useNovedad must be used within a NovedadProvider");
  }
  return context;
};

const getErrorMsg = (error) =>
  error.response?.data?.message || error.response?.data?.error || error.message || "Error inesperado";

export function NovedadProvider({ children }) {
  const [novedades, setNovedades] = useState([]);
  const [loading, setLoading] = useState(false);

  const obtenerNovedades = async (filtros) => {
    setLoading(true);
    try {
      const res = await getNovedadesRequest(filtros);
      setNovedades(res.data);
    } catch (error) {
      toast.error(`Error al obtener las novedades: ${getErrorMsg(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const obtenerNovedad = async (id) => {
    try {
      const res = await getNovedadRequest(id);
      return res.data;
    } catch (error) {
      toast.error(`Error al obtener la novedad: ${getErrorMsg(error)}`);
    }
  };

  const crearNovedad = async (data) => {
    try {
      const res = await createNovedadRequest(data);
      setNovedades((prev) => [res.data.novedad, ...prev]);
      toast.success("Novedad registrada");
      return res.data.novedad;
    } catch (error) {
      toast.error(`Error al crear la novedad: ${getErrorMsg(error)}`);
    }
  };

  const actualizarNovedad = async (id, data) => {
    try {
      const res = await updateNovedadRequest(id, data);
      setNovedades((prev) =>
        prev.map((n) => (n._id === id ? res.data.novedad : n))
      );
      toast.success("Novedad actualizada correctamente");
      return res.data.novedad;
    } catch (error) {
      toast.error(`Error al actualizar la novedad: ${getErrorMsg(error)}`);
    }
  };

  const eliminarNovedad = async (id) => {
    try {
      const res = await deleteNovedadRequest(id);
      if (res.status === 200) {
        setNovedades((prev) => prev.filter((novedad) => novedad._id !== id));
        toast.success("Novedad eliminada");
      }
    } catch (error) {
      toast.error(`Error al eliminar la novedad: ${getErrorMsg(error)}`);
    }
  };

  return (
    <NovedadContext.Provider
      value={{
        novedades,
        loading,
        obtenerNovedades,
        obtenerNovedad,
        crearNovedad,
        actualizarNovedad,
        eliminarNovedad,
      }}
    >
      {children}
    </NovedadContext.Provider>
  );
}
