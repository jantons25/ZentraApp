import {
  TIPO_DOT,
  ESTADO_BADGE,
  formatearFechaNovedad,
} from "./novedadesUI.js";

function NovedadesList({ novedades, puedeGestionar, onEditar, onEliminar }) {
  if (!novedades.length) {
    return (
      <div className="bg-white p-6 w-full text-gray-500 text-center">
        No hay novedades registradas
      </div>
    );
  }

  return (
    <div className="bg-white p-4 w-full">
      <table className="w-full table-auto text-sm text-left text-gray-700">
        <thead className="bg-gray-100 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-6 py-3">Fecha</th>
            <th className="px-6 py-3">Título</th>
            <th className="px-6 py-3">Usuario</th>
            <th className="px-6 py-3">Tipo</th>
            <th className="px-6 py-3">Estado</th>
            <th className="px-6 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {novedades.map((novedad) => (
            <tr
              key={novedad._id}
              className="border-b hover:bg-gray-50 transition duration-150"
            >
              <td className="px-6 py-4">
                {formatearFechaNovedad(novedad.fechaRegistro)}
              </td>
              <td className="px-6 py-4 font-medium">{novedad.titulo}</td>
              <td className="px-6 py-4">
                {novedad.usuario?.name || novedad.usuario?.username || "—"}
              </td>
              <td className="px-6 py-4">
                <span className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      TIPO_DOT[novedad.tipo] || "bg-gray-400"
                    }`}
                  ></span>
                  {novedad.tipo}
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    ESTADO_BADGE[novedad.estado] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {novedad.estado}
                </span>
              </td>
              <td className="px-6 py-4 flex gap-2">
                {puedeGestionar(novedad) && (
                  <>
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
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default NovedadesList;
