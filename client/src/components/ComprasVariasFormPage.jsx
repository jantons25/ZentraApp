import { useForm } from "react-hook-form";
import { useCompra } from "../context/CompraContext.jsx";
import { useEffect } from "react";
import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { compraItemSchema } from "../validations/compraSchema.js";
import { toast } from "react-hot-toast";

function ComprasVariasFormPage({
  closeModal,
  refreshPagina,
  compra,
  products,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(compraItemSchema),
  });

  const { createCompra, updateLoteCompras, updateCompra } = useCompra();
  const [comprasTemporales, setComprasTemporales] = useState([]);
  const [textCompra, setTextCompra] = useState("Comprar");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Edición individual de filas
  const [editIndex, setEditIndex] = useState(null);
  const [editValues, setEditValues] = useState({
    cantidad: "",
    precio_compra: "",
    fecha_vencimiento: "",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const totalItems = comprasTemporales.reduce(
    (acc, compra) => acc + (compra.cantidad || 0),
    0
  );
  const totalImporte = comprasTemporales.reduce(
    (acc, compra) => acc + (compra.importe_compra || 0),
    0
  );
  const comprasParaEnviar = comprasTemporales.map((compra) => ({
    ...compra,
    producto: compra.producto._id,
  }));

  const handleGuardarCompras = async () => {
    if (isSubmitting) return; // bloquea doble click
    setIsSubmitting(true);

    try {
      if (compra) {
        const comprasParaActualizar = comprasTemporales.map((compra) => ({
          ...compra,
          producto: compra.producto._id,
        }));

        const idsOriginales = compra.compras.map((v) => v._id);

        await updateLoteCompras({
          ids: idsOriginales,
          nuevasCompras: comprasParaActualizar,
        });
      } else {
        await createCompra(comprasParaEnviar);
      }

      setComprasTemporales([]);
      refreshPagina();
      closeModal();
    } catch (error) {
      console.error("Error al guardar compras múltiples:", error);
    } finally {
      setIsSubmitting(false); // reactiva siempre al final
    }
  };

  const onSubmit = handleSubmit((data) => {
    const nuevaCompra = {
      ...data,
      importe_compra: data.cantidad * data.precio_compra,
      producto: products.find((p) => p._id === data.producto),
    };

    setComprasTemporales((prev) => [...prev, nuevaCompra]);
    reset();
  });

  useEffect(() => {
    if (compra?.compras?.length > 0) {
      setTextCompra("Actualizar");
      const comprasConProductoObj = compra.compras.map((v) => ({
        ...v,
        producto: products.find(
          (p) =>
            p._id ===
            (typeof v.producto === "string" ? v.producto : v.producto._id)
        ),
      }));
      setComprasTemporales(comprasConProductoObj);
      setEditIndex(null);
    }
  }, [compra, products]);

  // Convierte fecha (ISO string o Date) al formato del input date
  const toInputDate = (fecha) => {
    if (!fecha) return "";
    const d = new Date(fecha);
    return isNaN(d) ? "" : d.toISOString().slice(0, 10);
  };

  const iniciarEdicion = (index) => {
    if (editIndex !== null) return; // solo una fila en edición a la vez
    const fila = comprasTemporales[index];
    setEditIndex(index);
    setEditValues({
      cantidad: String(fila.cantidad),
      precio_compra: String(fila.precio_compra),
      fecha_vencimiento: toInputDate(fila.fecha_vencimiento),
    });
  };

  const cancelarEdicion = () => {
    setEditIndex(null);
    setEditValues({ cantidad: "", precio_compra: "", fecha_vencimiento: "" });
  };

  const guardarEdicion = async (index) => {
    if (isSavingEdit) return;

    const cantidad = parseInt(editValues.cantidad, 10);
    const precio = parseFloat(editValues.precio_compra);
    const fecha = editValues.fecha_vencimiento;

    if (isNaN(cantidad) || cantidad <= 0) {
      toast.error("La cantidad debe ser un número entero mayor a cero");
      return;
    }
    if (isNaN(precio) || precio <= 0) {
      toast.error("El precio debe ser mayor a cero");
      return;
    }
    if (!fecha) {
      toast.error("Seleccione una fecha de vencimiento");
      return;
    }

    const fila = comprasTemporales[index];
    // No se puede reducir la cantidad por debajo de lo ya usado en salidas
    const cantidadUsada = fila._id
      ? (fila.cantidad || 0) - (fila.cantidad_disponible ?? fila.cantidad ?? 0)
      : 0;
    if (cantidad < cantidadUsada) {
      toast.error(
        `No se puede reducir la cantidad por debajo de lo ya usado en salidas (${cantidadUsada})`
      );
      return;
    }

    setIsSavingEdit(true);
    try {
      const fechaISO = new Date(fecha).toISOString();

      if (fila._id) {
        const res = await updateCompra(fila._id, {
          cantidad,
          precio_compra: precio,
          fecha_vencimiento: fechaISO,
        });
        if (!res) return; // el contexto ya mostró el error
      } else {
        toast.success("Producto actualizado en la lista");
      }

      setComprasTemporales((prev) =>
        prev.map((c, i) =>
          i === index
            ? {
                ...c,
                cantidad,
                precio_compra: precio,
                importe_compra: cantidad * precio,
                fecha_vencimiento: fechaISO,
                ...(c._id
                  ? { cantidad_disponible: cantidad - cantidadUsada }
                  : {}),
              }
            : c
        )
      );
      cancelarEdicion();
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="bg-white w-full p-5 rounded-md flex flex-row flex-wrap">
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
        <div className="relative w-40 my-2">
          <label className="font-bold block text-left">Precio</label>
          {errors.precio_compra && (
            <p className="absolute -top-4 left-0 text-red-500 text-xs z-10">
              {errors.precio_compra.message}
            </p>
          )}
          <input
            type="number"
            step="any"
            placeholder="Precio"
            {...register("precio_compra")}
            className="w-full bg-gray-200 px-4 py-2 rounded-md"
          />
        </div>
        <div className="relative w-40 my-2">
          <label className="font-bold block text-left">F. Vencimiento</label>
          {errors.fecha_vencimiento && (
            <p className="absolute -top-4 left-0 text-red-500 text-xs z-10">
              {errors.fecha_vencimiento.message}
            </p>
          )}
          <input
            type="date"
            step="any"
            placeholder="F. Vencimiento"
            className="w-full bg-gray-200 px-4 py-2 rounded-md"
            {...register("fecha_vencimiento", {
              required: true,
            })}
          />
        </div>
        <div className="w-30 flex justify-center items-end">
          <button
            type="submit"
            className="bg-[#b9bc31]  text-zinc-800 px-4 py-2 rounded-md hover:bg-yellow-300 hover:text-black my-2 cursor-pointer"
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
                <th className="px-6 py-3 text-center">Precio</th>
                <th className="px-6 py-3 text-center">Importe</th>
                <th className="px-6 py-3 text-center">Fecha Vencimiento</th>
                <th className="px-6 py-3 text-center rounded-tr-[10px]">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {comprasTemporales.map((compra, index) => {
                const enEdicion = editIndex === index;
                const importeEditado =
                  (parseInt(editValues.cantidad, 10) || 0) *
                  (parseFloat(editValues.precio_compra) || 0);
                return (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-6 py-4 text-center">
                      {compra.producto?.nombre || "Sin nombre"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {enEdicion ? (
                        <input
                          type="number"
                          min="1"
                          value={editValues.cantidad}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              cantidad: e.target.value,
                            }))
                          }
                          className="w-20 bg-gray-200 px-2 py-1 rounded-md text-center"
                        />
                      ) : (
                        compra.cantidad
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {enEdicion ? (
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={editValues.precio_compra}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              precio_compra: e.target.value,
                            }))
                          }
                          className="w-20 bg-gray-200 px-2 py-1 rounded-md text-center"
                        />
                      ) : (
                        <>S/{compra.precio_compra.toFixed(2)}</>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      S/
                      {enEdicion
                        ? importeEditado.toFixed(2)
                        : compra.importe_compra.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {enEdicion ? (
                        <input
                          type="date"
                          value={editValues.fecha_vencimiento}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              fecha_vencimiento: e.target.value,
                            }))
                          }
                          className="w-32 bg-gray-200 px-2 py-1 rounded-md text-center"
                        />
                      ) : (
                        new Date(compra.fecha_vencimiento).toLocaleDateString(
                          "es-PE",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )
                      )}
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
                              const nuevasCompras = comprasTemporales.filter(
                                (_, i) => i !== index
                              );
                              setComprasTemporales(nuevasCompras);
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
              onClick={handleGuardarCompras}
              disabled={isSubmitting || editIndex !== null}
              className={`px-4 py-2 rounded-md my-2 text-zinc-800 cursor-pointer
        ${
          isSubmitting || editIndex !== null
            ? "bg-gray-400 cursor-not-allowed opacity-60"
            : "bg-[#b9bc31] hover:bg-yellow-300 hover:text-black"
        }`}
            >
              {isSubmitting ? "Registrando..." : textCompra}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComprasVariasFormPage;
