import { toast } from "react-hot-toast";
import { createContext, useContext, useState } from "react";
import {
  createRelevoRequest,
  getRelevoRequest,
  getRelevosRequest,
  deleteRelevoRequest,
  updateRelevoRequest,
  getAllRelevosRequest,
} from "../api/relevo.js";

const RelevoContext = createContext();

export const useRelevo = () => {
  const context = useContext(RelevoContext);
  if (!context) {
    throw new Error("useRelevo must be used within a RelevoProvider");
  }
  return context;
};

const getErrorMsg = (error) =>
  error.response?.data?.message || error.response?.data?.error || error.message || "Error inesperado";

export function RelevoProvider({ children }) {
  const [relevos, setRelevos] = useState([]);
  const [loading, setLoading] = useState(false);

  const getRelevos = async () => {
    setLoading(true);
    try {
      const res = await getRelevosRequest();
      setRelevos(res.data);
    } catch (error) {
      toast.error(`Error al obtener los relevos: ${getErrorMsg(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const getAllRelevos = async () => {
    setLoading(true);
    try {
      const res = await getAllRelevosRequest();
      setRelevos(res.data);
    } catch (error) {
      toast.error(`Error al obtener los relevos: ${getErrorMsg(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteRelevo = async (id) => {
    try {
      const res = await deleteRelevoRequest(id);
      if (res.status === 200 || res.status === 204) {
        setRelevos((prev) => prev.filter((relevo) => relevo._id !== id));
        toast.success("Relevo eliminado");
      }
    } catch (error) {
      toast.error(`Error al eliminar el relevo: ${getErrorMsg(error)}`);
    }
  };

  const createRelevo = async (data) => {
    try {
      const res = await createRelevoRequest(data);
      setRelevos((prev) => [...prev, res.data]);
      toast.success("Relevo creado");
    } catch (error) {
      toast.error(`Error al crear el relevo: ${getErrorMsg(error)}`);
    }
  };

  const updateRelevo = async (id, data) => {
    try {
      const res = await updateRelevoRequest(id, data);
      setRelevos((prev) =>
        prev.map((r) => (r._id === id ? res.data : r))
      );
      toast.success("Relevo actualizado");
    } catch (error) {
      toast.error(`Error al actualizar el relevo: ${getErrorMsg(error)}`);
    }
  };

  return (
    <RelevoContext.Provider
      value={{
        relevos,
        loading,
        getRelevos,
        getAllRelevos,
        deleteRelevo,
        createRelevo,
        updateRelevo,
      }}
    >
      {children}
    </RelevoContext.Provider>
  );
}
