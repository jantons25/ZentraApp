import { createContext, useContext, useState } from "react";
import { toast } from "react-hot-toast";
import {
  createSalidaRequest,
  getAllSalidasRequest,
  getSalidasRequest,
  updateSalidaRequest,
  updateLoteSalidasRequest,
  deleteSalidaRequest,
  deleteLoteSalidasRequest,
  deleteLoteSalidasCompletosRequest,
} from "../api/salidas";

const SalidaContext = createContext();

export const useSalida = () => {
  const context = useContext(SalidaContext);
  if (!context) {
    throw new Error("useSalida must be used within a SalidaProvider");
  }
  return context;
};

const getErrorMsg = (error) =>
  error.response?.data?.message || error.response?.data?.error || error.message || "Error inesperado";

export function SalidaProvider({ children }) {
  const [salidas, setSalidas] = useState([]);
  const [loading, setLoading] = useState(false);

  const getSalidas = async () => {
    setLoading(true);
    try {
      const res = await getSalidasRequest();
      setSalidas(res.data);
    } catch (error) {
      toast.error(`Error al obtener las salidas: ${getErrorMsg(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const getAllSalidas = async () => {
    setLoading(true);
    try {
      const res = await getAllSalidasRequest();
      setSalidas(res.data);
    } catch (error) {
      toast.error(`Error al obtener todas las salidas: ${getErrorMsg(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteSalida = async (id) => {
    try {
      const res = await deleteSalidaRequest(id);
      if (res.status === 200 || res.status === 204) {
        setSalidas((prev) => prev.filter((salida) => salida._id !== id));
        toast.success("Salida eliminada");
      }
    } catch (error) {
      toast.error(`Error al eliminar la salida: ${getErrorMsg(error)}`);
    }
  };

  const deleteLoteSalidas = async (id_lote) => {
    try {
      const res = await deleteLoteSalidasRequest(id_lote);
      if (res.status === 200) {
        setSalidas((prev) => prev.filter((s) => s.id_lote !== id_lote));
        toast.success("Lote de salidas eliminado");
      }
    } catch (error) {
      toast.error(`No se pudo eliminar el lote de salidas: ${getErrorMsg(error)}`);
    }
  };

  const deleteLoteCompletoSalidas = async (id_lote) => {
    try {
      const res = await deleteLoteSalidasCompletosRequest(id_lote);
      if (res.status === 200) {
        setSalidas((prev) => prev.filter((s) => s.id_lote !== id_lote));
        toast.success("Lote de salidas eliminado");
      }
    } catch (error) {
      toast.error(`No se pudo eliminar el lote de salidas: ${getErrorMsg(error)}`);
    }
  };

  const createSalida = async (data) => {
    try {
      const res = await createSalidaRequest(data);
      const nuevas = Array.isArray(res.data?.salidas)
        ? res.data.salidas
        : Array.isArray(res.data)
        ? res.data
        : [res.data];

      setSalidas((prev) => [...prev, ...nuevas]);
      toast.success("Salidas registradas con éxito");
      return nuevas;
    } catch (error) {
      toast.error(`Error al registrar salidas: ${getErrorMsg(error)}`);
      throw error;
    }
  };

  const updateSalida = async (id, data) => {
    try {
      const res = await updateSalidaRequest(id, data);
      if (res.data?.salida) {
        setSalidas((prev) =>
          prev.map((s) => (s._id === id ? res.data.salida : s))
        );
      }
      toast.success("Salida actualizada correctamente");
      return res.data;
    } catch (error) {
      toast.error(`Error al actualizar la salida: ${getErrorMsg(error)}`);
      throw error;
    }
  };

  const updateLoteSalidas = async (ids, nuevasSalidas) => {
    try {
      const res = await updateLoteSalidasRequest({ ids, nuevasSalidas });
      const nuevas = Array.isArray(res.data?.salidas) ? res.data.salidas : [];
      setSalidas((prev) => {
        const idSet = new Set(ids);
        const filtradas = prev.filter((s) => !idSet.has(s._id));
        return [...filtradas, ...nuevas];
      });
      toast.success("Lote de salidas actualizado");
      return res.data;
    } catch (error) {
      toast.error(`No se pudo actualizar el lote de salidas: ${getErrorMsg(error)}`);
      throw error;
    }
  };

  return (
    <SalidaContext.Provider
      value={{
        salidas,
        loading,
        getSalidas,
        getAllSalidas,
        deleteSalida,
        deleteLoteSalidas,
        createSalida,
        updateSalida,
        updateLoteSalidas,
        deleteLoteCompletoSalidas,
      }}
    >
      {children}
    </SalidaContext.Provider>
  );
}
