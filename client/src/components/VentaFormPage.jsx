import { useForm } from "react-hook-form";
import { useVenta } from "../context/VentaContext.jsx";
import { useProduct } from "../context/ProductContext.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function CompraFormPage({ closeModal, refreshPagina, venta, products }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm();  
  const { createVenta, updateVenta } = useVenta();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    if (venta && venta._id) {
      try {
        const dataParsed = {
          ...data,
          importe_venta: data.cantidad * data.precio_venta,
        };
        await updateVenta(venta._id, dataParsed);
        closeModal();
        refreshPagina();
      } catch (err) {
        console.error("Error actualizando venta:", err);
      }
    } else {
      try {
        const dataParsed = {
          ...data,
          importe_venta: data.cantidad * data.precio_venta,
        };
        await createVenta(dataParsed);
        closeModal();
        refreshPagina();
      } catch (err) {
        console.error("Error creando venta:", err);
      }
    }
  });

  useEffect(() => {
    if (venta) {
      reset({
        ...venta,
        producto: venta.producto?._id || venta.producto,
      });
    }
  }, [venta]);

  const pagoRegistrado = watch("pago_registrado");
  const productoId = watch("producto");

  useEffect(() => {
    if (productoId) {
      const productoSeleccionado = products.find(
        (product) => product._id === productoId
      );
      if (productoSeleccionado && productoSeleccionado.precio_venta) {
        setValue("precio_venta", productoSeleccionado.precio_venta);
      }
    }
  }, [productoId]);

  return (
    <div className="bg-white w-full p-5 rounded-md">
      <form onSubmit={onSubmit}>
        <select
          {...register("producto", { required: true })}
          className="w-full bg-gray-200 px-4 py-2 rounded-md my-2 "
        >
          <option value="">Selecciona un producto</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.nombre}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Cantidad"
          className="w-full bg-gray-200 px-4 py-2 rounded-md my-2 "
          {...register("cantidad", { required: true, valueAsNumber: true })}
        />
        <input
          type="number"
          step="any"
          placeholder="Precio de venta por unidad"
          className="w-full bg-gray-200 px-4 py-2 rounded-md my-2 "
          {...register("precio_venta", {
            required: true,
            valueAsNumber: true,
          })}
        />
        <select
          {...register("pago_registrado", { required: true })}
          className="w-full bg-gray-200 px-4 py-2 rounded-md my-2 "
        >
          <option value="">¿Cliente pagó?</option>
          <option value="Si">Sí</option>
          <option value="No">No</option>
        </select>
        {pagoRegistrado === "No" && (
          <select
            {...register("habitacion", { required: true })}
            className="w-full bg-gray-200 px-4 py-2 rounded-md my-2"
          >
            <option value="">Seleccione Habitación</option>
            <option value="201">201</option>
            <option value="202">202</option>
            <option value="203">203</option>
            <option value="204">204</option>
            <option value="205">205</option>
            <option value="301">301</option>
            <option value="302">302</option>
            <option value="303">303</option>
            <option value="304">304</option>
            <option value="305">305</option>
          </select>
        )}
        <div className="w-full flex justify-center">
          <button
            type="submit"
            className="bg-amber-300  text-zinc-800 px-4 py-2 mt-5 rounded-md hover:bg-yellow-300 hover:text-black my-2"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}

export default CompraFormPage;
