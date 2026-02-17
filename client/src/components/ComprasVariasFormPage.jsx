import { useForm } from "react-hook-form";
import { useCompra } from "../context/CompraContext.jsx";
import { useEffect } from "react";
import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { compraItemSchema } from "../validations/compraSchema.js";

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

  const { createCompra, updateLoteCompras } = useCompra();
  const [comprasTemporales, setComprasTemporales] = useState([]);
  const [textCompra, setTextCompra] = useState("Comprar");
  const totalItems = comprasTemporales.reduce(
    (acc, compra) => acc + (compra.cantidad || 0),
    0,
  );
  const totalImporte = comprasTemporales.reduce(
    (acc, compra) => acc + (compra.importe_compra || 0),
    0,
  );
  const comprasParaEnviar = comprasTemporales.map((compra) => ({
    ...compra,
    producto: compra.producto._id,
  }));

  const handleGuardarCompras = async () => {
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
            (typeof v.producto === "string" ? v.producto : v.producto._id),
        ),
      }));
      setComprasTemporales(comprasConProductoObj);
    }
  }, [compra, products]);

  return (
    <div className="bg-white w-full p-5 rounded-md flex flex-row flex-wrap">
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
                <th className="px-6 py-3 text-center">Precio</th>
                <th className="px-6 py-3 text-center">Importe</th>
                <th className="px-6 py-3 text-center">Fecha Vencimiento</th>
                <th className="px-6 py-3 text-center rounded-tr-[10px]">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {comprasTemporales.map((compra, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-6 py-4 text-center">
                    {compra.producto?.nombre || "Sin nombre"}
                  </td>
                  <td className="px-6 py-4 text-center">{compra.cantidad}</td>
                  <td className="px-6 py-4 text-center">
                    S/{compra.precio_compra.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    S/{compra.importe_compra.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {new Date(compra.fecha_vencimiento).toLocaleDateString(
                      "es-PE",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      },
                    )}
                  </td>
                  <td className="px-6 py-4 flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        const nuevasCompras = comprasTemporales.filter(
                          (_, i) => i !== index,
                        );
                        setComprasTemporales(nuevasCompras);
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
              className="bg-[#b9bc31] text-zinc-800 px-4 py-2 rounded-md hover:bg-yellow-300 hover:text-black my-2"
            >
              {textCompra}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComprasVariasFormPage;
