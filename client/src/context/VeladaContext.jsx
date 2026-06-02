import { toast } from "react-hot-toast";
import { createContext, useContext, useState } from "react";
import {
  getVeladasRequest,
  createVeladaRequest,
  deleteVeladaRequest,
  deleteLoteVeladasRequest,
  updateLoteVeladasRequest,
} from "../api/velada.js";

const VeladaContext = createContext();

export const useVelada = () => {
  const context = useContext(VeladaContext);
  if (!context) {
    throw new Error("useVelada must be used within a VeladaProvider");
  }
  return context;
};

const getErrorMsg = (error) =>
  error.response?.data?.message || error.response?.data?.error || error.message || "Error inesperado";

export function VeladaProvider({ children }) {
  const [veladas, setVeladas] = useState([]);
  const [loading, setLoading] = useState(false);

  const getVeladas = async () => {
    setLoading(true);
    try {
      const res = await getVeladasRequest();
      setVeladas(res.data);
    } catch (error) {
      toast.error(`Error al obtener las veladas: ${getErrorMsg(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteVelada = async (id) => {
    try {
      const res = await deleteVeladaRequest(id);
      if (res.status === 200) {
        setVeladas((prev) => prev.filter((velada) => velada._id !== id));
        toast.success("Velada eliminada");
      }
    } catch (error) {
      toast.error(`Error al eliminar la velada: ${getErrorMsg(error)}`);
    }
  };

  const deleteLoteVeladas = async (id_lote) => {
    try {
      const res = await deleteLoteVeladasRequest(id_lote);
      if (res.status === 200) {
        setVeladas((prev) => prev.filter((velada) => velada.id_lote !== id_lote));
        toast.success("Lote de veladas eliminado");
      }
    } catch (error) {
      toast.error(`Error al eliminar el lote de veladas: ${getErrorMsg(error)}`);
    }
  };

  const createVelada = async (velada) => {
    try {
      const res = await createVeladaRequest(velada);
      const nuevas = Array.isArray(res.data.veladas) ? res.data.veladas : [];
      setVeladas((prev) => [...prev, ...nuevas]);
      toast.success("Velada registrada");
    } catch (error) {
      toast.error(`Error al crear la velada: ${getErrorMsg(error)}`);
    }
  };

  const updateLoteVelada = async ({ ids, nuevasVeladas }) => {
    try {
      const res = await updateLoteVeladasRequest({ ids, nuevasVeladas });
      const nuevas = Array.isArray(res.data.veladas) ? res.data.veladas : [];

      setVeladas((prev) => {
        const idsSet = new Set(ids);
        const filtradas = prev.filter((velada) => !idsSet.has(velada._id));
        return [...filtradas, ...nuevas];
      });

      toast.success("Lote de veladas actualizado");
      return nuevas;
    } catch (error) {
      toast.error(`Error al actualizar el lote de veladas: ${getErrorMsg(error)}`);
    }
  };

  return (
    <VeladaContext.Provider
      value={{
        veladas,
        loading,
        getVeladas,
        createVelada,
        deleteVelada,
        deleteLoteVeladas,
        updateLoteVelada,
      }}
    >
      {children}
    </VeladaContext.Provider>
  );
}
