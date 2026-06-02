import { toast } from "react-hot-toast";
import { createContext, useContext, useState } from "react";
import {
  getReposicionesRequest,
  createReposicionRequest,
  updateReposicionLoteRequest,
  deleteReposicionRequest,
  deleteLoteReposicionesRequest,
} from "../api/reposiciones.js";

const ReposicionContext = createContext();

export const useReposicion = () => {
  const context = useContext(ReposicionContext);
  if (!context) {
    throw new Error("useReposicion must be used within a ReposicionProvider");
  }
  return context;
};

const getErrorMsg = (error) =>
  error.response?.data?.message || error.response?.data?.error || error.message || "Error inesperado";

export function ReposicionProvider({ children }) {
  const [reposiciones, setReposiciones] = useState([]);
  const [loading, setLoading] = useState(false);

  const getReposiciones = async () => {
    setLoading(true);
    try {
      const res = await getReposicionesRequest();
      setReposiciones(res.data);
    } catch (error) {
      toast.error(`Error al obtener las reposiciones: ${getErrorMsg(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteReposicion = async (id) => {
    try {
      const res = await deleteReposicionRequest(id);
      if (res.status === 200) {
        setReposiciones((prev) =>
          prev.filter((reposicion) => reposicion._id !== id)
        );
        toast.success("Reposición eliminada");
      }
    } catch (error) {
      toast.error(`Error al eliminar la reposición: ${getErrorMsg(error)}`);
    }
  };

  const deleteLoteReposiciones = async (id_lote) => {
    try {
      const res = await deleteLoteReposicionesRequest(id_lote);
      if (res.status === 200) {
        setReposiciones((prev) =>
          prev.filter((r) => r.id_lote !== id_lote)
        );
        toast.success("Lote de reposiciones eliminado");
      }
    } catch (error) {
      toast.error(`Error al eliminar el lote de reposiciones: ${getErrorMsg(error)}`);
    }
  };

  const createReposicion = async (data) => {
    try {
      const res = await createReposicionRequest(data);
      const nuevas = Array.isArray(res.data.reposiciones) ? res.data.reposiciones : [];
      setReposiciones((prev) => [...prev, ...nuevas]);
      toast.success("Reposición creada");
    } catch (error) {
      toast.error(`Error al registrar reposiciones: ${getErrorMsg(error)}`);
    }
  };

  const updateLoteReposicion = async ({ ids, reposiciones }) => {
    try {
      const res = await updateReposicionLoteRequest({ ids, reposiciones });
      const nuevas = Array.isArray(res.data.reposiciones) ? res.data.reposiciones : [];
      setReposiciones((prev) => {
        const idsSet = new Set(ids);
        const filtradas = prev.filter((r) => !idsSet.has(r._id));
        return [...filtradas, ...nuevas];
      });
      toast.success("Lote de reposiciones actualizado");
      return nuevas;
    } catch (error) {
      toast.error(`Error al actualizar el lote de reposiciones: ${getErrorMsg(error)}`);
    }
  };

  return (
    <ReposicionContext.Provider
      value={{
        reposiciones,
        loading,
        createReposicion,
        getReposiciones,
        deleteReposicion,
        deleteLoteReposiciones,
        updateLoteReposicion,
      }}
    >
      {children}
    </ReposicionContext.Provider>
  );
}
