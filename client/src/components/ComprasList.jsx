import { useState } from "react";
import { useCompra } from "../context/CompraContext.jsx";
import ModalBig from "./ModalBig.jsx";
import CompraFormPage from "./CompraFormPage.jsx";
import ModalConfirmacion from "./ModalConfirmacion.jsx";
import ComprasVariasFormPage from "./ComprasVariasFormPage.jsx";

function ComprasList({ compras, closeModal, refreshPagina, products }) {
  const { deleteLoteCompras } = useCompra();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState(null);

  const [filtroProducto, setFiltroProducto] = useState("");

  // 🔹 Filtros de rango de fecha (igual que en VentasList)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loteAEliminar, setLoteAEliminar] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  if (!compras) return <h1>No hay compras</h1>;

  // Helper para inputs de fecha
  const toInputDate = (date) => date.toISOString().slice(0, 10);

  // Atajos de periodo
  const setTodayRange = () => {
    const today = new Date();
    const value = toInputDate(today);
    setStartDate(value);
    setEndDate(value);
  };

  const setThisWeekRange = () => {
    const today = new Date();
    const day = today.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab
    const diffToMonday = day === 0 ? -6 : 1 - day; // Lunes como inicio
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

  // 🔹 ¿la fecha de la compra está dentro del rango?
  const fechaEnRango = (createdAt) => {
    if (!startDate && !endDate) return true; // sin filtro de rango
    if (!createdAt) return false;

    const fechaStr = new Date(createdAt).toISOString().slice(0, 10); // "YYYY-MM-DD"

    if (startDate && fechaStr < startDate) return false;
    if (endDate && fechaStr > endDate) return false;

    return true;
  };

  const agruparComprasPorLote = (compras) => {
    const lotes = {};
    compras.forEach((compra) => {
      const idLote = compra.id_lote ?? "sin-lote";
      if (!lotes[idLote]) lotes[idLote] = [];
      lotes[idLote].push(compra);
    }); 
    return Object.entries(lotes)
      .map(([id_lote, compras]) => ({
        id_lote,
        compras,
        createdAt: compras[0]?.createdAt || null,
        user: compras[0]?.user.name || "Sin usuario"
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const lotesOrdenados = agruparComprasPorLote(compras);

  const lotesFiltrados = lotesOrdenados.filter((lote) =>
    lote.compras.some((compra) => {
      const productoMatch = compra.producto?.nombre
        ?.toLowerCase()
        .includes(filtroProducto.toLowerCase());

      const fechaMatch = fechaEnRango(compra.createdAt);

      return productoMatch && fechaMatch;
    })
  );

  const confirmarEliminarLote = async () => {
    try {
      await deleteLoteCompras(loteAEliminar);
      refreshPagina();
    } catch (error) {
      console.error("Error eliminando lote:", error);
    } finally {
      setMostrarModal(false);
      setLoteAEliminar(null);
    }
  };

  return (
    <div className="bg-white p-4 w-full descripcion__container">
      <h1 className="text-2xl bold font-medium">Lista de Compras</h1>
      <p className="p_final">
        En esta sección puedes revisar y gestionar todas las compras registradas
        en el sistema. Usa los filtros por fecha y producto para encontrar
        rápidamente lo que necesitas y, si requieres hacer cambios, utiliza los
        botones de Editar o Eliminar en cada registro.
      </p>

      {/* 🔹 BLOQUE DE FILTRO DE PERIODO */}
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

      {/* 🔹 TABLA CON SCROLL Y HEAD STICKY */}
      <div className="mt-3 max-h-[60vh] overflow-y-auto border rounded-lg">
        <table className="w-full table-auto text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-center bg-gray-100">Fecha</th>
              <th className="px-6 py-3 text-center bg-gray-100">Usuario</th>
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
                Precio Compra
              </th>
              <th className="px-6 py-3 text-center bg-gray-100">
                Importe Total
              </th>
              <th className="px-6 py-3 text-center bg-gray-100">
                Fecha Vencimiento
              </th>
              <th className="px-6 py-3 text-center bg-gray-100">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {lotesFiltrados.map((lote) => (
              <tr key={lote.id_lote} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-center">
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

                <td className="px-6 py-4 text-center">
                  {lote.user}
                </td>

                <td className="px-6 py-4 text-center">
                  {lote.compras.slice(0, 3).map((c, i) => (
                    <div key={i}>{c.producto?.nombre || "-"}</div>
                  ))}
                  {lote.compras.length > 3 && (
                    <div className="text-gray-400 text-sm italic">otros...</div>
                  )}
                </td>

                <td className="px-6 py-4 text-center">
                  {lote.compras.slice(0, 3).map((c, i) => (
                    <div key={i}>{c.cantidad}</div>
                  ))}
                  {lote.compras.length > 3 && (
                    <div className="text-gray-400 text-sm italic">otros...</div>
                  )}
                </td>

                <td className="px-6 py-4 text-center">
                  {lote.compras.slice(0, 3).map((c, i) => (
                    <div key={i}>S/{c.precio_compra.toFixed(2)}</div>
                  ))}
                  {lote.compras.length > 3 && (
                    <div className="text-gray-400 text-sm italic">otros...</div>
                  )}
                </td>

                <td className="px-6 py-4 text-center">
                  S/
                  {lote.compras
                    .reduce(
                      (acc, c) => acc + parseFloat(c.importe_compra || 0),
                      0
                    )
                    .toFixed(2)}
                </td>

                <td className="px-6 py-4 text-center">
                  {lote.compras.slice(0, 3).map((c, i) => (
                    <div key={i}>
                      {c.fecha_vencimiento
                        ? new Date(c.fecha_vencimiento).toLocaleDateString(
                            "es-PE",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )
                        : "-"}
                    </div>
                  ))}
                  {lote.compras.length > 3 && (
                    <div className="text-gray-400 text-sm italic">otros...</div>
                  )}
                </td>

                <td className="px-6 py-4 flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      setSelectedCompra(lote);
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

      {/* Modales */}
      <ModalBig
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        compra={selectedCompra}
        products={products}
        component={
          selectedCompra ? (
            <ComprasVariasFormPage
              closeModal={() => setIsModalOpen(false)}
              refreshPagina={refreshPagina}
              compra={selectedCompra}
              products={products}
            />
          ) : null
        }
      />

      <ModalConfirmacion
        isOpen={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onConfirm={confirmarEliminarLote}
        mensaje="¿Estás seguro de que deseas eliminar este lote de compras?"
      />
    </div>
  );
}

export default ComprasList;
