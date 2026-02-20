import { useState } from "react";
import { useProduct } from "../context/ProductContext.jsx";
import Tooltip from "./Tooltip.jsx";

function InventarioCentralList({ products, compras, ventas, user }) {
  const { deleteProduct } = useProduct();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const calcularImporteVentaTotal = (productId) => {
    const ventasDelProducto = ventas.filter(
      (venta) => venta.producto._id === productId
    );
    if (ventasDelProducto.length === 0) return 0; // Si no hay compras, retorna 0

    const sumaImportes = ventasDelProducto.reduce(
      (total, venta) => total + venta.importe_venta,
      0
    );
    return sumaImportes.toFixed(2); // Redondea a 2 decimales
  };

  if (products === undefined) {
    return <h1>No hay productos</h1>;
  }

  return (
    <div className="bg-white p-4 w-full descripcion__container">
      <h1 className="text-2xl bold font-medium">Inventario Recepción</h1>
      <p className="p_final">
        En esta sección puedes revisar y controlar el inventario de productos en
        recepción. Aquí verás los ingresos desde almacén central, las unidades
        vendidas, las reposiciones realizadas a habitaciones, las cortesías
        entregadas y el stock actual de cada producto.
      </p>

      {/* -------- TABLA CON HEAD FIJO -------- */}
      <div className="mt-3 max-h-[60vh] overflow-y-auto border rounded-lg">
        <table className="w-full table-auto text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-center bg-gray-100">Producto</th>
              <th className="px-6 py-3 text-center bg-emerald-200">
                <Tooltip text="Salidas de productos desde el almacén central." />
                <br />
                Ingresos
              </th>
              <th className="px-6 py-3 text-center bg-red-200">Venta</th>
              <th className="px-6 py-3 text-center bg-red-200">
                Reposiciones <br /> habitaciones
              </th>
              <th className="px-6 py-3 text-center bg-red-200">Cortesías</th>
              <th className="px-6 py-3 text-center bg-red-200">Veladas</th>
              <th className="px-6 py-3 text-center bg-amber-100">
                Stock Actual
              </th>
              <th className="px-6 py-3 text-center bg-gray-100">
                Precio Venta
              </th>
              <th className="px-6 py-3 text-center bg-emerald-200">
                <Tooltip text="Total ventas del producto = Σ(cantidad vendida × precio de venta)." />
                <br />
                Venta Total <br /> Acumulada
              </th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr
                key={product._id}
                className="border-b hover:bg-gray-50 transition duration-150"
              >
                <td className="px-6 py-4 font-medium">{product.nombre}</td>

                <td className="px-6 py-4 text-center">{product.salidas}</td>

                <td className="px-6 py-4 text-center">
                  {product.cantidad_vendida}
                </td>

                <td className="px-6 py-4 text-center">
                  {product.cantidad_repuesta}
                </td>

                <td className="px-6 py-4 text-center">
                  {product.cantidad_cortesia}
                </td>

                <td className="px-6 py-4 text-center">
                  {product.cantidad_velada}
                </td>

                <td className="px-6 py-4 text-center text-blue-600 font-bold">
                  {product.salidas -
                    (product.cantidad_vendida +
                      product.cantidad_repuesta +
                      product.cantidad_cortesia + product.cantidad_velada)}
                </td>

                <td className="px-6 py-4 text-right">
                  S/ {product.precio_venta.toFixed(2)}
                </td>

                <td className="px-6 py-4 text-right">
                  S/ {calcularImporteVentaTotal(product._id)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventarioCentralList;
