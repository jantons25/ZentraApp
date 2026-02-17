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

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const empresa = "NexusCowork";

  const signup = async (user) => {
    try {
      const response = await registerRequest(user);
      toast.success("Usuario creado exitosamente");
      //setUser(response.data);
      //setIsAuthenticated(true);
    } catch (error) {
      setErrors(error.response.data);
    }
  };

  const signin = async (user) => {
    try {
      const res = await loginRequest(user);
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      if (Array.isArray(error.response.data)) {
        return setErrors(error.response.data);
      }
      setErrors([error.response.data.message]);
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      setErrors([error.response.data.message]);
    }
  };

  const getUsers = async () => {
    try {
      const res = await getUsersRequest();
      setUsers(res.data);
    } catch (error) {
      setErrors([error.response.data.message]);
    }
  };

  const deleteUser = async (id) => {
    try {
      const res = await deleteUserRequest(id);
      if (res.status === 204) {
        setUsers(users.filter((user) => user._id !== id));
        toast.success("Usuario eliminado correctamente");
      }
    } catch (error) {
      setErrors([error.response.data]);
      toast.error(
        `Error al eliminar el usuario: ${error.response.data.message}`
      );
    }
  };

  const updateUser = async (id, user) => {
    try {
      const res = await updateUserRequest(id, user);
      setUsers(users.map((u) => (u._id === id ? res.data : u)));
      toast.success("Cliente actualizado exitosamente");
    } catch (error) {
      setErrors([error.response.data.message]);
      toast.error(
        `Error al actualizar el usuario: ${error.response.data.message}`
      );
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
    async function checkLogin() {
      try {
        const res = await verifyTokenRequest();
        if (!res.data) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        setIsAuthenticated(true);
        setUser(res.data);
        setLoading(false);
      } catch (error) {
        setIsAuthenticated(false);
        setLoading(false);
        setUser(null);
      }
    }
    checkLogin();
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
        empresa,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
