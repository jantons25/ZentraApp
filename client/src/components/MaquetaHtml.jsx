import "../css/maquetaHtml.css";
import MenuLateral from "../components/MenuLateral";
import MenuFlotante from "./MenuFlotante";
import ContenidoPage from "./ContenidoPage";

function MaquetaHtml({
  user,
  users,
  products,
  compras,
  ventas,
  cortesias,
  reposiciones,
  relevos,
  salidas,
  opt0,
  opt1,
  opt2,
  opt3,
  opt4,
  opt5,
  opt6,
  opt7,
  opt8,
  pagina,
  vistaActiva,
  setVistaActiva,
  refreshPagina,
  btn1,
  btn2,
  btn3,
  botonAgregar,
  setBotonAgregar,
  botonFiltro,
  setBotonFiltro,
  signup,
  reservas,
  espacios,
  clientes,
  detalleReservas,
  veladas
}) {
  return (
    <div className="w-full h-screen flex flex-row">
      <div className="bloque__a">
        <MenuLateral user={user} pagina={pagina}/>
      </div>
      <div className="bloque__b">
        <MenuFlotante 
          user={user} 
          opt0={opt0}
          opt1={opt1} 
          opt2={opt2} 
          opt3={opt3}
          opt4={opt4}
          opt5={opt5}
          opt6={opt6}
          opt7={opt7}
          opt8={opt8}
          pagina={pagina}
          vistaActiva={vistaActiva}
          btn1={btn1}
          btn2={btn2}
          btn3={btn3}
        />
        <ContenidoPage
          user={user}
          users={users}
          products={products}
          compras={compras}
          ventas={ventas}
          cortesias={cortesias}
          reposiciones={reposiciones}
          relevos={relevos}
          salidas={salidas}
          pagina={pagina}
          vistaActiva={vistaActiva}
          setVistaActiva={setVistaActiva}
          refreshPagina={refreshPagina}
          botonAgregar={botonAgregar}
          setBotonAgregar={setBotonAgregar}
          botonFiltro={botonFiltro}
          setBotonFiltro={setBotonFiltro}
          signup={signup}
          reservas={reservas}
          espacios={espacios}
          clientes={clientes}
          veladas={veladas}
          detalleReservas={detalleReservas}
        />
      </div>
    </div>
  );
}

export default MaquetaHtml;
