import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { productSchema } from "../validations/product.schema.js";
import { useProduct } from "../context/ProductContext.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ProductFormPage({ closeModal, refreshPagina, product }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(productSchema),
  });

  const { createProduct, updateProduct } = useProduct();
  const [actualizando, setActualizando] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (product && product._id) {
        await updateProduct(product._id, data);
      } else {
        await createProduct(data);
      }
      closeModal();
      refreshPagina();
    } catch (err) {
      console.error("Error al guardar producto:", err);
    }
  });

  useEffect(() => {
    if (product) {
      reset(product);
      setActualizando(true);
    }
  }, [product]);

  return (
    <div className="bg-white w-[420px] p-5 rounded-md">
      <form onSubmit={onSubmit}>
        {actualizando ? (
          <label className="flex text-sm font-semibold text-gray-700">
            Producto
          </label>
        ) : (
          ""
        )}
        <input
          type="text"
          placeholder="Nombre"
          className="w-full bg-gray-200 px-4 py-2 rounded-md my-2"
          {...register("nombre")}
          autoFocus
        />
        {errors.nombre && (
          <p className="text-red-500 text-sm">{errors.nombre.message}</p>
        )}
        {actualizando ? (
          <label className="flex text-sm font-semibold text-gray-700">
            Categoría
          </label>
        ) : (
          ""
        )}
        <select
          {...register("categoria")}
          className="w-full bg-gray-200 px-4 py-2 rounded-md my-2"
        >
          <option value="">Seleccione Categoría</option>
          <option value="Galletas">Galletas</option>
          <option value="Gaseosas">Gaseosas</option>
          <option value="Chocolate">Chocolate</option>
          <option value="Snacks">Snacks</option>
          <option value="Sopas">Sopas</option>
          <option value="Frugos">Frugos</option>
          <option value="Agua Mineral">Agua Mineral</option>
          <option value="Energizante">Energizante</option>
          <option value="Aseo">Aseo</option>
          <option value="Aseo">Bebidas</option>
        </select>
        {errors.categoria && (
          <p className="text-red-500 text-sm">{errors.categoria.message}</p>
        )}
        {actualizando ? (
          <label className="flex text-sm font-semibold text-gray-700">
            Precio
          </label>
        ) : (
          ""
        )}
        <input
          type="number"
          step="any"
          placeholder="Precio de venta por unidad"
          className="w-full bg-gray-200 px-4 py-2 rounded-md my-2"
          {...register("precio_venta")}
        />
        {errors.precio_venta && (
          <p className="text-red-500 text-sm">{errors.precio_venta.message}</p>
        )}

        <div className="w-full flex justify-center">
          <button
            type="submit"
            className="bg-[#b9bc31] text-zinc-800 px-4 py-2 mt-5 rounded-md hover:bg-yellow-300 hover:text-black my-2"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductFormPage;
