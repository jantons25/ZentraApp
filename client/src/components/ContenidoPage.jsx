import "../css/contenidoPage.css";
import ComprasList from "./ComprasList.jsx";
import ProductsList from "./ProductsList.jsx";
import SalidasList from "./SalidasList.jsx";
import InventarioCentralList from "./InventarioCentralList.jsx";
import InventarioRecepcionList from "./InventarioRecepcionList.jsx";
import UsersList from "./UsersList.jsx";
import VentasSection from "./VentasSection.jsx";
import ReservasSection from "./ReservasSection.jsx";
import ModalBigVarios from "./ModalBigVarios.jsx";
import { useState, useEffect } from "react";
import { modalRegistry } from "../components/modales/modalRegistry.js";
import ReposicionList from "./ReposicionList.jsx";

function ContenidoPage({
  user,
  users,
  products,
  compras,
  ventas,
  reposiciones,
  salidas,
  cortesias,
  pagina,
  vistaActiva,
  setVistaActiva,
  refreshPagina,
  botonAgregar,
  setBotonAgregar,
  botonFiltro,
  setBotonFiltro,
  reservas,
  clientes,
  detalleReservas,
  espacios,
  veladas
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const VISTAS = {
    Ventas: ["Ventas", "Relevos"],
    Compras: ["Compras", "AgregarCompra"],
    Salidas: ["Salidas", "AgregarSalida"],
    Reposiciones: ["Reposiciones"],
    Cortesias: ["Cortesias"],
    Veladas: ["Veladas"],
    Productos: ["Productos", "AgregarProducto", "AgregarPromo"],
    Data: ["Recepcion"],
    Administracion: ["Administracion", "AgregarUsuario"],
    Reservas: ["Reservas", "AgregarReserva", "ListaClientes", "ListaEspacios"],
    Clientes: ["Clientes", "AgregarCliente"],
    Espacios: ["Espacios", "AgregarEspacio"],
  };
  const getSeccionFromVista = (v) => {
    for (const [seccion, vistas] of Object.entries(VISTAS)) {
      if (vistas.includes(v)) return seccion;
    }
    return "Ventas"; // fallback
  };
  const BASE_VISTA = {
    Ventas: "Ventas",
    Compras: "Compras",
    Salidas: "Salidas",
    Reposiciones: "Reposiciones",
    Cortesias: "Cortesias",
    Veladas: "Veladas",
    Productos: "Productos",
    Data: "Recepcion",
    Administracion: "Administracion",
    Reservas: "Reservas",
    Clientes: "Clientes",
    Espacios: "Espacios"
  };
  useEffect(() => {
    const seccion = getSeccionFromVista(vistaActiva);

    const isSamePage = pagina === seccion; // página coincide con la sección
    const isSubvista = vistaActiva !== (BASE_VISTA[seccion] ?? "Ventas"); // no es la base
    const hasModal = Boolean(modalRegistry[vistaActiva]); // hay componente en el registry

    // 👉 Abrir modal automáticamente si estoy en subvista válida de la página actual
    if (isSamePage && isSubvista && hasModal) {
      setIsModalOpen(true);
    }

    // Botón Agregar: abre modal solo si la vista actual pertenece a esa sección
    if (botonAgregar && VISTAS[seccion].includes(vistaActiva)) {
      setIsModalOpen(true);
    }

    // Botón Filtro: decide en qué vistas aplica (ejemplo)
    const vistasConFiltro = {
      Ventas: ["Ventas"],
      Compras: ["Compras"],
      Salidas: ["Salidas"],
      Reposiciones: ["Reposiciones"],
      Cortesias: ["Cortesias"],
      Veladas: ["Veladas"],
      Productos: ["Productos"],
      Data: ["Recepcion"],
      Administracion: ["Administracion"],
      Reservas: ["Reservas"],
      Clientes: ["Clientes"],
      Espacios: ["Espacios"]
    };
    if (botonFiltro && (vistasConFiltro[seccion] ?? []).includes(vistaActiva)) {
      setIsModalOpen(true);
    }

    if (botonAgregar) setBotonAgregar(false);
    if (botonFiltro) setBotonFiltro(false);
  }, [vistaActiva, botonAgregar, botonFiltro, pagina]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    const seccion = getSeccionFromVista(vistaActiva);
    setVistaActiva(BASE_VISTA[seccion] ?? "Ventas");
  };

  const getModalComponent = () => {
    const modal = modalRegistry[vistaActiva];
    if (!modal) return null;

    const Component = modal.component;
    const props = modal.props({
      closeModal: handleCloseModal,
      refreshPagina,
      products,
      ventas,
      compras,
      salidas,
      cortesias,
      veladas,
      reposiciones,
      user,
      reservas,
      clientes,
      detalleReservas,
      espacios,
    });

    return <Component {...props} />;
  };

  return (
    <div className="cp__container">
      {pagina === "Inventario" && (
        <>
          {vistaActiva === "Central" ? (
            <InventarioCentralList
              products={products}
              compras={compras}
              ventas={ventas}
            />
          ) : vistaActiva === "Recepcion" ? (
            <InventarioRecepcionList
              products={products}
              compras={compras}
              ventas={ventas}
              user={user}
            />
          ) : user?.role === "admin" ? (
            <InventarioCentralList
              products={products}
              compras={compras}
              ventas={ventas}
            />
          ) : (
            <InventarioRecepcionList
              products={products}
              compras={compras}
              ventas={ventas}
              user={user}
            />
          )}
        </>
      )}

      {pagina === "Productos" && (
        <ProductsList
          compras={compras}
          products={products}
          closeModal={handleCloseModal}
          refreshPagina={refreshPagina}
        />
      )}

      {pagina === "Compras" && (
        <ComprasList
          compras={compras}
          products={products}
          closeModal={handleCloseModal}
          refreshPagina={refreshPagina}
        />
      )}

      {pagina === "Ventas" && (
        <VentasSection
          vistaActiva={vistaActiva}
          user={user}
          ventas={ventas}
          compras={compras}
          salidas={salidas}
          cortesias={cortesias}
          veladas={veladas}
          reposiciones={reposiciones}
          products={products}
          closeModal={handleCloseModal}
          refreshPagina={refreshPagina}
        />
      )}

      {pagina === "Reservas" && (
        <ReservasSection
          vistaActiva={vistaActiva}
          user={user}
          reservas={reservas}
          clientes={clientes}
          detalleReservas={detalleReservas}
          espacios={espacios}
          closeModal={handleCloseModal}
          refreshPagina={refreshPagina}
        />
      )}

      {pagina === "Salidas" && (
        <SalidasList
          salidas={salidas}
          products={products}
          closeModal={handleCloseModal}
          refreshPagina={refreshPagina}
        />
      )}
      {pagina === "Reposiciones" && (
        <ReposicionList
          reposiciones={reposiciones}
          products={products}
          closeModal={handleCloseModal}
          refreshPagina={refreshPagina}
        />
      )}
      {pagina === "Administracion" && (
        <UsersList
          users={users}
          closeModal={handleCloseModal}
          refreshPagina={refreshPagina}
        />
      )}
      <ModalBigVarios
        isOpen={isModalOpen}
        closeModal={handleCloseModal}
        component={getModalComponent()}
        vistaActiva={vistaActiva}
      />
    </div>
  );
}

export default ContenidoPage;
