import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useVelada } from "../context/VeladaContext.jsx";

function VeladasVariasFormPage({
  closeModal,
  refreshPagina,
  velada, // lote seleccionado (para editar) o undefined (para crear)
  products,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const { createVelada, updateLoteVelada } = useVelada();
  const [veladasTemporales, setVeladasTemporales] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productosSinStockRecepcion, setProductosSinStockRecepcion] = useState(
    []
  );

  const totalItems = veladasTemporales.reduce(
    (acc, v) => acc + (Number(v.cantidad) || 0),
    0
  );

  // Función para calcular stock en recepción
  const calcularStockRecepcion = (producto) => {
    if (!producto) return 0;

    const salidas = producto.salidas || 0;
    const cantidadVendida = producto.cantidad_vendida || 0;
    const cantidadRepuesta = producto.cantidad_repuesta || 0;
    const cantidadCortesia = producto.cantidad_cortesia || 0;
    const cantidadVelada = producto.cantidad_velada || 0;

    return (
      salidas -
      (cantidadVendida + cantidadRepuesta + cantidadCortesia + cantidadVelada)
    );
  };

  // Función para verificar stock en recepción
  const verificarStockEnRecepcion = () => {
    const productosSinStockTemp = veladasTemporales.filter((velada) => {
      const stockRecepcion = calcularStockRecepcion(velada.producto);
      return velada.cantidad > stockRecepcion;
    });

    return productosSinStockTemp;
  };

  const handleGuardarVeladas = async () => {
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
      const veladasParaEnviar = veladasTemporales.map((v) => ({
        cantidad: v.cantidad,
        producto: typeof v.producto === "string" ? v.producto : v.producto._id,
        responsable: v.responsable,
        observacion: v.observacion,
      }));

      if (velada && velada.veladas) {
        // MODO EDICIÓN LOTE
        const idsOriginales = velada.veladas.map((v) => v._id);
        await updateLoteVelada({
          ids: idsOriginales,
          nuevasVeladas: veladasParaEnviar,
        });
      } else {
        // MODO CREACIÓN LOTE
        await createVelada(veladasParaEnviar);
      }

      // Limpiar estados
      setProductosSinStockRecepcion([]);
      setVeladasTemporales([]);
      await refreshPagina();
      closeModal();
    } catch (err) {
      console.error("Error al guardar lote de veladas:", err);
    } finally {
      setIsSubmitting(false); // reactiva siempre al final
    }
  };

  const onSubmit = handleSubmit((data) => {
    const nuevaVelada = {
      ...data,
      producto: products.find((p) => p._id === data.producto),
    };

    setVeladasTemporales((prev) => [...prev, nuevaVelada]);
    reset();
    // Limpiar productos sin stock cuando se agrega uno nuevo
    setProductosSinStockRecepcion([]);
  });

  useEffect(() => {
    // Si venimos a EDITAR un lote de veladas
    if (velada?.veladas?.length > 0 && products?.length > 0) {
      const veladasConProductoObj = velada.veladas.map((v) => ({
        ...v,
        producto: products.find(
          (p) =>
            p._id ===
            (typeof v.producto === "string" ? v.producto : v.producto._id)
        ),
      }));
      setVeladasTemporales(veladasConProductoObj);
    }
  }, [velada, products]);

  return (
    <div className="bg-white w-full p-5 rounded-md flex flex-row flex-wrap gap-4">
      {productosSinStockRecepcion.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded w-full mb-4">
          <strong className="font-bold text-left block">
            ¡Stock insuficiente en recepción!
          </strong>
          <span className="block text-left mb-2">
            Los siguientes productos no tienen suficiente stock en recepción
            para generar veladas:
          </span>
          <ul className="mt-2 text-left">
            {productosSinStockRecepcion.map((velada, idx) => {
              const stockRecepcion = calcularStockRecepcion(velada.producto);
              const salidas = velada.producto?.salidas || 0;
              const cantidadVendida = velada.producto?.cantidad_vendida || 0;
              const cantidadRepuesta = velada.producto?.cantidad_repuesta || 0;
              const cantidadCortesia = velada.producto?.cantidad_cortesia || 0;
              const cantidadVeladaActual =
                velada.producto?.cantidad_velada || 0;

              return (
                <li key={idx} className="mb-1">
                  <strong>{velada.producto?.nombre || "Producto"}</strong>:
                  Stock en recepción: {stockRecepcion}
                  (Salidas: {salidas} - Vendidas: {cantidadVendida} - Repuestas:{" "}
                  {cantidadRepuesta} - Cortesías: {cantidadCortesia} - Veladas:{" "}
                  {cantidadVeladaActual}), Cantidad solicitada:{" "}
                  {velada.cantidad}
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
            <option value="Yadira">Yadira</option>
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

      {/* TABLA DE VELADAS TEMPORALES */}
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
              {veladasTemporales.map((v, index) => (
                <tr
                  key={index}
                  className={`border-b transition duration-150 ${
                    v.cantidad > calcularStockRecepcion(v.producto)
                      ? "bg-red-100"
                      : "bg-white"
                  }`}
                >
                  <td className="px-6 py-4 text-center">
                    {v.producto?.nombre || "Sin nombre"}
                  </td>
                  <td className="px-6 py-4 text-center">{v.cantidad}</td>
                  <td className="px-6 py-4 text-center text-green-600 font-bold">
                    {calcularStockRecepcion(v.producto)}
                  </td>
                  <td className="px-6 py-4 text-center">{v.responsable}</td>
                  <td className="px-6 py-4 text-center">
                    {v.observacion || "-"}
                  </td>
                  <td className="px-6 py-4 flex justify-center">
                    <button
                      onClick={() => {
                        const nuevas = veladasTemporales.filter(
                          (_, i) => i !== index
                        );
                        setVeladasTemporales(nuevas);
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {veladasTemporales.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-400 text-xs"
                  >
                    No hay veladas agregadas aún.
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
              onClick={handleGuardarVeladas}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md my-2 text-zinc-800
        ${
          isSubmitting
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

export default VeladasVariasFormPage;
