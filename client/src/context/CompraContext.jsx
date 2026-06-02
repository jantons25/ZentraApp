import { toast } from "react-hot-toast";
import { createContext, useContext, useState } from "react";
import {
  createCompraRequest,
  getCompraRequest,
  getComprasRequest,
  deleteCompraRequest,
  updateCompraRequest,
  getAllComprasRequest,
  updateLoteComprasRequest,
  deleteLoteComprasRequest,
} from "../api/compras.js";

const CompraContext = createContext();

export const useCompra = () => {
  const context = useContext(CompraContext);
  if (!context) {
    throw new Error("useCompra must be used within a CompraProvider");
  }
  return context;
};

const getErrorMsg = (error) =>
  error.response?.data?.message || error.response?.data?.error || error.message || "Error inesperado";

export function ComprasProvider({ children }) {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(false);

  const getCompras = async () => {
    setLoading(true);
    try {
      const res = await getComprasRequest();
      setCompras(res.data);
    } catch (error) {
      toast.error(`Error al obtener las compras: ${getErrorMsg(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const getAllCompras = async () => {
    setLoading(true);
    try {
      const res = await getAllComprasRequest();
      setCompras(res.data);
    } catch (error) {
      toast.error(`Error al obtener todas las compras: ${getErrorMsg(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteCompra = async (id) => {
    try {
      const res = await deleteCompraRequest(id);
      if (res.status === 200 || res.status === 204) {
        setCompras((prev) => prev.filter((compra) => compra._id !== id));
        toast.success("Compra eliminada");
      }
    } catch (error) {
      toast.error(`Error al eliminar la compra: ${getErrorMsg(error)}`);
    }
  };

  const deleteLoteCompras = async (id_lote) => {
    try {
      const res = await deleteLoteComprasRequest(id_lote);
      if (res.status === 200) {
        setCompras((prev) => prev.filter((s) => s.id_lote !== id_lote));
        toast.success("Lote de compras eliminado");
      }
    } catch (error) {
      toast.error(`No se pudo eliminar el lote de compras: ${getErrorMsg(error)}`);
    }
  };

  const createCompra = async (data) => {
    try {
      const res = await createCompraRequest(data);
      const nuevas = Array.isArray(res.data?.compras) ? res.data.compras : [];
      setCompras((prev) => [...prev, ...nuevas]);
      toast.success("Compra registrada con éxito");
    } catch (error) {
      toast.error(`Error al registrar la compra: ${getErrorMsg(error)}`);
    }
  };

  const updateCompra = async (id, data) => {
    try {
      const res = await updateCompraRequest(id, data);
      setCompras((prev) =>
        prev.map((compra) => (compra._id === id ? res.data.compra : compra))
      );
      toast.success("Compra actualizada correctamente");
      return res.data;
    } catch (error) {
      toast.error(`No se pudo actualizar la compra: ${getErrorMsg(error)}`);
    }
  };

  const updateLoteCompras = async ({ ids, nuevasCompras }) => {
    try {
      const res = await updateLoteComprasRequest({ ids, nuevasCompras });
      setCompras((prevCompras) => {
        const idsSet = new Set(ids);
        const comprasFiltradas = prevCompras.filter((v) => !idsSet.has(v._id));
        const nuevas = Array.isArray(res.data?.compras) ? res.data.compras : nuevasCompras;
        return [...comprasFiltradas, ...nuevas];
      });
      toast.success("Lote de compras actualizado");
      return res.data;
    } catch (error) {
      toast.error(`Error al actualizar lote de compras: ${getErrorMsg(error)}`);
    }
  };

  return (
    <CompraContext.Provider
      value={{
        compras,
        loading,
        createCompra,
        getCompras,
        getAllCompras,
        deleteCompra,
        deleteLoteCompras,
        updateCompra,
        updateLoteCompras,
      }}
    >
      {children}
    </CompraContext.Provider>
  );
}
