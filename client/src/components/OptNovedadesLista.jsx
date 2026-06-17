import MenuIcon from "../assets/lista.png";

function OptNovedadesLista({ onClick }) {
  return (
    <li className="menu__flotante__item" onClick={onClick}>
      <img src={MenuIcon} alt="" className="menu__flotante__icon" />
      <div className="menu__flotante__hide">
        <p className="menu__flotante__text">Lista</p>
      </div>
    </li>
  );
}

export default OptNovedadesLista;
