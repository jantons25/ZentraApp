import { toast } from "react-hot-toast";
import { createContext, useContext, useState } from "react";
import {
  createVentaRequest,
  getVentasRequest,
  deleteVentaRequest,
  getAllVentasRequest,
  updateLoteVentasRequest,
  deleteLoteVentasRequest,
  updateVentaByIdRequest,
} from "../api/ventas.js";

const VentaContext = createContext();

export const useVenta = () => {
  const context = useContext(VentaContext);
  if (!context) {
    throw new Error("useVenta must be used within a VentaProvider");
  }
  return context;
};

const getErrorMsg = (error) =>
  error.response?.data?.message || error.response?.data?.error || error.message || "Error inesperado";

export function VentaProvider({ children }) {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);

  const getVentas = async () => {
    setLoading(true);
    try {
      const res = await getVentasRequest();
      setVentas(res.data);
    } catch (error) {
      toast.error(`Error al obtener las ventas: ${getErrorMsg(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const getAllVentas = async () => {
    setLoading(true);
    try {
      const res = await getAllVentasRequest();
      setVentas(res.data);
    } catch (error) {
      toast.error(`Error al obtener todas las ventas: ${getErrorMsg(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteVenta = async (id) => {
    try {
      const res = await deleteVentaRequest(id);
      if (res.status === 200 || res.status === 204) {
        setVentas((prevVentas) =>
          prevVentas.filter((venta) => venta._id !== id)
        );
        toast.success("Venta eliminada");
      }
    } catch (error) {
      toast.error(`Error al eliminar la venta: ${getErrorMsg(error)}`);
    }
  };

  const deleteLoteVentas = async (id_lote) => {
    try {
      const res = await deleteLoteVentasRequest(id_lote);
      if (res.status === 200) {
        setVentas((prev) => prev.filter((v) => v.id_lote !== id_lote));
        toast.success("Lote de ventas eliminado");
      }
    } catch (error) {
      toast.error(`No se pudo eliminar el lote de ventas: ${getErrorMsg(error)}`);
    }
  };

  const createVenta = async (data) => {
    try {
      const res = await createVentaRequest(data);
      const nuevas = Array.isArray(res.data?.ventas) ? res.data.ventas : [];
      setVentas((prevVentas) => [...prevVentas, ...nuevas]);
      toast.success("Venta registrada con éxito");
    } catch (error) {
      toast.error(`Error al registrar la venta: ${getErrorMsg(error)}`);
    }
  };

  const updateLoteVentas = async ({ ids, nuevasVentas }) => {
    try {
      const res = await updateLoteVentasRequest({ ids, nuevasVentas });
      setVentas((prevVentas) => {
        const idsSet = new Set(ids);
        const ventasFiltradas = prevVentas.filter((v) => !idsSet.has(v._id));
        const nuevas = Array.isArray(res.data?.ventas) ? res.data.ventas : nuevasVentas;
        return [...ventasFiltradas, ...nuevas];
      });
      toast.success("Lote de ventas actualizado");
      return res.data;
    } catch (error) {
      toast.error(`Error al actualizar las ventas: ${getErrorMsg(error)}`);
    }
  };

  const updateVentaById = async (id, data) => {
    try {
      const res = await updateVentaByIdRequest(id, data);
      setVentas((prev) =>
        prev.map((venta) => (venta._id === id ? res.data.venta : venta))
      );
      toast.success("Venta actualizada correctamente");
      return res.data;
    } catch (error) {
      toast.error(`Error al actualizar venta: ${getErrorMsg(error)}`);
    }
  };

  return (
    <VentaContext.Provider
      value={{
        ventas,
        loading,
        createVenta,
        getVentas,
        getAllVentas,
        deleteVenta,
        updateLoteVentas,
        deleteLoteVentas,
        updateVentaById,
      }}
    >
      {children}
    </VentaContext.Provider>
  );
}
