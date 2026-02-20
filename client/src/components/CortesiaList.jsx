// components/CortesiasList.jsx
import { useState } from "react";
import { useCortesia } from "../context/CortesiaContext.jsx";
import ModalBig from "./ModalBig.jsx";
import ModalConfirmacion from "./ModalConfirmacion.jsx";
import CortesiasVariasFormPage from "./CortesiasVariasFormPage.jsx";

function CortesiasList({ cortesias, products, closeModal, refreshPagina }) {
  const { deleteLoteCortesias } = useCortesia();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCortesiaLote, setSelectedCortesiaLote] = useState(null);
  const [loteAEliminar, setLoteAEliminar] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const [filtroProducto, setFiltroProducto] = useState("");

  // ---------------------------
  // FILTRO: RANGO DE FECHAS
  // ---------------------------
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const toInputDate = (date) => date.toISOString().slice(0, 10);

  const setTodayRange = () => {
    const today = new Date();
    const value = toInputDate(today);
    setStartDate(value);
    setEndDate(value);
  };

  const setThisWeekRange = () => {
    const today = new Date();
    const day = today.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab
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
    if (!createdAt) return false;

    const fechaStr = new Date(createdAt).toISOString().slice(0, 10);

    if (startDate && fechaStr < startDate) return false;
    if (endDate && fechaStr > endDate) return false;

    return true;
  };

  const confirmarEliminarLote = async () => {
    try {
      await deleteLoteCortesias(loteAEliminar);
      await refreshPagina();
    } catch (error) {
      console.error("Error eliminando lote de cortesías:", error);
    } finally {
      setMostrarModal(false);
      setLoteAEliminar(null);
    }
  };

  function agruparYOrdenarCortesiasPorLote(cortesias) {
    const lotes = {};

    cortesias.forEach((c) => {
      const idLote = c.id_lote ?? "sin-lote";
      if (!lotes[idLote]) {
        lotes[idLote] = [];
      }
      lotes[idLote].push(c);
    });

    const lotesArray = Object.entries(lotes)
      .map(([id_lote, cortesias]) => ({
        id_lote,
        cortesias,
        createdAt: cortesias[0]?.createdAt || null,
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return lotesArray;
  }

  const lotesOrdenados = agruparYOrdenarCortesiasPorLote(cortesias || []);

  const lotesFiltrados = lotesOrdenados.filter((lote) =>
    lote.cortesias.some((c) => {
      const productoId =
        typeof c.producto === "string" ? c.producto : c.producto?._id;

      const productoObj = products.find((p) => p._id === productoId);
      const nombreProducto = productoObj?.nombre || "";

      const productoMatch = nombreProducto
        .toLowerCase()
        .includes(filtroProducto.toLowerCase());

      const fechaMatch = fechaEnRango(c.createdAt);

      return productoMatch && fechaMatch;
    })
  );

  if (!cortesias || cortesias.length === 0) {
    return (
      <h1 className="text-center text-gray-600">
        No hay cortesías registradas.
      </h1>
    );
  }

  return (
    <div className="bg-white p-4 w-full descripcion__container">
      <h1 className="text-2xl bold font-medium">Lista de Cortesías</h1>
      <p className="p_final">
        En esta sección puedes registrar y controlar todas las cortesías
        entregadas a los huéspedes o clientes. Usa los filtros por fecha o
        producto para encontrar rápidamente un registro específico y, si
        necesitas corregir algún dato, utiliza los botones de Editar o Eliminar
        en cada fila. De esta manera llevas un control claro de qué productos se
        entregan como cortesía, en qué cantidad, quién los autorizó y con qué
        finalidad.
      </p>

      {/* --------- FILTRO DE RANGO DE FECHAS --------- */}
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
              type="button"
              onClick={setTodayRange}
              className="text-xs border rounded px-2 py-1 hover:bg-gray-100"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={setThisWeekRange}
              className="text-xs border rounded px-2 py-1 hover:bg-gray-100"
            >
              Esta semana
            </button>
            <button
              type="button"
              onClick={setThisMonthRange}
              className="text-xs border rounded px-2 py-1 hover:bg-gray-100"
            >
              Este mes
            </button>
            <button
              type="button"
              onClick={setThisYearRange}
              className="text-xs border rounded px-2 py-1 hover:bg-gray-100"
            >
              Este año
            </button>
            <button
              type="button"
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

      {/* --------- TABLA CON SCROLL + HEAD STICKY --------- */}
      <div className="mt-3 max-h-[60vh] overflow-y-auto border rounded-lg">
        <table className="w-full table-auto text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500 sticky top-0">
            <tr>
              <th className="px-6 py-2 text-center bg-gray-100">Fecha</th>
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
              <th className="px-6 py-2 text-center bg-gray-100">Responsable</th>
              <th className="px-6 py-2 text-center bg-gray-100">Observación</th>
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

                {/* Producto(s) del lote */}
                <td className="px-6 py-4 font-medium">
                  {lote.cortesias.slice(0, 3).map((c, index) => {
                    const productoId =
                      typeof c.producto === "string"
                        ? c.producto
                        : c.producto?._id;
                    const producto = products.find((p) => p._id === productoId);
                    return (
                      <div key={index}>{producto?.nombre || "Desconocido"}</div>
                    );
                  })}
                  {lote.cortesias.length > 3 && (
                    <div className="text-gray-400 text-sm italic">otros...</div>
                  )}
                </td>

                {/* Cantidad(es) del lote */}
                <td className="px-6 py-4 text-center">
                  {lote.cortesias.slice(0, 3).map((c, index) => (
                    <div key={index}>
                      {typeof c.cantidad === "number"
                        ? c.cantidad.toFixed(2)
                        : c.cantidad}
                    </div>
                  ))}
                  {lote.cortesias.length > 3 && (
                    <div className="text-gray-400 text-sm italic">otros...</div>
                  )}
                </td>

                {/* Responsable(s) */}
                <td className="px-6 py-4 text-center">
                  {lote.cortesias.slice(0, 3).map((c, index) => (
                    <div key={index}>{c.responsable || "-"}</div>
                  ))}
                  {lote.cortesias.length > 3 && (
                    <div className="text-gray-400 text-sm italic">otros...</div>
                  )}
                </td>

                {/* Observación(es) */}
                <td className="px-6 py-4 text-center">
                  {lote.cortesias.slice(0, 3).map((c, index) => (
                    <div key={index}>{c.observacion || "-"}</div>
                  ))}
                  {lote.cortesias.length > 3 && (
                    <div className="text-gray-400 text-sm italic">otros...</div>
                  )}
                </td>

                <td className="px-6 py-4 flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      setSelectedCortesiaLote(lote);
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

      {/* Modal para editar lote de cortesías */}
      <ModalBig
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        component={
          selectedCortesiaLote ? (
            <CortesiasVariasFormPage
              closeModal={() => setIsModalOpen(false)}
              refreshPagina={refreshPagina}
              cortesia={selectedCortesiaLote}
              products={products}
            />
          ) : null
        }
      />

      {/* Modal de confirmación para eliminar lote */}
      <ModalConfirmacion
        isOpen={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onConfirm={confirmarEliminarLote}
        mensaje="¿Estás seguro de que deseas eliminar este lote de cortesías?"
      />
    </div>
  );
}

export default CortesiasList;
