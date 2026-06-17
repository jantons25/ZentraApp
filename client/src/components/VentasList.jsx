import { useState } from "react";
import { useVenta } from "../context/VentaContext.jsx";
import RecepcionData from "./RecepcionData.jsx";
import ModalBigVarios from "./ModalBigVarios.jsx";
import VentasVariasFormPage from "./VentasVariasFormPage.jsx";
import ModalConfirmacion from "./ModalConfirmacion.jsx";

function VentasList({
  ventas,
  products,
  refreshPagina,
  vistaActiva,
  compras,
  reposiciones,
  cortesias,
  veladas
}) {
  const { deleteLoteVentas } = useVenta();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [filtroProducto, setFiltroProducto] = useState("");
  const [filtroOficina, setFiltroOficina] = useState("");

  // filtros de rango de fecha
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loteAEliminar, setLoteAEliminar] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const confirmarEliminarLote = async () => {
    try {
      await deleteLoteVentas(loteAEliminar); // Este es el id_lote
      refreshPagina();
    } catch (error) {
      console.error("Error eliminando lote:", error);
    } finally {
      setMostrarModal(false);
      setLoteAEliminar(null);
    }
  };

  // Helper para inputs de fecha
  const toInputDate = (date) => date.toISOString().slice(0, 10);

  // Atajos de periodo (mismo criterio que en InventarioCentral)
  const setTodayRange = () => {
    const today = new Date();
    const value = toInputDate(today);
    setStartDate(value);
    setEndDate(value);
  };

  const setThisWeekRange = () => {
    const today = new Date();
    const day = today.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab
    const diffToMonday = day === 0 ? -6 : 1 - day; // Lunes inicio
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

  // ¿la fecha de la venta está dentro del rango?
  const fechaEnRango = (createdAt) => {
    if (!startDate && !endDate) return true; // sin filtro de rango
    if (!createdAt) return false;

    const fechaStr = new Date(createdAt).toISOString().slice(0, 10); // "YYYY-MM-DD"

    if (startDate && fechaStr < startDate) return false;
    if (endDate && fechaStr > endDate) return false;

    return true;
  };

  function agruparYOrdenarVentasPorLote(ventas) {
    const lotes = {};

    // 1. Agrupar ventas por id_lote
    ventas.forEach((venta) => {
      const idLote = venta.id_lote ?? "sin-lote";
      if (!lotes[idLote]) {
        lotes[idLote] = [];
      }
      lotes[idLote].push(venta);
    });

    // 2. Convertir a array y ordenar por fecha del primer item (más reciente primero)
    const lotesArray = Object.entries(lotes)
      .map(([id_lote, ventas]) => ({
        id_lote,
        ventas,
        createdAt: ventas[0]?.createdAt || null,
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return lotesArray;
  }

  const lotesOrdenados = agruparYOrdenarVentasPorLote(ventas);

  const lotesFiltrados = lotesOrdenados.filter((lote) => {
    return lote.ventas.some((venta) => {
      const productoId =
        typeof venta.producto === "string"
          ? venta.producto
          : venta.producto?._id;

      const productoObj = products.find((p) => p._id === productoId);
      const nombreProducto = productoObj?.nombre || "";

      const productoMatch = nombreProducto
        .toLowerCase()
        .includes(filtroProducto.toLowerCase());

      const oficinaMatch = (venta.habitacion || "")
        .toLowerCase()
        .includes(filtroOficina.toLowerCase());

      const fechaMatch = fechaEnRango(venta.createdAt);

      return productoMatch && oficinaMatch && fechaMatch;
    });
  });

  if (vistaActiva === "DataVentas") {
    return (
      <>
        <RecepcionData
          ventas={ventas}
          compras={compras}
          productos={products}
          reposiciones={reposiciones}
          cortesias={cortesias}
        />
      </>
    );
  }

  return (
    <div className=" bg-white p-4 w-full descripcion__container">
      <h1 className="text-2xl bold font-medium">Lista de Ventas</h1>
      <p className="p_final">
        En esta sección puedes revisar y gestionar todas las ventas registradas
        en el sistema. Usa los filtros por fecha, producto u habitación para
        encontrar rápidamente lo que necesitas y, si requieres hacer cambios,
        utiliza los botones de Editar o Eliminar en cada registro. Así podrás
        mantener tu histórico de ventas siempre ordenado y actualizado.
      </p>

      {/* ---- BLOQUE DE FILTRO DE PERIODO (ANTES DE LA TABLA) ---- */}
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

      {/* ---- TABLA CON HEADER FIJO ---- */}
      <div className="mt-3 max-h-[60vh] overflow-y-auto border rounded-lg">
        <table className="w-full table-auto text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-center bg-gray-100">Fecha</th>
              <th className="px-6 py-3 text-center bg-gray-100">
                Producto
                <input
                  type="text"
                  placeholder="Buscar producto"
                  value={filtroProducto}
                  onChange={(e) => setFiltroProducto(e.target.value)}
                  className="mt-1 w-full text-center text-black border rounded px-2 py-1"
                />
              </th>
              <th className="px-6 py-3 text-center bg-gray-100">Cantidad</th>
              <th className="px-6 py-3 text-center bg-gray-100">
                Importe Venta
              </th>
              <th className="px-6 py-3 text-center bg-gray-100">
                Pago Registrado
              </th>
              <th className="px-6 py-3 text-center bg-gray-100">
                Habitación
                <input
                  type="text"
                  placeholder="Buscar habitación"
                  value={filtroOficina}
                  onChange={(e) => setFiltroOficina(e.target.value)}
                  className="mt-1 w-full text-center text-black border rounded px-2 py-1"
                />
              </th>
              <th className="px-6 py-3 text-center bg-gray-100">Acciones</th>
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
                <td className="px-6 py-4 font-medium">
                  {lote.ventas.slice(0, 3).map((venta, index) => {
                    const productId =
                      typeof venta.producto === "string"
                        ? venta.producto
                        : venta.producto?._id;
                    const producto = products.find((p) => p._id === productId);
                    return (
                      <div key={index}>{producto?.nombre || "Desconocido"}</div>
                    );
                  })}
                  {lote.ventas.length > 3 && (
                    <div className="text-gray-400 text-sm italic">otros...</div>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {lote.ventas.slice(0, 3).map((venta, index) => (
                    <div key={index}>{venta.cantidad}</div>
                  ))}
                  {lote.ventas.length > 3 && (
                    <div className="text-gray-400 text-sm italic">otros...</div>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="mt-1">
                    S/
                    {lote.ventas
                      .reduce(
                        (acc, venta) =>
                          acc + parseFloat(venta.importe_venta || 0),
                        0,
                      )
                      .toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {(() => {
                    const valoresUnicos = [
                      ...new Set(
                        lote.ventas.map((v) =>
                          v.pago_registrado
                            ? v.pago_registrado.toLowerCase()
                            : "",
                        ),
                      ),
                    ].filter(Boolean);

                    if (valoresUnicos.length === 1) {
                      return (
                        <div className="capitalize">{valoresUnicos[0]}</div>
                      );
                    }

                    return (
                      <>
                        {valoresUnicos.slice(0, 3).map((valor, i) => (
                          <div key={i} className="capitalize">
                            {valor}
                          </div>
                        ))}
                        {valoresUnicos.length > 3 && (
                          <div className="text-gray-400 text-sm italic">
                            otros...
                          </div>
                        )}
                      </>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 text-center">
                  {lote.ventas.slice(0, 3).map((venta, index) => (
                    <div key={index}>{venta.habitacion || "-"}</div>
                  ))}
                  {lote.ventas.length > 3 && (
                    <div className="text-gray-400 text-sm italic">otros...</div>
                  )}
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedVenta(lote);
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

      <ModalBigVarios
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        component={
          selectedVenta ? (
            <VentasVariasFormPage
              closeModal={() => setIsModalOpen(false)}
              refreshPagina={refreshPagina}
              venta={selectedVenta}
              products={products}
            />
          ) : null
        }
        vistaActiva={vistaActiva}
      />
      <ModalConfirmacion
        isOpen={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onConfirm={confirmarEliminarLote}
        mensaje="¿Estás seguro de que deseas eliminar este lote de ventas?"
      />
    </div>
  );
}

export default VentasList;
