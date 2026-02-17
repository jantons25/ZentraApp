import { useEffect, useState } from "react";
import { useInventarioData } from "../../hooks/useInventarioData.js";
import MaquetaHtml from "../../components/MaquetaHtml.jsx";
import OptAgregarReserva from "../../components/OptAgregarReserva.jsx";
import OptListaReservas from "../../components/OptListaReservas.jsx";
import OptListaClientes from "../../components/OptListaClientes.jsx";
import OptListaEspacios from "../../components/OtpListaEspacios.jsx";

function ReservasPage() {
  const {
    user,
    users,
    getUsers,
    reservas,
    getReservas,
    clientes,
    getClientes,
    detalleReservas,
    espacios,
    getEspacios,
  } = useInventarioData();
  const [vistaActiva, setVistaActiva] = useState("");
  const [botonAgregar, setBotonAgregar] = useState(false);
  const [botonFiltro, setBotonFiltro] = useState(false);
  const [loading, setLoading] = useState(true);

  const canAccess = (...rolesPermitidos) => {
    if (!user?.role) return false;
    return rolesPermitidos.includes(user.role);
  };
  const refreshPagina = async () => {
    try {
      await Promise.all([
        getReservas(),
        getClientes(),
        getEspacios(),
        getUsers(),
      ]);
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
        users={users}
        pagina="Reservas"
        vistaActiva={vistaActiva}
        setVistaActiva={setVistaActiva}
        reservas={reservas}
        espacios={espacios}
        clientes={clientes}
        detalleReservas={detalleReservas}
        opt1={
          canAccess("admin", "recepcionista", "superadmin") ? (
            <OptAgregarReserva onClick={() => setBotonAgregar(true)} />
          ) : null
        }
        opt2={
          canAccess("recepcionista", "superadmin") ? (
            <OptListaReservas onClick={() => setVistaActiva("Reservas")} />
          ) : null
        }
        opt3={
          canAccess("admin", "superadmin") ? (
            <OptListaEspacios onClick={() => setVistaActiva("Espacios")} />
          ) : null
        }
        opt4={
          canAccess("admin", "superadmin") ? (
            <OptListaClientes onClick={() => setVistaActiva("Clientes")} />
          ) : null
        }
        refreshPagina={refreshPagina}
        botonAgregar={botonAgregar}
        setBotonAgregar={setBotonAgregar}
        botonFiltro={botonFiltro}
        setBotonFiltro={setBotonFiltro}
      />
    </div>
  );
}

export default ReservasPage;
