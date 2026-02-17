import { useForm } from "react-hook-form";
import { useVenta } from "../context/VentaContext.jsx";
import { useEffect } from "react";
import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { ventaItemSchema } from "../validations/ventaSchema";

function VentasVariasFormPage({ closeModal, refreshPagina, venta, products }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(ventaItemSchema),
  });
  const { createVenta, updateLoteVentas } = useVenta();
  const [ventasTemporales, setVentasTemporales] = useState([]);
  const [textBoton, setTextBoton] = useState("Vender");
  //01.02.26
  const [productosSinStockRecepcion, setProductosSinStockRecepcion] = useState(
    [],
  );
  const totalItems = ventasTemporales.reduce(
    (acc, venta) => acc + (venta.cantidad || 0),
    0,
  );
  const totalImporte = ventasTemporales.reduce(
    (acc, venta) => acc + (venta.importe_venta || 0),
    0,
  );

  const ventasParaEnviar = ventasTemporales.map((venta) => ({
    ...venta,
    producto: venta.producto._id,
  }));

  const handleGuardarVentas = async () => {
    try {
      // Verificar stock en recepción
      const productosSinStockRecepcionTemp = verificarStockEnRecepcion();

      if (productosSinStockRecepcionTemp.length > 0) {
        setProductosSinStockRecepcion(productosSinStockRecepcionTemp);

        const nombresProductos = productosSinStockRecepcionTemp
          .map((v) => v.producto?.nombre || "Producto desconocido")
          .join(", ");
        return;
      }

      // Si todo está bien, proceder con el guardado
      if (venta) {
        const ventasParaActualizar = ventasTemporales.map((venta) => ({
          ...venta,
          producto: venta.producto._id,
        }));

        const idsOriginales = venta.ventas.map((v) => v._id);
        await updateLoteVentas({
          ids: idsOriginales,
          nuevasVentas: ventasParaActualizar,
        });
      } else {
        await createVenta(ventasParaEnviar);
      }

      setProductosSinStockRecepcion([]);
      setVentasTemporales([]);
      refreshPagina();
      closeModal();
    } catch (error) {
      console.error("Error al guardar ventas múltiples:", error);
    }
  };

  const onSubmit = handleSubmit((data) => {
    const nuevaVenta = {
      ...data,
      importe_venta: data.cantidad * data.precio_venta,
      producto: products.find((p) => p._id === data.producto), // obtener nombre para mostrar
    };

    setVentasTemporales((prev) => [...prev, nuevaVenta]);
    reset();
  });

  // 01.02.26
  const calcularStockRecepcion = (producto) => {
    if (!producto) return 0;

    const salidas = producto.salidas || 0;
    const cantidadVendida = producto.cantidad_vendida || 0;
    const cantidadRepuesta = producto.cantidad_repuesta || 0;
    const cantidadCortesia = producto.cantidad_cortesia || 0;

    return salidas - (cantidadVendida + cantidadRepuesta + cantidadCortesia);
  };

  const verificarStockEnRecepcion = () => {
    const productosSinStockTemp = ventasTemporales.filter((venta) => {
      const stockRecepcion = calcularStockRecepcion(venta.producto);
      return venta.cantidad > stockRecepcion;
    });

    return productosSinStockTemp;
  };

  useEffect(() => {
    if (venta?.ventas?.length > 0) {
      setTextBoton("Actualizar");
      const ventasConProductoObj = venta.ventas.map((v) => ({
        ...v,
        producto: products.find(
          (p) =>
            p._id ===
            (typeof v.producto === "string" ? v.producto : v.producto._id),
        ),
      }));
      setVentasTemporales(ventasConProductoObj);
    }
  }, [venta, products]);

  const pagoRegistrado = watch("pago_registrado");
  const productoId = watch("producto");

  useEffect(() => {
    if (productoId) {
      const productoSeleccionado = products.find(
        (product) => product._id === productoId,
      );
      if (productoSeleccionado && productoSeleccionado.precio_venta) {
        setValue("precio_venta", productoSeleccionado.precio_venta);
      }
    }
  }, [productoId]);

  return (
    <div className="bg-white w-full p-5 rounded-md flex flex-row flex-wrap">
      {productosSinStockRecepcion.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded w-full mb-4">
          <strong className="font-bold text-left block">
            ¡Stock insuficiente en recepción!
          </strong>
          <span className="block text-left mb-2">
            Los siguientes productos no tienen suficiente stock en recepción:
          </span>
          <ul className="mt-2 text-left">
            {productosSinStockRecepcion.map((venta, idx) => {
              const stockRecepcion = calcularStockRecepcion(venta.producto);
              const salidas = venta.producto?.salidas || 0;
              const cantidadVendida = venta.producto?.cantidad_vendida || 0;
              const cantidadRepuesta = venta.producto?.cantidad_repuesta || 0;
              const cantidadCortesia = venta.producto?.cantidad_cortesia || 0;

              return (
                <li key={idx} className="mb-1">
                  <strong>{venta.producto?.nombre || "Producto"}</strong>: Stock
                  en recepción: {stockRecepcion}, Cantidad solicitada:{" "}
                  {venta.cantidad}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <form
        onSubmit={onSubmit}
        className="flex flex-row flex-wrap gap-4 align-center justify-start"
      >
        <div className="relative w-40 my-2">
          {errors.producto && (
            <p className="absolute -top-4 left-0 text-red-500 text-xs z-10">
              {errors.producto.message}
            </p>
          )}
          <select
            {...register("producto")}
            className="w-full bg-gray-200 px-4 py-2 rounded-md"
          >
            <option value="">Producto</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="relative w-40 my-2">
          {errors.cantidad && (
            <p className="absolute -top-4 left-0 text-red-500 text-xs z-10">
              {errors.cantidad.message}
            </p>
          )}
          <input
            type="number"
            placeholder="Cantidad"
            {...register("cantidad")}
            className="w-full bg-gray-200 px-4 py-2 rounded-md"
          />
        </div>
        <div className="relative w-40 my-2">
          {errors.precio_venta && (
            <p className="absolute -top-4 left-0 text-red-500 text-xs z-10">
              {errors.precio_venta.message}
            </p>
          )}
          <input
            type="number"
            step="any"
            placeholder="Precio"
            {...register("precio_venta")}
            className="w-full bg-gray-200 px-4 py-2 rounded-md"
          />
        </div>
        <div className="relative w-40 my-2">
          {errors.pago_registrado && (
            <p className="absolute -top-4 left-0 text-red-500 text-xs z-10">
              {errors.pago_registrado.message}
            </p>
          )}
          <select
            {...register("pago_registrado")}
            className="w-full bg-gray-200 px-4 py-2 rounded-md"
          >
            <option value="">¿Pagado?</option>
            <option value="Si">Sí</option>
            <option value="No">No</option>
          </select>
        </div>
        {pagoRegistrado === "No" && (
          <div className="relative w-40 my-2">
            {errors.habitacion && (
              <p className="absolute -top-4 left-0 text-red-500 text-xs z-10">
                {errors.habitacion.message}
              </p>
            )}
            <select
              {...register("habitacion")}
              className="w-full bg-gray-200 px-4 py-2 rounded-md"
            >
              <option value="">Oficina</option>
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
          </div>
        )}

        <div className="w-30 flex justify-center align-center">
          <button
            type="submit"
            className="bg-[#b9bc31]  text-zinc-800 px-4 py-2 rounded-md hover:bg-yellow-300 hover:text-black my-2"
          >
            Agregar
          </button>
        </div>
      </form>
      <div className="bg-white pt-4 w-[75%]">
        <div className="max-h-[300px] overflow-y-auto">
          <table className="w-full table-auto text-sm text-left text-gray-700">
            <thead className="sticky top-0 bg-white z-10 shadow">
              <tr className="bg-[#b9bc31] text-xs uppercase text-gray-500">
                <th className="px-6 py-3 text-center rounded-tl-[10px]">
                  Producto
                </th>
                <th className="px-6 py-3 text-center">Cantidad</th>
                <th className="px-6 py-3 text-center bg-green-200">Stock</th>
                <th className="px-6 py-3 text-center">Precio</th>
                <th className="px-6 py-3 text-center">Importe</th>
                <th className="px-6 py-3 text-center">Pago Registrado</th>
                <th className="px-6 py-3 text-center">Oficina</th>
                <th className="px-6 py-3 text-center rounded-tr-[10px]">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {ventasTemporales.map((venta, index) => {
                const stockRecepcion = calcularStockRecepcion(venta.producto);
                const tieneStock = venta.cantidad <= stockRecepcion;
                return (
                  <tr
                    key={index}
                    className={`border-b transition duration-150 ${
                      !tieneStock ? "bg-red-200" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 text-center">
                      {venta.producto?.nombre || "Sin nombre"}
                      {!tieneStock && (
                        <span className="ml-2 text-xs text-red-600 font-semibold">
                          <br />
                          (Stock insuficiente)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">{venta.cantidad}</td>
                    <td className="px-6 py-4 text-center text-green-600 font-bold">
                      {venta.producto.salidas -
                        (venta.producto.cantidad_vendida +
                          venta.producto.cantidad_repuesta +
                          venta.producto.cantidad_cortesia)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      S/{venta.precio_venta.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      S/{venta.importe_venta.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {venta.pago_registrado}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {venta.habitacion || "-"}
                    </td>
                    <td className="px-6 py-4 flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          const nuevasVentas = ventasTemporales.filter(
                            (_, i) => i !== index,
                          );
                          setVentasTemporales(nuevasVentas);
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="resumem w-[20%] mt-4 ml-10 border-2 border-[#ddd] h-[300px] rounded-[10px]">
        <div className="w-[90%] m-auto title border-b-2 border-[#ddd] p-2 flex">
          <h2>Orden</h2>
        </div>

        <div className="data mt-4">
          <div className="items w-[90%] flex flex-row justify-between p-2 m-auto text-[0.8rem]">
            <p>Items</p>
            <span>{totalItems}</span>
          </div>
          <div className="subtotal w-[90%] flex flex-row justify-between p-2 m-auto text-[0.8rem]">
            <p>Subtotal</p>
            <span>S/{totalImporte.toFixed(2)}</span>
          </div>
        </div>

        <div className="w-[90%] mt-15 m-auto title border-t-2 border-[#ddd] flex flex-col">
          <div className="total w-[90%] text-[0.8rem] flex flex-row justify-between p-2 m-auto">
            <p>Total</p>
            <span>S/{totalImporte.toFixed(2)}</span>
          </div>
          <div className="w-30 m-auto mt-2 flex justify-center align-center">
            <button
              type="submit"
              onClick={handleGuardarVentas}
              className="bg-[#b9bc31] text-zinc-800 px-4 py-2 rounded-md hover:bg-yellow-300 hover:text-black my-2"
            >
              {textBoton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VentasVariasFormPage;
