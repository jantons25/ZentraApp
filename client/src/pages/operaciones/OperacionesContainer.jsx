import { useEffect, useState } from "react";
import { useNovedad } from "../../context/NovedadContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import MaquetaHtml from "../../components/MaquetaHtml.jsx";
import OptAgregarNovedad from "../../components/OptAgregarNovedad.jsx";
import OptNovedadesTarjetas from "../../components/OptNovedadesTarjetas.jsx";

function OperacionesContainer() {
  const { user } = useAuth();
  const { novedades, obtenerNovedades } = useNovedad();

  const [vistaActiva, setVistaActiva] = useState("Novedades");
  const [botonAgregar, setBotonAgregar] = useState(false);
  const [botonFiltro, setBotonFiltro] = useState(false);
  const [loading, setLoading] = useState(true);

  const canAccess = (...rolesPermitidos) => {
    if (!user?.role) return false;
    return rolesPermitidos.includes(user.role);
  };

  const refreshPagina = async () => {
    try {
      await obtenerNovedades();
    } catch (error) {
      console.error("Error al cargar los datos:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await refreshPagina();
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#b9bc31]"></div>
      </div>
    );

  return (
    <div>
      <MaquetaHtml
        user={user}
        novedades={novedades}
        opt1={
          canAccess("recepcionista", "admin", "superadmin") ? (
            <OptAgregarNovedad onClick={() => setBotonAgregar(true)} />
          ) : null
        }
        opt2={
          <OptNovedadesTarjetas onClick={() => setVistaActiva("Novedades")} />
        }
        pagina="Operaciones"
        vistaActiva={vistaActiva}
        setVistaActiva={setVistaActiva}
        refreshPagina={refreshPagina}
        botonAgregar={botonAgregar}
        setBotonAgregar={setBotonAgregar}
        botonFiltro={botonFiltro}
        setBotonFiltro={setBotonFiltro}
      />
    </div>
  );
}

export default OperacionesContainer;
