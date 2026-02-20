import { useEffect, useState } from "react";
import { useInventarioData } from "../../hooks/useInventarioData.js";
import MaquetaHtml from "../../components/MaquetaHtml.jsx";
import OptAgregarVenta from "../../components/OptAgregarVenta.jsx";
import OptListaVentas from "../../components/OptListaVentas.jsx";
import OptListaSalidas from "../../components/OptListaSalidas.jsx";
import OptListaCortesia from "../../components/OptListaCortesia.jsx";
import OptListaCompras from "../../components/OptListaCompras.jsx";
import OptListaData from "../../components/OptListaData.jsx";
import OptListaProductos from "../../components/OptListaProductos.jsx";
import OptListaReposiciones from "../../components/OptListaReposiciones.jsx";
import OptListaVeladas from "../../components/OptListaProductVeladas.jsx";

function VentasPage() {
  const {
    user,
    users,
    getUsers,
    empresa,
    ventas,
    getAllVentas,
    products,
    getAllProducts,
    cortesias,
    getCortesias,
    reposiciones,
    getReposiciones,
    salidas,
    getAllSalidas,
    relevos,
    getAllRelevos,
    compras,
    getAllCompras,
    veladas,
    getVeladas
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
        getAllVentas(),
        getAllProducts(),
        getCortesias(),
        getUsers(),
        getAllRelevos(),
        getAllCompras(),
        getAllSalidas(),
        getReposiciones(),
        getVeladas()
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
        products={products}
        ventas={ventas}
        compras={compras}
        salidas={salidas}
        cortesias={cortesias}
        reposiciones={reposiciones}
        relevos={relevos}
        veladas={veladas}
        opt1={
          canAccess("admin", "recepcionista", "superadmin") ? (
            <OptAgregarVenta onClick={() => setBotonAgregar(true)} />
          ) : null
        }
        opt2={
          canAccess("recepcionista", "superadmin", "admin") ? (
            <OptListaVentas onClick={() => setVistaActiva("Ventas")} />
          ) : null
        }
        opt3={
          canAccess("admin", "superadmin") ? (
            <OptListaCompras onClick={() => setVistaActiva("Compras")} />
          ) : null
        }
        opt4={
          canAccess("admin", "superadmin") ? (
            <OptListaSalidas onClick={() => setVistaActiva("Salidas")} />
          ) : null
        }
        opt5={
          canAccess("recepcionista", "superadmin", "admin") ? (
            <OptListaReposiciones
              onClick={() => setVistaActiva("Reposiciones")}
            />
          ) : null
        }
        opt6={
          canAccess("recepcionista", "superadmin", "admin") ? (
            <OptListaCortesia onClick={() => setVistaActiva("Cortesias")} />
          ) : null
        }
        opt7={
          canAccess("recepcionista", "superadmin", "admin") ? (
            <OptListaVeladas onClick={() => setVistaActiva("Veladas")} />
          ) : null
        }
        opt8={
          canAccess("admin", "superadmin") ? (
            <OptListaProductos onClick={() => setVistaActiva("Productos")} />
          ) : null
        }
        pagina="Ventas"
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

export default VentasPage;
