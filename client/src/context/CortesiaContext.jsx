import { toast } from "react-hot-toast";
import { createContext, useContext, useState } from "react";
import {
  getCortesiasRequest,
  createCortesiaRequest,
  updateCortesiaLoteRequest,
  updateCortesiaRequest,
  deleteCortesiaRequest,
  deleteLoteCortesiasRequest,
} from "../api/cortesia.js";

const CortesiaContext = createContext();

export const useCortesia = () => {
  const context = useContext(CortesiaContext);
  if (!context) {
    throw new Error("useCortesia must be used within a CortesiaProvider");
  }
  return context;
};

const getErrorMsg = (error) =>
  error.response?.data?.message || error.response?.data?.error || error.message || "Error inesperado";

export function CortesiaProvider({ children }) {
  const [cortesias, setCortesias] = useState([]);
  const [loading, setLoading] = useState(false);

  const getCortesias = async () => {
    setLoading(true);
    try {
      const res = await getCortesiasRequest();
      setCortesias(res.data);
    } catch (error) {
      toast.error(`Error al obtener las cortesías: ${getErrorMsg(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteCortesia = async (id) => {
    try {
      const res = await deleteCortesiaRequest(id);
      if (res.status === 200) {
        setCortesias((prev) => prev.filter((cortesia) => cortesia._id !== id));
        toast.success("Cortesía eliminada");
      }
    } catch (error) {
      toast.error(`Error al eliminar la cortesía: ${getErrorMsg(error)}`);
    }
  };

  const deleteLoteCortesias = async (id_lote) => {
    try {
      await deleteLoteCortesiasRequest(id_lote);
      setCortesias((prev) =>
        prev.filter((cortesia) => cortesia.id_lote !== id_lote)
      );
      toast.success("Lote de cortesías eliminado");
    } catch (error) {
      toast.error(`Error al eliminar el lote de cortesías: ${getErrorMsg(error)}`);
    }
  };

  const createCortesia = async (data) => {
    try {
      const res = await createCortesiaRequest(data);
      const nuevas = Array.isArray(res.data.cortesias) ? res.data.cortesias : [];
      setCortesias((prev) => [...prev, ...nuevas]);
      toast.success("Cortesía registrada");
    } catch (error) {
      toast.error(`Error al crear cortesías: ${getErrorMsg(error)}`);
    }
  };

  const updateCortesia = async (id, data) => {
    try {
      const res = await updateCortesiaRequest(id, data);
      setCortesias((prev) =>
        prev.map((c) => (c._id === id ? res.data.cortesia : c))
      );
      toast.success("Cortesía actualizada correctamente");
      return res.data;
    } catch (error) {
      toast.error(`Error al actualizar la cortesía: ${getErrorMsg(error)}`);
    }
  };

  const updateLoteCortesia = async ({ ids, nuevasCortesias }) => {
    try {
      const res = await updateCortesiaLoteRequest({ ids, nuevasCortesias });
      const nuevas = Array.isArray(res.data.cortesias) ? res.data.cortesias : [];

      setCortesias((prev) => {
        const idsSet = new Set(ids);
        const filtradas = prev.filter((c) => !idsSet.has(c._id));
        return [...filtradas, ...nuevas];
      });

      toast.success("Lote de cortesías actualizado");
      return nuevas;
    } catch (error) {
      toast.error(`Error al actualizar el lote de cortesías: ${getErrorMsg(error)}`);
    }
  };

  return (
    <CortesiaContext.Provider
      value={{
        cortesias,
        loading,
        getCortesias,
        createCortesia,
        deleteCortesia,
        deleteLoteCortesias,
        updateCortesia,
        updateLoteCortesia,
      }}
    >
      {children}
    </CortesiaContext.Provider>
  );
}
