import {
  TIPO_DOT,
  ESTADO_BADGE,
  formatearFechaNovedad,
} from "./novedadesUI.js";

function NovedadesTarjetas({ novedades, puedeGestionar, onEditar, onEliminar }) {
  if (!novedades.length) {
    return (
      <div className="bg-white p-6 w-full text-gray-500 text-center">
        No hay novedades registradas
      </div>
    );
  }

  return (
    <div className="bg-white p-4 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {novedades.map((novedad) => (
          <div
            key={novedad._id}
            className="border-2 border-[#ddd] rounded-[10px] p-4 flex flex-col gap-2 text-left hover:shadow-md transition duration-150"
          >
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                {formatearFechaNovedad(novedad.fechaRegistro)}
              </p>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  ESTADO_BADGE[novedad.estado] || "bg-gray-100 text-gray-700"
                }`}
              >
                {novedad.estado}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  TIPO_DOT[novedad.tipo] || "bg-gray-400"
                }`}
              ></span>
              <h3 className="font-bold text-gray-800 truncate">
                {novedad.titulo}
              </h3>
            </div>

            <p className="text-sm text-gray-600 line-clamp-3">
              {novedad.descripcion}
            </p>

            <div className="mt-auto pt-2 border-t border-[#eee] flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-400">Registrado por:</p>
                <p className="text-sm font-medium text-gray-700">
                  {novedad.usuario?.name || novedad.usuario?.username || "—"}
                </p>
              </div>
              {puedeGestionar(novedad) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditar(novedad)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onEliminar(novedad)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NovedadesTarjetas;
