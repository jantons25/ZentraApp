import VentaIcon from "../assets/carro.png";
import OperacionesIcon from "../assets/configuraciones.png";
import InventarioIcon from "../assets/lista.png";
import SalirIcon from "../assets/cerrar-sesion.png";
import AdminIcon from "../assets/gerente.png";
import LogoIcon from "../assets/logo-zentra.jpg";
import ReservaIcon from "../assets/reserva.png";
import "../css/sidebarMenu.css";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState } from "react";
import ModalConfirmacion from "./ModalConfirmacion.jsx";

function MenuLateral({ user, pagina }) {
  const { logout } = useAuth();
  const [mostrarModalLogout, setMostrarModalLogout] = useState(false);
  const [sede, setSede] = useState("Zentra Hotel");

  const handleConfirmLogout = () => {
    logout();
    setMostrarModalLogout(false);
  };

  useEffect(() => {
    if (user?.sede.includes("Plaza")) {
      setSede("Zentra Plaza");
    } else if (user?.sede.includes("Balta")) {
      setSede("Zentra Balta");
    } else if (user?.sede.includes("SanJose")) {
      setSede("Zentra San José");
    }
  }, [user?.sede]);

  const getItemClass = (nombrePagina) =>
    `sidebar__item ${pagina === nombrePagina ? "sidebar__item--active" : ""}`;

  return (
    <aside className="sidebar">
      <ul className="sidebar__list">
        <Link to="/" className="sidebar__item">
          <img src={LogoIcon} alt="" className="sidebar__logo" />
          <div className="sidebar__hide">
            <p className="sidebar__text font-bold">{sede}</p>
          </div>
        </Link>
        <Link to="/inventario" className={getItemClass("Inventario")}>
          <img src={InventarioIcon} alt="" className="sidebar__icon" />
          <div className="sidebar__hide">
            <p className="sidebar__text">Inventario</p>
          </div>
        </Link>
        <Link to="/ventas" className={getItemClass("Ventas")}>
          <img src={VentaIcon} alt="" className="sidebar__icon" />
          <div className="sidebar__hide">
            <p className="sidebar__text">Recepción</p>
          </div>
        </Link>
        <Link to="/operaciones" className={getItemClass("Operaciones")}>
          <img src={OperacionesIcon} alt="" className="sidebar__icon" />
          <div className="sidebar__hide">
            <p className="sidebar__text">Operaciones</p>
          </div>
        </Link>
        {/* <Link to="/reservas" className={getItemClass("Reservas")}>
          <img src={ReservaIcon} alt="" className="sidebar__icon" />
          <div className="sidebar__hide">
            <p className="sidebar__text">Reservas</p>
          </div>
        </Link> */}
        {(user?.role === "admin" || user?.role === "superadmin") && (
          <Link
            to="/administracion"
            className={getItemClass("Administracion")}
          >
            <img src={AdminIcon} alt="" className="sidebar__icon" />
            <div className="sidebar__hide">
              <p className="sidebar__text">Adminis.</p>
            </div>
          </Link>
        )}

        <button
          type="button"
          onClick={() => setMostrarModalLogout(true)}
          className="sidebar__item"
        >
          <img src={SalirIcon} alt="" className="sidebar__icon" />
          <div className="sidebar__hide">
            <p className="sidebar__text">Salir</p>
          </div>
        </button>
        <li className="sidebar__item sidebar__item__user">
          <div className="sidebar__icon sidebar__icon__user">
            <p>{user?.name?.charAt(0)}</p>
          </div>
          <div className="sidebar__hide">
            <h3 className="sidebar__title font-bold">{user?.name}</h3>
            <p className="sidebar__info text-x"> {user?.role}</p>
          </div>
        </li>
      </ul>
      <ModalConfirmacion
        isOpen={mostrarModalLogout}
        onClose={() => setMostrarModalLogout(false)}
        onConfirm={handleConfirmLogout}
        mensaje="¿Estás seguro de que deseas cerrar sesión?"
        confimacion="Cerrar sesión"
      />
    </aside>
  );
}

export default MenuLateral;
