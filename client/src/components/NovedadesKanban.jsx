import { useState } from "react";
import { useNovedad } from "../context/NovedadContext.jsx";
import { ESTADOS_NOVEDAD } from "../validations/novedadSchema.js";
import {
  TIPO_DOT,
  formatearFechaNovedad,
} from "./novedadesUI.js";

const COLOR_COLUMNA = {
  Pendiente: "border-t-red-500",
  "En proceso": "border-t-yellow-500",
  Finalizada: "border-t-green-500",
};

function NovedadesKanban({ novedades, puedeGestionar, onEditar, onEliminar }) {
  const { actualizarNovedad } = useNovedad();
  const [idArrastrando, setIdArrastrando] = useState(null);
  const [columnaDestino, setColumnaDestino] = useState(null);

  const handleDrop = async (estado) => {
    const id = idArrastrando;
    setIdArrastrando(null);
    setColumnaDestino(null);
    if (!id) return;

    const novedad = novedades.find((n) => n._id === id);
    if (!novedad || novedad.estado === estado) return;

    await actualizarNovedad(novedad._id, { estado });
  };

  return (
    <div className="bg-white p-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {ESTADOS_NOVEDAD.map((estado) => {
          const items = novedades.filter((n) => n.estado === estado);
          return (
            <div
              key={estado}
              onDragOver={(e) => {
                e.preventDefault();
                setColumnaDestino(estado);
              }}
              onDragLeave={() => setColumnaDestino(null)}
              onDrop={() => handleDrop(estado)}
              className={`bg-gray-50 rounded-[10px] border-2 border-t-4 p-3 min-h-[300px] transition duration-150 ${
                COLOR_COLUMNA[estado] || "border-t-gray-400"
              } ${
                columnaDestino === estado && idArrastrando
                  ? "border-[#b9bc31] bg-gray-100"
                  : "border-[#ddd]"
              }`}
            >
              <div className="flex justify-between items-center pb-2 border-b border-[#ddd] mb-3">
                <h3 className="font-bold text-gray-700 text-sm uppercase">
                  {estado}
                </h3>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                  {items.length}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {items.map((novedad) => (
                  <div
                    key={novedad._id}
                    draggable={puedeGestionar(novedad)}
                    onDragStart={() => setIdArrastrando(novedad._id)}
                    onDragEnd={() => {
                      setIdArrastrando(null);
                      setColumnaDestino(null);
                    }}
                    className={`bg-white border-2 border-[#ddd] rounded-[10px] p-3 text-left ${
                      puedeGestionar(novedad)
                        ? "cursor-grab active:cursor-grabbing"
                        : ""
                    } ${
                      idArrastrando === novedad._id ? "opacity-50" : ""
                    }`}
                  >
                    <p className="text-xs text-gray-500">
                      {formatearFechaNovedad(novedad.fechaRegistro)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          TIPO_DOT[novedad.tipo] || "bg-gray-400"
                        }`}
                      ></span>
                      <h4 className="font-bold text-sm text-gray-800 truncate">
                        {novedad.titulo}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                      {novedad.descripcion}
                    </p>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#eee]">
                      <p className="text-xs text-gray-400 truncate">
                        {novedad.usuario?.name ||
                          novedad.usuario?.username ||
                          "—"}
                      </p>
                      {puedeGestionar(novedad) && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => onEditar(novedad)}
                            className="bg-blue-500 text-white px-2 py-0.5 rounded hover:bg-blue-600 text-xs cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => onEliminar(novedad)}
                            className="bg-red-500 text-white px-2 py-0.5 rounded hover:bg-red-600 text-xs cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {!items.length && (
                  <p className="text-xs text-gray-400 text-center py-4">
                    Sin novedades
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NovedadesKanban;
