import { createContext, useContext, useState } from "react";
import { toast } from "react-hot-toast";
import {
  createProductRequest,
  getProductRequest,
  getProductsRequest,
  deleteProductRequest,
  updateProductRequest,
  getAllProductsRequest,
} from "../api/product.js";

const ProductContext = createContext();

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
};

const getErrorMsg = (error) =>
  error.response?.data?.message || error.response?.data?.error || error.message || "Error inesperado";

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const getProducts = async () => {
    setLoading(true);
    try {
      const res = await getProductsRequest();
      setProducts(res.data);
    } catch (error) {
      toast.error(`Error al obtener productos: ${getErrorMsg(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const getAllProducts = async () => {
    setLoading(true);
    try {
      const res = await getAllProductsRequest();
      setProducts(res.data);
    } catch (error) {
      toast.error(`Error al obtener todos los productos: ${getErrorMsg(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await deleteProductRequest(id);
      if (res.status === 200 || res.status === 204) {
        setProducts((prev) => prev.filter((product) => product._id !== id));
        toast.success("Producto eliminado correctamente");
      }
    } catch (error) {
      toast.error(`Error al eliminar el producto: ${getErrorMsg(error)}`);
    }
  };

  const createProduct = async (data) => {
    try {
      const res = await createProductRequest(data);
      const newProduct = res.data.product ?? res.data;
      setProducts((prev) => [...prev, newProduct]);
      toast.success(res.data.message || "Producto creado exitosamente");
    } catch (error) {
      toast.error(`Error al crear el producto: ${getErrorMsg(error)}`);
    }
  };

  const updateProduct = async (id, data) => {
    try {
      const res = await updateProductRequest(id, data);
      const updated = res.data.product ?? res.data;
      setProducts((prev) => prev.map((p) => (p._id === id ? updated : p)));
      toast.success(res.data.message || "Producto actualizado exitosamente");
    } catch (error) {
      toast.error(`Error al actualizar el producto: ${getErrorMsg(error)}`);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        createProduct,
        getProducts,
        getAllProducts,
        deleteProduct,
        updateProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}
