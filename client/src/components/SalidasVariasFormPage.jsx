import { useForm } from "react-hook-form";
import { useSalida } from "../context/SalidaContext.jsx";
import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { salidaItemSchema } from "../validations/salidaSchema";

function SalidaVariasFormPage({ closeModal, refreshPagina, salida, products }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(salidaItemSchema),
  });

  const { createSalida, updateLoteSalidas } = useSalida();
  const [salidasTemporales, setSalidasTemporales] = useState([]);
  const [textBoton, setTextBoton] = useState("Registrar");
  const [isSubmitting, setIsSubmitting] = useState(false);
  //01.02.26 Productos sin stock
  const [productosSinStock, setProductosSinStock] = useState([]);

  const totalItems = salidasTemporales.reduce(
    (acc, salida) => acc + (salida.cantidad || 0),
    0
  );

  const salidasParaEnviar = salidasTemporales.map((salida) => ({
    ...salida,
    producto: salida.producto._id || salida.producto,
  }));

  const tieneStockSuficiente = (salidaItem) => {
    return (
      salidaItem.cantidad <=
      salidaItem.producto.ingresos - salidaItem.producto.salidas
    );
  };

  //01.02.26 Actualizada
  const handleGuardarSalidas = async () => {
    if (isSubmitting) return; // bloquea doble click
    setIsSubmitting(true);

    try {
      // Verificar stock disponible
      const productosSinStockTemp = verificarStockDisponible();

      if (productosSinStockTemp.length > 0) {
        // Actualizar estado con productos sin stock
        setProductosSinStock(productosSinStockTemp);
        setIsSubmitting(false); // reactiva porque no se guardará
        return; // Detener la ejecución
      }

      // Si todo está bien, proceder con el guardado
      const salidasParaEnviar = salidasTemporales.map((salida) => ({
        cantidad: salida.cantidad,
        producto:
          typeof salida.producto === "string"
            ? salida.producto
            : salida.producto._id,
        fecha_vencimiento: salida.fecha_vencimiento || undefined,
      }));

      if (salida && salida.salidas) {
        const idsOriginales = salida.salidas.map((s) => s._id);
        await updateLoteSalidas(idsOriginales, salidasParaEnviar);
      } else {
        await createSalida(salidasParaEnviar);
      }

      // Limpiar estados
      setProductosSinStock([]);
      setSalidasTemporales([]);
      refreshPagina();
      closeModal();
    } catch (err) {
      console.error("Error al guardar lote de salidas:", err);
    } finally {
      setIsSubmitting(false); // reactiva siempre al final
    }
  };

  const onSubmit = handleSubmit((data) => {
    const nuevaSalida = {
      ...data,
      producto: products.find((p) => p._id === data.producto),
    };
    setSalidasTemporales((prev) => [...prev, nuevaSalida]);
    reset();
  });

  //01.02.26
  const verificarStockDisponible = () => {
    const productosSinStockTemp = salidasTemporales.filter(
      (salida) =>
        salida.cantidad > salida.producto.ingresos - salida.producto.salidas
    );

    return productosSinStockTemp;
  };

  useEffect(() => {
    if (salida?.salidas?.length > 0) {
      setTextBoton("Actualizar");
      const salidasConProductoObj = salida.salidas.map((s) => ({
        ...s,
        producto: products.find(
          (p) =>
            p._id ===
            (typeof s.producto === "string" ? s.producto : s.producto._id)
        ),
      }));
      setSalidasTemporales(salidasConProductoObj);
    }
  }, [salida, products]);

  return (
    <div className="bg-white w-full p-5 rounded-md flex flex-row flex-wrap">
      {productosSinStock.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded w-full flex flex-col">
          <strong className="font-bold text-left">¡Stock insuficiente!</strong>
          <span className="block sm:inline text-left">
            Los siguientes productos no tienen suficiente stock:
          </span>
          <ul className="mt-2 ml-4">
            {productosSinStock.map((salida, idx) => (
              <li key={idx} className="list-disc text-left">
                <strong>{salida.producto?.nombre || "Producto"}</strong>: Stock
                disponible: {salida.producto.ingresos - salida.producto.salidas}
                , Cantidad solicitada: {salida.cantidad}
              </li>
            ))}
          </ul>
        </div>
      )}
      <form
        onSubmit={onSubmit}
        className="flex flex-row flex-wrap gap-4 align-center justify-start"
      >
        <div className="relative w-40 my-2">
          <label className="font-bold block text-left">Producto</label>
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
          <label className="font-bold block text-left">Cantidad</label>
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

        <div className="w-30 flex justify-center items-end">
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
                <th className="px-6 py-3 text-center bg-green-200">
                  Stock Central
                </th>
                <th className="px-6 py-3 text-center rounded-tr-[10px]">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {salidasTemporales.map((salida, index) => (
                <tr
                  key={index}
                  className={`border-b transition duration-150 ${
                    salida.cantidad >
                    salida.producto.ingresos - salida.producto.salidas
                      ? "bg-red-100"
                      : "bg-white"
                  }`}
                >
                  <td className="px-6 py-4 text-center">
                    {salida.producto?.nombre || "Sin nombre"}
                  </td>
                  <td className="px-6 py-4 text-center">{salida.cantidad}</td>
                  <td className="px-6 py-4 text-center text-green-600 font-bold">
                    {salida.producto.ingresos - salida.producto.salidas}
                  </td>
                  <td className="px-6 py-4 flex justify-center">
                    <button
                      onClick={() => {
                        const nuevas = salidasTemporales.filter(
                          (_, i) => i !== index
                        );
                        setSalidasTemporales(nuevas);
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="resumem w-[20%] mt-4 ml-10 border-2 border-[#ddd] h-[300px] rounded-[10px]">
        <div className="w-[90%] m-auto title border-b-2 border-[#ddd] p-2 flex">
          <h2>Resumen</h2>
        </div>

        <div className="data mt-4">
          <div className="items w-[90%] flex flex-row justify-between p-2 m-auto text-[0.8rem]">
            <p>Items</p>
            <span>{totalItems}</span>
          </div>
        </div>

        <div className="w-[90%] mt-15 m-auto title border-t-2 border-[#ddd] flex flex-col">
          <div className="total w-[90%] text-[0.8rem] flex flex-row justify-between p-2 m-auto">
            <p>Total</p>
            <span>{totalItems}</span>
          </div>
          <div className="w-30 m-auto mt-2 flex justify-center align-center">
            <button
              type="button"
              onClick={handleGuardarSalidas}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md my-2 text-zinc-800
        ${
          isSubmitting
            ? "bg-gray-400 cursor-not-allowed opacity-60"
            : "bg-[#b9bc31] hover:bg-yellow-300 hover:text-black"
        }`}
            >
              {isSubmitting ? "Registrando..." : textBoton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalidaVariasFormPage;
