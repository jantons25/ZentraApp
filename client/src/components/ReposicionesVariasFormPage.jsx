import { useForm } from "react-hook-form";
import { useReposicion } from "../context/ReposicionContext.jsx";
import { useEffect, useState } from "react";

function ReposicionesVariasFormPage({
  closeModal,
  refreshPagina,
  reposicion,
  products,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const { createReposicion, updateLoteReposicion } = useReposicion();
  const [reposicionesTemporales, setReposicionesTemporales] = useState([]);
  const [productosSinStockRecepcion, setProductosSinStockRecepcion] = useState(
    []
  );

  const totalItems = reposicionesTemporales.reduce(
    (acc, reposicion) => acc + (Number(reposicion.cantidad) || 0),
    0
  );

  const calcularStockRecepcion = (producto) => {
    if (!producto) return 0;

    const salidas = producto.salidas || 0;
    const cantidadVendida = producto.cantidad_vendida || 0;
    const cantidadRepuesta = producto.cantidad_repuesta || 0;
    const cantidadCortesia = producto.cantidad_cortesia || 0;

    return salidas - (cantidadVendida + cantidadRepuesta + cantidadCortesia);
  };

  // Función para verificar stock en recepción
  const verificarStockEnRecepcion = () => {
    const productosSinStockTemp = reposicionesTemporales.filter(
      (reposicion) => {
        const stockRecepcion = calcularStockRecepcion(reposicion.producto);
        return reposicion.cantidad > stockRecepcion;
      }
    );

    return productosSinStockTemp;
  };

  const handleGuardarReposiciones = async () => {
    try {
      // Verificar stock en recepción ANTES de guardar
      const productosSinStockRecepcionTemp = verificarStockEnRecepcion();

      if (productosSinStockRecepcionTemp.length > 0) {
        setProductosSinStockRecepcion(productosSinStockRecepcionTemp);

        const nombresProductos = productosSinStockRecepcionTemp
          .map((r) => r.producto?.nombre || "Producto desconocido")
          .join(", ");

        return; // Detener la ejecución
      }

      // Si todo está bien, proceder con el guardado
      const reposicionesParaEnviar = reposicionesTemporales.map(
        (reposicion) => ({
          cantidad: reposicion.cantidad,
          producto:
            typeof reposicion.producto === "string"
              ? reposicion.producto
              : reposicion.producto._id,
          habitacion: reposicion.habitacion,
          responsable: reposicion.responsable,
          observacion: reposicion.observacion || "-",
        })
      );

      if (reposicion && reposicion.reposiciones) {
        const idsOriginales = reposicion.reposiciones.map((s) => s._id);
        await updateLoteReposicion({
          ids: idsOriginales,
          reposiciones: reposicionesParaEnviar,
        });
      } else {
        await createReposicion(reposicionesParaEnviar);
      }

      // Limpiar estados
      setProductosSinStockRecepcion([]);
      setReposicionesTemporales([]);
      refreshPagina();
      closeModal();
    } catch (err) {
      console.error("Error al guardar lote de reposiciones:", err);
    }
  };

  const onSubmit = handleSubmit((data) => {
    const nuevaReposicion = {
      ...data,
      producto: products.find((p) => p._id === data.producto),
    };

    setReposicionesTemporales((prev) => [...prev, nuevaReposicion]);
    reset();
    setProductosSinStockRecepcion([]);
  });

  useEffect(() => {
    if (reposicion?.reposiciones?.length > 0 && products?.length > 0) {
      const reposicionesConProductoObj = reposicion.reposiciones.map((s) => ({
        ...s,
        producto: products.find(
          (p) =>
            p._id ===
            (typeof s.producto === "string" ? s.producto : s.producto._id)
        ),
      }));
      setReposicionesTemporales(reposicionesConProductoObj);
    }
  }, [reposicion, products]);

  return (
    <div className="bg-white w-full p-5 rounded-md flex flex-row flex-wrap gap-4">
      {productosSinStockRecepcion.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded w-full mb-4">
          <strong className="font-bold text-left block">
            ¡Stock insuficiente en recepción!
          </strong>
          <span className="block text-left mb-2">
            Los siguientes productos no tienen suficiente stock en recepción
            para reponer:
          </span>
          <ul className="mt-2 text-left">
            {productosSinStockRecepcion.map((reposicion, idx) => {
              const stockRecepcion = calcularStockRecepcion(
                reposicion.producto
              );
              const salidas = reposicion.producto?.salidas || 0;
              const cantidadVendida =
                reposicion.producto?.cantidad_vendida || 0;
              const cantidadRepuesta =
                reposicion.producto?.cantidad_repuesta || 0;
              const cantidadCortesia =
                reposicion.producto?.cantidad_cortesia || 0;

              return (
                <li key={idx} className="mb-1">
                  <strong>{reposicion.producto?.nombre || "Producto"}</strong>:
                  Stock en recepción: {stockRecepcion}, Cantidad solicitada:{" "}
                  {reposicion.cantidad}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <form
        onSubmit={onSubmit}
        className="flex flex-row flex-wrap gap-4 items-center justify-start w-full"
      >
        <div className="relative w-40 my-2">
          <label className="font-bold block text-left">Producto</label>
          {errors.producto && (
            <p className="absolute -top-4 left-0 text-red-500 text-xs z-10">
              {errors.producto.message}
            </p>
          )}
          <select
            {...register("producto", { required: "Selecciona un producto" })}
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
          <label className="font-bold block text-left">Cantidad</label>
          {errors.cantidad && (
            <p className="absolute -top-4 left-0 text-red-500 text-xs z-10">
              {errors.cantidad.message}
            </p>
          )}
          <input
            type="number"
            placeholder="Cantidad"
            {...register("cantidad", {
              required: "Ingresa una cantidad",
              min: { value: 1, message: "Debe ser al menos 1" },
            })}
            className="w-full bg-gray-200 px-4 py-2 rounded-md"
          />
        </div>

        <div className="relative w-40 my-2">
          <label className="font-bold block text-left">Habitación</label>
          {errors.habitacion && (
            <p className="absolute -top-4 left-0 text-red-500 text-xs z-10">
              {errors.habitacion.message}
            </p>
          )}
          <select
            {...register("habitacion", {
              required: "Selecciona una habitación",
            })}
            className="w-full bg-gray-200 px-4 py-2 rounded-md"
          >
            <option value="">Habitación</option>
            <option value="101">101</option>
            <option value="102">102</option>
            <option value="103">103</option>
            <option value="104">104</option>
            <option value="105">105</option>
            <option value="201">201</option>
            <option value="202">202</option>
            <option value="203">203</option>
            <option value="204">204</option>
            <option value="205">205</option>
            <option value="205">206</option>
            <option value="301">301</option>
            <option value="302">302</option>
            <option value="303">303</option>
            <option value="304">304</option>
            <option value="305">305</option>
            <option value="306">306</option>
            <option value="401">401</option>
            <option value="402">402</option>
            <option value="403">403</option>
            <option value="404">404</option>
            <option value="405">405</option>
            <option value="406">406</option>
          </select>
        </div>

        <div className="relative w-40 my-2">
          <label className="font-bold block text-left">Responsable</label>
          {errors.responsable && (
            <p className="absolute -top-4 left-0 text-red-500 text-xs z-10">
              {errors.responsable.message}
            </p>
          )}
          <select
            {...register("responsable", {
              required: "Selecciona un responsable",
            })}
            className="w-full bg-gray-200 px-4 py-2 rounded-md"
          >
            <option value="">Responsable</option>
            <option value="Valentin">Valentín</option>
            <option value="Cesar">Cesar</option>
            <option value="David">David</option>
            <option value="GeanPool">Gean Pool</option>
          </select>
        </div>

        {/* OBSERVACIÓN */}
        <div className="relative w-60 my-2">
          <label className="font-bold block text-left">Observaciones</label>
          {errors.observacion && (
            <p className="absolute -top-4 left-0 text-red-500 text-xs z-10">
              {errors.observacion.message}
            </p>
          )}
          <input
            type="text"
            placeholder="Observación (opcional)"
            {...register("observacion", {
              maxLength: {
                value: 200,
                message: "Máximo 200 caracteres",
              },
            })}
            className="w-full bg-gray-200 px-4 py-2 rounded-md"
          />
        </div>

        <div className="w-32 flex justify-center items-center">
          <button
            type="submit"
            className="bg-[#b9bc31] text-zinc-800 px-4 py-2 rounded-md hover:bg-yellow-300 hover:text-black my-2"
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
                <th className="px-6 py-3 text-center">Habitación</th>
                <th className="px-6 py-3 text-center">Responsable</th>
                <th className="px-6 py-3 text-center">Observación</th>
                <th className="px-6 py-3 text-center rounded-tr-[10px]">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {reposicionesTemporales.map((reposicion, index) => (
                <tr
                  key={index}
                  className={`border-b transition duration-150 ${
                    reposicion.cantidad >
                    reposicion.producto.salidas -
                      (reposicion.producto.cantidad_vendida +
                        reposicion.producto.cantidad_repuesta +
                        reposicion.producto.cantidad_cortesia)
                      ? "bg-red-100"
                      : "bg-white"
                  }`}
                >
                  <td className="px-6 py-4 text-center">
                    {reposicion.producto?.nombre || "Sin nombre"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {reposicion.cantidad}
                  </td>
                  <td className="px-6 py-4 text-center text-green-600 font-bold">
                    {reposicion.producto.salidas -
                      (reposicion.producto.cantidad_vendida +
                        reposicion.producto.cantidad_repuesta +
                        reposicion.producto.cantidad_cortesia)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {reposicion.habitacion}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {reposicion.responsable}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {reposicion.observacion || "-"}
                  </td>
                  <td className="px-6 py-4 flex justify-center">
                    <button
                      onClick={() => {
                        const nuevas = reposicionesTemporales.filter(
                          (_, i) => i !== index
                        );
                        setReposicionesTemporales(nuevas);
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {reposicionesTemporales.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-400 text-xs"
                  >
                    No hay reposiciones agregadas aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="resumen w-[20%] mt-4 ml-10 border-2 border-[#ddd] h-[300px] rounded-[10px]">
        <div className="w-[90%] m-auto border-b-2 border-[#ddd] p-2 flex">
          <h2>Resumen</h2>
        </div>

        <div className="data mt-4">
          <div className="w-[90%] flex flex-row justify-between p-2 m-auto text-[0.8rem]">
            <p>Items</p>
            <span>{totalItems}</span>
          </div>
        </div>

        <div className="w-[90%] mt-4 m-auto border-t-2 border-[#ddd] flex flex-col">
          <div className="w-[90%] text-[0.8rem] flex flex-row justify-between p-2 m-auto">
            <p>Total</p>
            <span>{totalItems}</span>
          </div>
          <div className="w-32 m-auto mt-2 flex justify-center items-center">
            <button
              type="button"
              onClick={handleGuardarReposiciones}
              className="bg-[#b9bc31] text-zinc-800 px-4 py-2 rounded-md hover:bg-yellow-300 hover:text-black my-2"
            >
              Guardar Lote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReposicionesVariasFormPage;
