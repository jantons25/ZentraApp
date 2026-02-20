import { useState } from "react";
import { useProduct } from "../context/ProductContext.jsx";
import ModalBig from "./ModalBig.jsx";
import ProductFormPage from "../pages/ProductFormPage.jsx";
import ModalConfirmacion from "./ModalConfirmacion.jsx";

function ProductsList({ compras, products, closeModal, refreshPagina }) {
  const { deleteProduct } = useProduct();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  const calcularPrecioPromedio = (productId) => {
    const comprasDelProducto = (compras || []).filter(
      (compra) => compra.producto._id === productId
    );
    if (comprasDelProducto.length === 0) return "0.00";

    const sumaPrecios = comprasDelProducto.reduce(
      (total, compra) => total + compra.precio_compra,
      0
    );
    const promedio = sumaPrecios / comprasDelProducto.length;
    return promedio.toFixed(2);
  };

  if (!products || products.length === 0) {
    return <h1 className="text-center text-gray-600">No hay productos.</h1>;
  }

  const productosOrdenados = [...products].sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  );

  const productosFiltrados = productosOrdenados.filter((product) => {
    const nombreMatch = product.nombre
      .toLowerCase()
      .includes(filtroNombre.toLowerCase());
    const categoriaMatch = product.categoria
      .toLowerCase()
      .includes(filtroCategoria.toLowerCase());
    return nombreMatch && categoriaMatch;
  });

  const confirmarEliminarProduct = async () => {
    try {
      await deleteProduct(selectedProduct);
      refreshPagina();
    } catch (error) {
      console.error("Error eliminando el producto:", error);
    } finally {
      setMostrarModal(false);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="bg-white p-4 w-full descripcion__container">
      <h1 className="text-2xl bold font-medium">Lista de Productos</h1>
      <p className="p_final">
        En esta sección puedes ver, editar y gestionar todos los productos
        disponibles en tu inventario general. Usa los filtros para encontrar
        productos por nombre y categoría.
      </p>

      {/* CONTENEDOR CON SCROLL SOLO PARA EL BODY */}
      <div className="mt-2 max-h-[60vh] overflow-y-auto border rounded-lg">
        <table className="w-full table-auto text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500 sticky top-0">
            <tr>
              <th className="px-6 py-2 text-center bg-gray-100">
                <div className="flex flex-col items-center">
                  Nombre
                  <input
                    type="text"
                    placeholder="Buscar nombre"
                    value={filtroNombre}
                    onChange={(e) => setFiltroNombre(e.target.value)}
                    className="mt-1 w-35 text-xs text-black border rounded px-2 py-1 text-center"
                  />
                </div>
              </th>
              <th className="px-6 py-2 text-center bg-gray-100">
                <div className="flex flex-col items-center">
                  Categoría
                  <input
                    type="text"
                    placeholder="Buscar categoría"
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="mt-1 w-35 text-xs text-black border rounded px-2 py-1 text-center"
                  />
                </div>
              </th>
              <th className="px-6 py-2 text-center bg-amber-100">
                Stock General
              </th>
              <th className="px-6 py-2 text-center bg-amber-100">
                Stock Central
              </th>
              <th className="px-6 py-2 text-center bg-amber-100">
                Stock Recepción
              </th>
              <th className="px-6 py-2 text-center bg-emerald-200">
                Precio Compra Prom.
              </th>
              <th className="px-6 py-2 text-center bg-emerald-200">
                Precio Venta
              </th>
              <th className="px-6 py-2 text-center bg-gray-100">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {productosFiltrados.map((product) => (
              <tr
                key={product._id}
                className="border-b hover:bg-gray-50 transition duration-150"
              >
                <td className="px-6 py-4 font-medium text-center">
                  {product.nombre}
                </td>
                <td className="px-6 py-4 text-center">{product.categoria}</td>
                <td className="px-6 py-4 text-right">
                  {product.ingresos -
                    (product.cantidad_vendida +
                      product.cantidad_repuesta +
                      product.cantidad_cortesia +
                      product.cantidad_velada)}
                </td>
                <td className="px-6 py-4 text-right">
                  {product.ingresos - product.salidas}
                </td>
                <td className="px-6 py-4 text-right">
                  {product.salidas -
                    (product.cantidad_vendida +
                      product.cantidad_repuesta +
                      product.cantidad_cortesia +
                      product.cantidad_velada)}
                </td>
                <td className="px-6 py-4 text-right">
                  S/{calcularPrecioPromedio(product._id)}
                </td>
                <td className="px-6 py-4 text-right">
                  S/{product.precio_venta.toFixed(2)}
                </td>
                <td className="px-6 py-4 flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsModalOpen(true);
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProduct(product._id);
                      setMostrarModal(true);
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

      <ModalBig
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        product={selectedProduct}
        component={
          selectedProduct ? (
            <ProductFormPage
              closeModal={() => setIsModalOpen(false)}
              refreshPagina={refreshPagina}
              product={selectedProduct}
            />
          ) : null
        }
      />
      <ModalConfirmacion
        isOpen={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onConfirm={confirmarEliminarProduct}
        mensaje="¿Estás seguro de que deseas eliminar este producto?"
      />
    </div>
  );
}

export default ProductsList;
