import { useState } from "react";
import { useEspacio } from "../context/EspacioContext.jsx";
import ModalBig from "./ModalBig.jsx";
import EspacioFormPage from "./EspacioFormPage.jsx";

function EspaciosList({ espacios, refreshPagina }) {
  const { deleteEspacio } = useEspacio();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEspacio, setSelectedEspacio] = useState(null);
  const [filtroNombre, setFiltroNombre] = useState("");

  if (!espacios || espacios.length === 0) {
    return <h1 className="text-center text-gray-600">No hay espacios</h1>;
  }

  const espaciosOrdenados = [...espacios].sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  );

  const espaciosFiltrados = espaciosOrdenados.filter((espacio) => {
    const nombreMatch = espacio.nombre
      .toLowerCase()
      .includes(filtroNombre.toLowerCase());
    return nombreMatch;
  });

  const estadoColors = {
    disponible: "bg-green-500",
    mantenimiento: "bg-yellow-500",
    reservado: "bg-orange-500",
    no_disponible: "bg-red-500",
    inactivo: "bg-slate-500",
  };

  return (
    <div className="bg-white p-4 w-full descripcion__container">
      <h1 className="text-2xl bold font-medium">Lista de Espacios</h1>
      <p className="p_final">
        Gestiona el inventario de tus salas y Habitaciones. Configura capacidades,
        servicios incluidos y equipamiento disponible para asegurar que cada
        ambiente esté listo para su uso.
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
              <th className="px-6 py-2 text-center bg-amber-100">Piso</th>
              <th className="px-6 py-2 text-center bg-amber-100">Tipo</th>
              <th className="px-6 py-2 text-center bg-emerald-200">
                Capacidad N° Personas
              </th>
              <th className="px-6 py-2 text-center bg-emerald-200">Px Hora</th>
              <th className="px-6 py-2 text-center bg-emerald-200">
                Habilitado
              </th>
              <th className="px-6 py-2 text-center bg-emerald-200">Estado</th>
              <th className="px-6 py-2 text-center bg-emerald-200">
                Descripción
              </th>
              <th className="px-6 py-2 text-center bg-emerald-200">
                Servicios
              </th>
              <th className="px-6 py-2 text-center bg-emerald-200">
                Equipamiento
              </th>
              <th className="px-6 py-2 text-center bg-gray-100">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {espaciosFiltrados.map((espacio) => (
              <tr
                key={espacio._id}
                className="border-b hover:bg-gray-50 transition duration-150"
              >
                <td className="px-6 py-4 font-medium text-center">
                  {espacio.nombre}
                </td>
                <td className="px-6 py-4 font-medium text-center">
                  {espacio.piso}
                </td>
                <td className="px-6 py-4 font-medium text-center">
                  {espacio.tipo}
                </td>
                <td className="px-6 py-4 font-medium text-center">
                  {espacio.capacidad}
                </td>
                <td className="px-6 py-4 font-medium text-center">
                  S/{parseFloat(espacio.precio_por_hora).toFixed(2)}
                </td>
                <td className="px-6 py-4 font-medium text-center">
                  {espacio.habilitado_reservas}
                </td>
                <td className="px-6 py-4 font-medium text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        estadoColors[espacio.estado] || "bg-gray-500"
                      }`}
                    ></div>
                    <span className="font-medium">
                      {espacio.estado?.charAt(0).toUpperCase() +
                        espacio.estado?.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-center">
                  {espacio.descripcion}
                </td>
                <td className="px-6 py-4 font-medium text-center">
                  {espacio.servicios && espacio.servicios.length > 0 ? (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {espacio.servicios.map((servicio, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {servicio}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-sm">-</span>
                  )}
                </td>
                <td className="px-6 py-4 font-medium text-center">
                  {espacio.equipamiento && espacio.equipamiento.length > 0 ? (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {espacio.equipamiento.map((equipamiento, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {equipamiento}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-sm">-</span>
                  )}
                </td>
                <td className="px-6 py-4 flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      setSelectedEspacio(espacio);
                      setIsModalOpen(true);
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteEspacio(espacio._id)}
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
        cliente={selectedEspacio}
        component={
          selectedEspacio ? (
            <EspacioFormPage
              closeModal={() => setIsModalOpen(false)}
              refreshPagina={refreshPagina}
              espacio={selectedEspacio}
            />
          ) : null
        }
      />
    </div>
  );
}

export default EspaciosList;
