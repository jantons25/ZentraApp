import { toast } from "react-hot-toast";
import { createContext, useContext, useState } from "react";
import {
  getReservasRequest,
  getReservaRequest,
  createReservaRequest,
  updateReservaRequest,
  cancelReservaRequest,
} from "../api/reserva.js";

const ReservaContext = createContext();

export const useReserva = () => {
  const context = useContext(ReservaContext);
  if (!context) {
    throw new Error("useReserva must be used within a ReservaProvider");
  }
  return context;
};

const getErrorMsg = (error) =>
  error.response?.data?.mensaje || error.response?.data?.message || error.response?.data?.error || error.message || "Error inesperado";

export function ReservaProvider({ children }) {
  const [reservas, setReservas] = useState({
    data: [],
    pagination: {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 0,
    },
  });
  const [loading, setLoading] = useState(false);

  const getReservas = async () => {
    setLoading(true);
    try {
      const res = await getReservasRequest();
      setReservas(res.data);
    } catch (error) {
      toast.error(`Error al obtener las reservas: ${getErrorMsg(error)}`);
      setReservas({
        data: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  const getReserva = async (id) => {
    try {
      const res = await getReservaRequest(id);
      return res.data;
    } catch (error) {
      toast.error(`Error al obtener la reserva: ${getErrorMsg(error)}`);
    }
  };

  const createReserva = async (reservaData) => {
    try {
      const res = await createReservaRequest(reservaData);

      setReservas((prev) => {
        const nuevoItem = {
          reserva: res.data.reserva,
          detalle: res.data.detalle || null,
        };

        return {
          ...prev,
          data: [...prev.data, nuevoItem],
          pagination: {
            ...prev.pagination,
            total: prev.pagination.total + 1,
          },
        };
      });

      toast.success("Reserva creada");
    } catch (error) {
      toast.error(`Error al crear la reserva: ${getErrorMsg(error)}`);
    }
  };

  const updateReserva = async (id, reserva) => {
    try {
      const res = await updateReservaRequest(id, reserva);

      setReservas((prev) => {
        const nuevoItem = {
          reserva: res.data.reserva,
          detalle: res.data.detalle || null,
        };

        const nuevoData = prev.data.map((item) => {
          if (item.reserva._id === id) {
            return nuevoItem;
          }
          return item;
        });

        return {
          ...prev,
          data: nuevoData,
          pagination: prev.pagination,
        };
      });

      toast.success("Reserva actualizada");
    } catch (error) {
      toast.error(`Error al actualizar la reserva: ${getErrorMsg(error)}`);
    }
  };

  const cancelReserva = async (id) => {
    try {
      await cancelReservaRequest(id);
      toast.success("Reserva cancelada");
    } catch (error) {
      toast.error(`Error al cancelar la reserva: ${getErrorMsg(error)}`);
    }
  };

  return (
    <ReservaContext.Provider
      value={{
        reservas,
        loading,
        createReserva,
        getReservas,
        getReserva,
        updateReserva,
        cancelReserva,
      }}
    >
      {children}
    </ReservaContext.Provider>
  );
}
