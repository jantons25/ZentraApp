import "../css/menuFlotante.css";
import "../css/optAgregar.css";
import "../css/btnVistas.css";

function MenuFlotante({
  user,
  opt0,
  opt1,
  opt2,
  opt3,
  opt4,
  opt5,
  opt6,
  opt7,
  opt8,
  opt9,
  pagina,
  vistaActiva,
  btn1,
  btn2,
  btn3,
}) {
  return (
    <div className="menu__flotante__container flex flex-row">
      <aside className="menu__flotante__header">
        <div className="menu__flotante__header__title flex align-center">
          <h1 className="font-bold text-2xl text-center">
            {vistaActiva !== null && vistaActiva !== undefined
              ? vistaActiva === ""
                ? pagina === "Ventas"
                  ? "Recepción"
                  : pagina === "Administracion"
                  ? "Administración"
                  : pagina === "Inventario"
                  ? "Inventario "
                  : ""
                : vistaActiva
              : ""}
          </h1>
        </div>
      </aside>
      <div className="menu__flotante__body flex flex-row gap-3">
        {opt2 || opt3 || opt4 || opt5 || opt6 || opt7 || opt8 || opt9 ? (
          <aside className="menu__flotante flex justify-between">
            <ul className="menu__flotante__list">
              {opt2}
              {opt3}
              {opt4}
              {opt5}
              {opt6}
              {opt7}
              {opt8}
              {opt9}
            </ul>
          </aside>
        ) : null}
        {opt1 ? (
          <aside className="menu__flotante flex justify-between">
            <ul className="menu__flotante__list">{opt1}</ul>
          </aside>
        ) : null}
        {opt0 ? (
          <aside className="menu__flotante flex justify-between">
            <ul className="menu__flotante__list">{opt0}</ul>
          </aside>
        ) : null}
      </div>
    </div>
  );
}

export default MenuFlotante;
