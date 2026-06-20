import GerenteIcon from "../assets/cuadricula.png";

function OptGrupoAdministracion({ onClick }) {
  return (
    <li className="menu__flotante__item" onClick={onClick}>
      <img src={GerenteIcon} alt="" className="menu__flotante__icon" />
      <div className="menu__flotante__hide">
        <p className="menu__flotante__text">Administración</p>
      </div>
    </li>
  );
}

export default OptGrupoAdministracion;
