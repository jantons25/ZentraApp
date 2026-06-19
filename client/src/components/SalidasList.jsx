import { useState } from "react";
import { useSalida } from "../context/SalidaContext.jsx";
import ModalBig from "./ModalBig.jsx";
import ModalConfirmacion from "./ModalConfirmacion.jsx";
import SalidaVariasFormPage from "./SalidasVariasFormPage.jsx";

function SalidasList({ salidas, products, closeModal, refreshPagina }) {
  const { deleteLoteCompletoSalidas } = useSalida();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSalida, setSelectedSalida] = useState(null);
  const [loteAEliminar, setLoteAEliminar] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const [filtroProducto, setFiltroProducto] = useState("");

  // -----------------------------
  // RANGO DE FECHAS (nuevo)
  // -----------------------------
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const toInputDate = (date) => date.toISOString().slice(0, 10);

  const setTodayRange = () => {
    const today = new Date();
    const v = toInputDate(today);
    setStartDate(v);
    setEndDate(v);
  };

  const setThisWeekRange = () => {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    setStartDate(toInputDate(monday));
    setEndDate(toInputDate(sunday));
  };

  const setThisMonthRange = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setStartDate(toInputDate(start));
    setEndDate(toInputDate(end));
  };

  const setThisYearRange = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 1);
    const end = new Date(today.getFullYear(), 11, 31);
    setStartDate(toInputDate(start));
    setEndDate(toInputDate(end));
  };

  const fechaEnRango = (createdAt) => {
    if (!startDate && !endDate) return true;

    const fechaStr = new Date(createdAt).toISOString().slice(0, 10);

    if (startDate && fechaStr < startDate) return false;
    if (endDate && fechaStr > endDate) return false;

    return true;
  };

  // -----------------------------
  // AGRUPAR POR LOTE
  // -----------------------------
  function agruparYOrdenarSalidasPorLote(salidas) {
    const lotes = {};

    salidas.forEach((s) => {
      const idLote = s.id_lote ?? "sin-lote";
      if (!lotes[idLote]) lotes[idLote] = [];
      lotes[idLote].push(s);
    });

    return Object.entries(lotes)
      .map(([id_lote, salidas]) => ({
        id_lote,
        salidas,
        createdAt: salidas[0]?.createdAt || null,
        user: salidas[0]?.user.name || "Sin usuario"
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const lotesOrdenados = agruparYOrdenarSalidasPorLote(salidas);

  // -----------------------------
  // FILTROS (producto + rango fecha)
  // -----------------------------
  const lotesFiltrados = lotesOrdenados.filter((lote) =>
    lote.salidas.some((salida) => {
      const productoId =
        typeof salida.producto === "string"
          ? salida.producto
          : salida.producto?._id;

      const productoObj = products.find((p) => p._id === productoId);
      const nombreProducto = productoObj?.nombre || "";

      const productoMatch = nombreProducto
        .toLowerCase()
        .includes(filtroProducto.toLowerCase());

      const fechaMatch = fechaEnRango(salida.createdAt);

      return productoMatch && fechaMatch;
    })
  );

  // -----------------------------
  // CONFIRMAR ELIMINAR LOTE
  // -----------------------------
  const confirmarEliminarLote = async () => {
    try {
      await deleteLoteCompletoSalidas(loteAEliminar);
      refreshPagina();
    } catch (error) {
      console.error("Error eliminando lote:", error);
    } finally {
      setMostrarModal(false);
      setLoteAEliminar(null);
    }
  };

  if (!salidas || salidas.length === 0) {
    return (
      <h1 className="text-center text-gray-600">No hay salidas registradas.</h1>
    );
  }

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="bg-white p-4 w-full descripcion__container">
      <h1 className="text-2xl bold font-medium">Lista de Salidas</h1>
      <p className="p_final">
        En esta sección puedes revisar y controlar todas las salidas de
        productos desde el almacén central. Usa los filtros por fecha o producto
        para encontrar rápidamente un movimiento específico y, si necesitas
        hacer correcciones, utiliza los botones de Editar o Eliminar en cada
        registro.
      </p>

      {/* ------------------------ FILTRO DE RANGO ------------------------ */}
      <div className="mt-4 mb-4 p-3 bg-gray-50 border rounded-lg flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Desde
          </label>
          <input
            type="date"
            className="border rounded px-2 py-1 text-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Hasta
          </label>
          <input
            type="date"
            className="border rounded px-2 py-1 text-sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">
            Atajos de periodo
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={setTodayRange}
              className="text-xs border rounded px-2 py-1 hover:bg-gray-100"
            >
              Hoy
            </button>
            <button
              onClick={setThisWeekRange}
              className="text-xs border rounded px-2 py-1 hover:bg-gray-100"
            >
              Esta semana
            </button>
            <button
              onClick={setThisMonthRange}
              className="text-xs border rounded px-2 py-1 hover:bg-gray-100"
            >
              Este mes
            </button>
            <button
              onClick={setThisYearRange}
              className="text-xs border rounded px-2 py-1 hover:bg-gray-100"
            >
              Este año
            </button>
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="text-xs border rounded px-2 py-1 hover:bg-gray-100"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------ TABLA CON SCROLL ------------------------ */}
      <div className="mt-3 max-h-[60vh] overflow-y-auto border rounded-lg">
        <table className="w-full table-auto text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500 sticky top-0">
            <tr>
              <th className="px-6 py-2 text-center bg-gray-100">Fecha</th>
              <th className="px-6 py-2 text-center bg-gray-100">Usuario</th>
              <th className="px-6 py-2 text-center bg-gray-100">
                Producto
                <input
                  type="text"
                  placeholder="Buscar producto"
                  value={filtroProducto}
                  onChange={(e) => setFiltroProducto(e.target.value)}
                  className="mt-1 w-full text-center text-black border rounded px-2 py-1"
                />
              </th>

              <th className="px-6 py-2 text-center bg-gray-100">Cantidad</th>
              <th className="px-6 py-2 text-center bg-gray-100">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {lotesFiltrados.map((lote) => (
              <tr
                key={lote.id_lote}
                className="border-b hover:bg-gray-50 transition duration-150"
              >
                <td className="px-6 py-4 font-medium text-center">
                  {new Date(lote.createdAt).toLocaleDateString("es-PE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}{" "}
                  {new Date(lote.createdAt).toLocaleTimeString("es-PE", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </td>
                <td className="px-6 py-4 font-medium text-center">
                  {lote.user}
                </td>
                <td className="px-6 py-4 text-center">
                  {lote.salidas.slice(0, 3).map((salida, index) => {
                    const productId =
                      typeof salida.producto === "string"
                        ? salida.producto
                        : salida.producto?._id;

                    const producto = products.find((p) => p._id === productId);

                    return (
                      <div key={index}>{producto?.nombre || "Desconocido"}</div>
                    );
                  })}

                  {lote.salidas.length > 3 && (
                    <div className="text-gray-400 text-sm italic">otros...</div>
                  )}
                </td>

                <td className="px-6 py-4 text-center">
                  {lote.salidas.slice(0, 3).map((salida, index) => (
                    <div key={index}>{salida.cantidad.toFixed(2)}</div>
                  ))}
                  {lote.salidas.length > 3 && (
                    <div className="text-gray-400 text-sm italic">otros...</div>
                  )}
                </td>

                <td className="px-6 py-4 flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      setSelectedSalida(lote);
                      setIsModalOpen(true);
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs cursor-pointer"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => {
                      setLoteAEliminar(lote.id_lote);
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

      {/* ------------------------ MODALES ------------------------ */}
      <ModalBig
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        component={
          selectedSalida ? (
            <SalidaVariasFormPage
              closeModal={() => setIsModalOpen(false)}
              refreshPagina={refreshPagina}
              salida={selectedSalida}
              products={products}
            />
          ) : null
        }
      />

      <ModalConfirmacion
        isOpen={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onConfirm={confirmarEliminarLote}
        mensaje="¿Estás seguro de que deseas eliminar este lote de salidas?"
      />
    </div>
  );
}

export default SalidasList;
