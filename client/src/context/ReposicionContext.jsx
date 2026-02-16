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

export function ReposicionProvider({ children }) {
  const [reposiciones, setReposiciones] = useState([]);

  const getReposiciones = async () => {
    try {
      const res = await getReposicionesRequest();
      setReposiciones(res.data);
    } catch (error) {
      toast.error(
        `Error al obtener las reposiciones: ${error.response.data.error}`
      );
    }
  };

  const deleteReposicion = async (id) => {
    try {
      const res = await deleteReposicionRequest(id);
      if (res.status === 200) {
        setReposiciones((prevReposiciones) =>
          prevReposiciones.filter((reposicion) => reposicion._id !== id)
        );
        toast.success("Reposición eliminada");
      }
    } catch (error) {
      toast.error(
        `Error al eliminar la reposición: ${error.response.data.error}`
      );
    }
  };

  const deleteLoteReposiciones = async (id_lote) => {
    try {
      await deleteLoteReposicionesRequest(id_lote);
      toast.success("Lote de reposiciones eliminado");
    } catch (error) {
      toast.error(
        `Error al eliminar el lote de reposiciones: ${error.response.data.error}`
      );
    }
  };

  const createReposicion = async (data) => {
    try {
      const res = await createReposicionRequest(data);
      const nuevas = Array.isArray(res.data.reposiciones)
        ? res.data.reposiciones
        : [];
      setReposiciones((prevReposiciones) => [...prevReposiciones, ...nuevas]);
      toast.success("Reposición creada");
    } catch (error) {
      toast.error(
        `Error al registrar reposiciones: ${error.response.data.message}`
      );
    }
  };

  const updateLoteReposicion = async ({ ids, reposiciones }) => {
    try {
      const res = await updateReposicionLoteRequest({
        ids,
        reposiciones,
      });
      const nuevas = Array.isArray(res.data.reposiciones)
        ? res.data.reposiciones
        : [];
      setReposiciones((prevReposiciones) => {
        const idsSet = new Set(ids);
        const reposicionesFiltradas = prevReposiciones.filter(
          (reposicion) => !idsSet.has(reposicion._id)
        );
        return [...reposicionesFiltradas, ...nuevas];
      });
      toast.success("Lote de reposiciones actualizado");
      return nuevas;
    } catch (error) {
      toast.error(
        `Error al actualizar el lote de reposiciones: ${error.response.data.error}`
      );
    }
  };

  return (
    <ReposicionContext.Provider
      value={{
        reposiciones,
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
