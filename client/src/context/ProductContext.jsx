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

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);

  const getProducts = async () => {
    try {
      const res = await getProductsRequest();
      setProducts(res.data);
    } catch (error) {
      toast.error(`Error al obtener productos: ${error.response.data.error}`);
    }
  };

  const getAllProducts = async () => {
    try {
      const res = await getAllProductsRequest();
      setProducts(res.data);
    } catch (error) {
      toast.error(
        `Error al obtener todos los productos: ${error.response.data.error}`
      );
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await deleteProductRequest(id);
      if (res.status === 204) {
        setProducts((prev) => prev.filter((product) => product._id !== id));
        toast.success("Producto eliminado correctamente");
      }
    } catch (error) {
      toast.error(
        `Error al eliminar el producto: ${error.response.data.error}`
      );
    }
  };

  const createProduct = async (data) => {
    try {
      const res = await createProductRequest(data);
      const newProduct = res.data.product ?? res.data;
      setProducts((prev) => [...prev, newProduct]);
      toast.success(res.data.message || "Producto creado exitosamente");
    } catch (error) {
      toast.error(`Error al crear el producto: ${error.response.data.error}`);
    }
  };

  const updateProduct = async (id, data) => {
    try {
      const res = await updateProductRequest(id, data);
      const updated = res.data.product ?? res.data;
      setProducts((prev) => prev.map((p) => (p._id === id ? updated : p)));
      toast.success(res.data.message || "Producto actualizado exitosamente");
    } catch (error) {
      toast.error(
        `Error al actualizar el producto: ${error.response.data.error}`
      );
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
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