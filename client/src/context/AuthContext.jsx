import { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  registerRequest,
  loginRequest,
  verifyTokenRequest,
  getUsersRequest,
  deleteUserRequest,
  updateUserRequest,
  logoutRequest,
} from "../api/auth.js";
import { clearSede } from "../lib/sedeStore.js";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const getErrorMessage = (error) => {
  return error.response?.data?.message
    || error.response?.data?.error
    || error.message
    || "Error inesperado";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  const signup = async (userData) => {
    try {
      await registerRequest(userData);
      toast.success("Usuario creado exitosamente");
    } catch (error) {
      const msg = getErrorMessage(error);
      setErrors(Array.isArray(error.response?.data) ? error.response.data : [msg]);
    }
  };

  const signin = async (userData) => {
    try {
      const res = await loginRequest(userData);
      if (!res.data?.id || !res.data?.role) {
        throw new Error("Respuesta de autenticación inválida");
      }
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      const msg = getErrorMessage(error);
      if (Array.isArray(error.response?.data)) {
        return setErrors(error.response.data);
      }
      setErrors([msg]);
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.error("Error en logout:", getErrorMessage(error));
    } finally {
      clearSede();
      setUser(null);
      setIsAuthenticated(false);
      setUsers([]);
    }
  };

  const getUsers = async () => {
    try {
      const res = await getUsersRequest();
      setUsers(res.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const deleteUser = async (id) => {
    try {
      const res = await deleteUserRequest(id);
      if (res.status === 200 || res.status === 204) {
        setUsers(users.filter((user) => user._id !== id));
        toast.success("Usuario eliminado correctamente");
      }
    } catch (error) {
      toast.error(`Error al eliminar el usuario: ${getErrorMessage(error)}`);
    }
  };

  const updateUser = async (id, userData) => {
    try {
      const res = await updateUserRequest(id, userData);
      setUsers(users.map((u) => (u._id === id ? res.data : u)));
      toast.success("Usuario actualizado exitosamente");
    } catch (error) {
      toast.error(`Error al actualizar el usuario: ${getErrorMessage(error)}`);
    }
  };

  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => {
        setErrors([]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  useEffect(() => {
    let isMounted = true;

    async function checkLogin() {
      try {
        const res = await verifyTokenRequest();
        if (!isMounted) return;
        if (!res.data) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        setIsAuthenticated(true);
        setUser(res.data);
      } catch (error) {
        if (!isMounted) return;
        clearSede();
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkLogin();
    return () => { isMounted = false; };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signup,
        signin,
        logout,
        user,
        users,
        getUsers,
        isAuthenticated,
        errors,
        loading,
        deleteUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
