import { toast } from "react-hot-toast";
import { createContext, useContext, useState } from "react";
import {
  getClientesRequest,
  getClienteRequest,
  createClienteRequest,
  updateClienteRequest,
  changeClientePasswordRequest,
  deleteClienteRequest,
} from "../api/cliente.js";

const ClienteContext = createContext();

export const useCliente = () => {
  const context = useContext(ClienteContext);
  if (!context) {
    throw new Error("useCliente must be used within a ClienteProvider");
  }
  return context;
};

const getErrorMsg = (error) =>
  error.response?.data?.mensaje || error.response?.data?.message || error.response?.data?.error || error.message || "Error inesperado";

export function ClienteProvider({ children }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);

  const getClientes = async () => {
    setLoading(true);
    try {
      const res = await getClientesRequest();
      setClientes(res.data);
    } catch (error) {
      toast.error(`Error al obtener los clientes: ${getErrorMsg(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const getCliente = async (id) => {
    try {
      const res = await getClienteRequest(id);
      return res.data;
    } catch (error) {
      toast.error(`Error al obtener el cliente: ${getErrorMsg(error)}`);
    }
  };

  const createCliente = async (cliente) => {
    try {
      const res = await createClienteRequest(cliente);
      setClientes((prev) => [...prev, res.data.cliente]);
      toast.success("Cliente creado");
    } catch (error) {
      toast.error(`Error al crear el cliente: ${getErrorMsg(error)}`);
    }
  };

  const updateCliente = async (id, cliente) => {
    try {
      const res = await updateClienteRequest(id, cliente);
      setClientes((prev) => prev.map((c) => (c._id === id ? res.data : c)));
      toast.success("Cliente actualizado");
    } catch (error) {
      toast.error(`Error al actualizar el cliente: ${getErrorMsg(error)}`);
    }
  };

  const changeClientePassword = async (id, passwordData) => {
    try {
      await changeClientePasswordRequest(id, passwordData);
      toast.success("Contraseña cambiada");
    } catch (error) {
      toast.error(`Error al cambiar la contraseña: ${getErrorMsg(error)}`);
    }
  };

  const deleteCliente = async (id) => {
    try {
      const res = await deleteClienteRequest(id);
      if (res.status === 200 || res.status === 204) {
        setClientes((prev) => prev.filter((cliente) => cliente._id !== id));
        toast.success("Cliente eliminado");
      }
    } catch (error) {
      toast.error(`Error al eliminar el cliente: ${getErrorMsg(error)}`);
    }
  };

  return (
    <ClienteContext.Provider
      value={{
        clientes,
        loading,
        getClientes,
        getCliente,
        createCliente,
        updateCliente,
        changeClientePassword,
        deleteCliente,
      }}
    >
      {children}
    </ClienteContext.Provider>
  );
}
