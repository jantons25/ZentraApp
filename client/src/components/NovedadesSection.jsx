import { useState } from "react";
import { useNovedad } from "../context/NovedadContext.jsx";
import ModalBig from "./ModalBig.jsx";
import ModalConfirmacion from "./ModalConfirmacion.jsx";
import NovedadesFormPage from "./NovedadesFormPage.jsx";
import NovedadesTarjetas from "./NovedadesTarjetas.jsx";
import NovedadesList from "./NovedadesList.jsx";
import NovedadesKanban from "./NovedadesKanban.jsx";

// Pestañas de vista reubicadas debajo del título (mismo mecanismo de navegación)
const VISTAS_TABS = [
  { id: "Novedades", label: "Tarjetas" },
  { id: "Novedades Lista", label: "Lista" },
  { id: "Novedades Kanban", label: "Kanban" },
];

function NovedadesSection({
  vistaActiva,
  setVistaActiva,
  user,
  novedades,
  refreshPagina,
}) {
  const { eliminarNovedad } = useNovedad();
  const [novedadSeleccionada, setNovedadSeleccionada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novedadAEliminar, setNovedadAEliminar] = useState(null);

  // Solo el creador o un administrador pueden editar/eliminar (misma regla que el backend)
  const puedeGestionar = (novedad) => {
    if (!user) return false;
    if (["admin", "superadmin"].includes(user.role)) return true;
    const creadorId = novedad.usuario?._id || novedad.usuario;
    return creadorId === user.id;
  };

  const abrirEdicion = (novedad) => {
    setNovedadSeleccionada(novedad);
    setIsModalOpen(true);
  };

  const cerrarEdicion = () => {
    setIsModalOpen(false);
    setNovedadSeleccionada(null);
  };

  const confirmarEliminacion = async () => {
    if (novedadAEliminar) {
      await eliminarNovedad(novedadAEliminar._id);
      setNovedadAEliminar(null);
    }
  };

  const propsVista = {
    novedades: novedades || [],
    puedeGestionar,
    onEditar: abrirEdicion,
    onEliminar: setNovedadAEliminar,
  };

  return (
    <>
      <div className="bg-white px-4 pt-4 w-full flex flex-wrap gap-2">
        {VISTAS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setVistaActiva(tab.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition border ${
              vistaActiva === tab.id
                ? "bg-[#b9bc31] text-white border-[#b9bc31]"
                : "bg-white text-gray-600 border-gray-300 hover:border-[#b9bc31]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {vistaActiva === "Novedades Lista" ? (
        <NovedadesList {...propsVista} />
      ) : vistaActiva === "Novedades Kanban" ? (
        <NovedadesKanban {...propsVista} />
      ) : (
        <NovedadesTarjetas {...propsVista} />
      )}
      <ModalBig
        isOpen={isModalOpen}
        closeModal={cerrarEdicion}
        vistaActiva="ActualizarNovedad"
        component={
          novedadSeleccionada ? (
            <NovedadesFormPage
              closeModal={cerrarEdicion}
              refreshPagina={refreshPagina}
              novedad={novedadSeleccionada}
            />
          ) : null
        }
      />
      <ModalConfirmacion
        isOpen={Boolean(novedadAEliminar)}
        onClose={() => setNovedadAEliminar(null)}
        onConfirm={confirmarEliminacion}
        mensaje="¿Estás seguro de que deseas eliminar esta novedad?"
        confimacion="Eliminar"
      />
    </>
  );
}

export default NovedadesSection;
