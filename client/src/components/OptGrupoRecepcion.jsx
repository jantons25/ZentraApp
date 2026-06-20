import CarroIcon from "../assets/cuadricula.png";

function OptGrupoRecepcion({ onClick }) {
  return (
    <li className="menu__flotante__item" onClick={onClick}>
      <img src={CarroIcon} alt="" className="menu__flotante__icon" />
      <div className="menu__flotante__hide">
        <p className="menu__flotante__text">Recepción</p>
      </div>
    </li>
  );
}

export default OptGrupoRecepcion;
