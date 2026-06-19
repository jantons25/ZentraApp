// components/CortesiasVariasFormPage.jsx
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useCortesia } from "../context/CortesiaContext.jsx";
import { toast } from "react-hot-toast";

function CortesiasVariasFormPage({
  closeModal,
  refreshPagina,
  cortesia, // lote seleccionado (para editar) o undefined (para crear)
  products,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const { createCortesia, updateLoteCortesia, updateCortesia } = useCortesia();
  const [cortesiasTemporales, setCortesiasTemporales] = useState([]);
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

  const totalItems = cortesiasTemporales.reduce(
    (acc, c) => acc + (Number(c.cantidad) || 0),
    0
  );

  // Después de las otras funciones, antes de handleGuardarCortesias

  // Función para calcular stock en recepción
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
    const productosSinStockTemp = cortesiasTemporales.filter((cortesia) => {
      const stockRecepcion = calcularStockRecepcion(cortesia.producto);
      return cortesia.cantidad > stockRecepcion;
    });

    return productosSinStockTemp;
  };

  const handleGuardarCortesias = async () => {
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
      const cortesiasParaEnviar = cortesiasTemporales.map((c) => ({
        cantidad: c.cantidad,
        producto: typeof c.producto === "string" ? c.producto : c.producto._id,
        responsable: c.responsable,
        observacion: c.observacion,
      }));

      if (cortesia && cortesia.cortesias) {
        // MODO EDICIÓN LOTE
        const idsOriginales = cortesia.cortesias.map((c) => c._id);
        await updateLoteCortesia({
          ids: idsOriginales,
          nuevasCortesias: cortesiasParaEnviar,
        });
      } else {
        // MODO CREACIÓN LOTE
        await createCortesia(cortesiasParaEnviar);
      }

      // Limpiar estados
      setProductosSinStockRecepcion([]);
      setCortesiasTemporales([]);
      await refreshPagina();
      closeModal();
    } catch (err) {
      console.error("Error al guardar lote de cortesías:", err);
    } finally {
      setIsSubmitting(false); // reactiva siempre al final
    }
  };

  const onSubmit = handleSubmit((data) => {
    const nuevaCortesia = {
      ...data,
      producto: products.find((p) => p._id === data.producto),
    };

    setCortesiasTemporales((prev) => [...prev, nuevaCortesia]);
    reset();
    // Limpiar productos sin stock cuando se agrega uno nuevo
    setProductosSinStockRecepcion([]);
  });

  useEffect(() => {
    // Si venimos a EDITAR un lote de cortesías
    if (cortesia?.cortesias?.length > 0 && products?.length > 0) {
      const cortesiasConProductoObj = cortesia.cortesias.map((c) => ({
        ...c,
        producto: products.find(
          (p) =>
            p._id ===
            (typeof c.producto === "string" ? c.producto : c.producto._id)
        ),
      }));
      setCortesiasTemporales(cortesiasConProductoObj);
      const iniciales = {};
      cortesia.cortesias.forEach((c) => {
        iniciales[c._id] = c.cantidad;
      });
      setCantidadesIniciales(iniciales);
      setEditIndex(null);
    }
  }, [cortesia, products]);

  const iniciarEdicion = (index) => {
    if (editIndex !== null) return; // solo una fila en edición a la vez
    const fila = cortesiasTemporales[index];
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

    const fila = cortesiasTemporales[index];
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
        const res = await updateCortesia(fila._id, { cantidad });
        if (!res) return; // el contexto ya mostró el error
      } else {
        toast.success("Producto actualizado en la lista");
      }

      const delta = cantidad - fila.cantidad;
      const productoId = fila.producto?._id;

      setCortesiasTemporales((prev) =>
        prev.map((c, i) => {
          const nuevaCantidad = i === index ? cantidad : c.cantidad;
          if (c.producto?._id === productoId) {
            return {
              ...c,
              cantidad: nuevaCantidad,
              producto: {
                ...c.producto,
                cantidad_cortesia: (c.producto.cantidad_cortesia || 0) + delta,
              },
            };
          }
          return i === index ? { ...c, cantidad } : c;
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
            para generar cortesías:
          </span>
          <ul className="mt-2 text-left">
            {productosSinStockRecepcion.map((cortesia, idx) => {
              const stockRecepcion = calcularStockRecepcion(cortesia.producto);
              const salidas = cortesia.producto?.salidas || 0;
              const cantidadVendida = cortesia.producto?.cantidad_vendida || 0;
              const cantidadRepuesta =
                cortesia.producto?.cantidad_repuesta || 0;
              const cantidadCortesiaActual =
                cortesia.producto?.cantidad_cortesia || 0;

              return (
                <li key={idx} className="mb-1">
                  <strong>{cortesia.producto?.nombre || "Producto"}</strong>:
                  Stock en recepción: {stockRecepcion}
                  (Salidas: {salidas} - Vendidas: {cantidadVendida} - Repuestas:{" "}
                  {cantidadRepuesta} - Cortesías: {cantidadCortesiaActual}),
                  Cantidad solicitada: {cortesia.cantidad}
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
        {/* PRODUCTO */}
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

        {/* CANTIDAD */}
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

        {/* RESPONSABLE */}
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
            <option value="David">David</option>
            <option value="Luz">Luz</option>
            <option value="Miriam">Miriam</option>
            <option value="Maryorie">Maryorie</option>
            <option value="Yadira">Dania</option>
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
            className="cursor-pointer bg-[#b9bc31] text-zinc-800 px-4 py-2 rounded-md hover:bg-yellow-300 hover:text-black my-2"
          >
            Agregar
          </button>
        </div>
      </form>

      {/* TABLA DE CORTESÍAS TEMPORALES */}
      <div className="bg-white pt-4 w-[75%]">
        <div className="max-h-[300px] overflow-y-auto">
          <table className="w-full table-auto text-sm text-left text-gray-700">
            <thead className="sticky top-0 bg-white z-10 shadow">
              <tr className="bg-[#b9bc31] text-xs uppercase text-gray-500">
                <th className="px-6 py-3 text-center rounded-tl-[10px]">
                  Producto
                </th>
                <th className="px-6 py-3 text-center">Cantidad</th>
                <th className="px-6 py-3 text-center bg-green-200">
                  Stock Recepción
                </th>
                <th className="px-6 py-3 text-center">Responsable</th>
                <th className="px-6 py-3 text-center">Observación</th>
                <th className="px-6 py-3 text-center rounded-tr-[10px]">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {cortesiasTemporales.map((c, index) => {
                console.log(c)
                const enEdicion = editIndex === index;
                return (
                  <tr
                    key={index}
                    className={`border-b transition duration-150 ${
                      c.cantidad >
                      c.producto.salidas -
                        (c.producto.cantidad_vendida +
                          c.producto.cantidad_repuesta +
                          c.producto.cantidad_cortesia)
                        ? "bg-red-100"
                        : "bg-white"
                    }`}
                  >
                    <td className="px-6 py-4 text-center">
                      {c.producto?.nombre || "Sin nombre"}
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
                        c.cantidad
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-green-600 font-bold">
                      {c.producto.salidas -
                        (c.producto.cantidad_vendida +
                          c.producto.cantidad_repuesta +
                          c.producto.cantidad_cortesia)}
                    </td>
                    <td className="px-6 py-4 text-center">{c.responsable}</td>
                    <td className="px-6 py-4 text-center">
                      {c.observacion || "-"}
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
                              const nuevas = cortesiasTemporales.filter(
                                (_, i) => i !== index
                              );
                              setCortesiasTemporales(nuevas);
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
              {cortesiasTemporales.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-400 text-xs"
                  >
                    No hay cortesías agregadas aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESUMEN */}
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
              onClick={handleGuardarCortesias}
              disabled={isSubmitting || editIndex !== null}
              className={`px-4 py-2 rounded-md my-2 text-zinc-800 cursor-pointer
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

export default CortesiasVariasFormPage;
