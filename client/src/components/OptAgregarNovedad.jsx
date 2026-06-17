import MenuIcon from "../assets/anadir.png";

function OptAgregarNovedad({ onClick }) {
  return (
    <li className="menu__agregar__item" onClick={onClick}>
      <img src={MenuIcon} alt="" className="menu__agregar__icon" />
      <div className="menu__agregar__hide">
        <p className="menu__agregar__text">Agregar</p>
      </div>
    </li>
  );
}

export default OptAgregarNovedad;
