import { useForm } from "react-hook-form";
import { useReposicion } from "../context/ReposicionContext.jsx";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

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

  const { createReposicion, updateLoteReposicion, updateReposicion } =
    useReposicion();
  const [reposicionesTemporales, setReposicionesTemporales] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productosSinStockRecepcion, setProductosSinStockRecepcion] = useState(
    []
  );
  // Edición individual de filas
  const [editIndex, setEditIndex] = useState(null);
  const [editValues, setEditValues] = useState({ cantidad: "" });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  // Cantidades persistidas al abrir el modal (para validar stock al editar)
  const [cantidadesIniciales, setCantidadesIniciales] = useState({});

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
    if (isSubmitting) return; // bloquea doble click
    setIsSubmitting(true);

    try {
      // Verificar stock en recepción ANTES de guardar
      const productosSinStockRecepcionTemp = verificarStockEnRecepcion();

      if (productosSinStockRecepcionTemp.length > 0) {
        setProductosSinStockRecepcion(productosSinStockRecepcionTemp);
        setIsSubmitting(false); // reactiva porque no se guardará
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
    } finally {
      setIsSubmitting(false); // reactiva siempre al final
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
      const iniciales = {};
      reposicion.reposiciones.forEach((r) => {
        iniciales[r._id] = r.cantidad;
      });
      setCantidadesIniciales(iniciales);
      setEditIndex(null);
    }
  }, [reposicion, products]);

  const iniciarEdicion = (index) => {
    if (editIndex !== null) return; // solo una fila en edición a la vez
    const fila = reposicionesTemporales[index];
    setEditIndex(index);
    setEditValues({ cantidad: String(fila.cantidad) });
  };

  const cancelarEdicion = () => {
    setEditIndex(null);
    setEditValues({ cantidad: "" });
  };

  const guardarEdicion = async (index) => {
    if (isSavingEdit) return;

    const cantidad = parseInt(editValues.cantidad, 10);

    if (isNaN(cantidad) || cantidad <= 0) {
      toast.error("La cantidad debe ser un número entero mayor a cero");
      return;
    }

    const fila = reposicionesTemporales[index];
    // El stock de recepción ya descuenta la cantidad original persistida,
    // por eso se suma de vuelta para conocer el disponible real al editar
    const disponible =
      calcularStockRecepcion(fila.producto) +
      (fila._id ? cantidadesIniciales[fila._id] ?? 0 : 0);

    if (cantidad > disponible) {
      toast.error(
        `Stock insuficiente en recepción para ${
          fila.producto?.nombre || "el producto"
        }. Disponible: ${disponible}`
      );
      return;
    }

    setIsSavingEdit(true);
    try {
      if (fila._id) {
        const res = await updateReposicion(fila._id, { cantidad });
        if (!res) return; // el contexto ya mostró el error
      } else {
        toast.success("Producto actualizado en la lista");
      }

      const delta = cantidad - fila.cantidad;
      const productoId = fila.producto?._id;

      setReposicionesTemporales((prev) =>
        prev.map((r, i) => {
          const nuevaCantidad = i === index ? cantidad : r.cantidad;
          if (r.producto?._id === productoId) {
            return {
              ...r,
              cantidad: nuevaCantidad,
              producto: {
                ...r.producto,
                cantidad_repuesta: (r.producto.cantidad_repuesta || 0) + delta,
              },
            };
          }
          return i === index ? { ...r, cantidad } : r;
        })
      );

      if (fila._id) {
        setCantidadesIniciales((prev) => ({ ...prev, [fila._id]: cantidad }));
      }

      cancelarEdicion();
    } finally {
      setIsSavingEdit(false);
    }
  };

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
            <option value="206">206</option>
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
              {reposicionesTemporales.map((reposicion, index) => {
                const enEdicion = editIndex === index;
                return (
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
                      {enEdicion ? (
                        <input
                          type="number"
                          min="1"
                          value={editValues.cantidad}
                          onChange={(e) =>
                            setEditValues({ cantidad: e.target.value })
                          }
                          className="w-20 bg-gray-200 px-2 py-1 rounded-md text-center"
                        />
                      ) : (
                        reposicion.cantidad
                      )}
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
                    <td className="px-6 py-4 flex gap-2 justify-center">
                      {enEdicion ? (
                        <>
                          <button
                            onClick={() => guardarEdicion(index)}
                            disabled={isSavingEdit}
                            className={`text-white px-3 py-1 rounded text-xs ${
                              isSavingEdit
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700 cursor-pointer"
                            }`}
                          >
                            {isSavingEdit ? "Guardando..." : "Guardar"}
                          </button>
                          <button
                            onClick={cancelarEdicion}
                            disabled={isSavingEdit}
                            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-xs cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => iniciarEdicion(index)}
                            disabled={editIndex !== null}
                            className={`text-white px-3 py-1 rounded text-xs ${
                              editIndex !== null
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                            }`}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              const nuevas = reposicionesTemporales.filter(
                                (_, i) => i !== index
                              );
                              setReposicionesTemporales(nuevas);
                            }}
                            disabled={editIndex !== null}
                            className={`text-white px-3 py-1 rounded text-xs ${
                              editIndex !== null
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-500 hover:bg-red-600 cursor-pointer"
                            }`}
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
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
              disabled={isSubmitting || editIndex !== null}
              className={`px-4 py-2 rounded-md my-2 text-zinc-800
        ${
          isSubmitting || editIndex !== null
            ? "bg-gray-400 cursor-not-allowed opacity-60"
            : "bg-[#b9bc31] hover:bg-yellow-300 hover:text-black"
        }`}
            >
              {isSubmitting ? "Guardando..." : "Guardar Lote"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReposicionesVariasFormPage;
