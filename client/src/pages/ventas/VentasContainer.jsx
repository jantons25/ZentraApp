import { useEffect, useState } from "react";
import { useInventarioData } from "../../hooks/useInventarioData.js";
import MaquetaHtml from "../../components/MaquetaHtml.jsx";
import OptAgregar from "../../components/OptAgregar.jsx";
import OptListaData from "../../components/OptListaData.jsx";
import OptListaProductos from "../../components/OptListaProductos.jsx";
import OptGrupoRecepcion from "../../components/OptGrupoRecepcion.jsx";
import OptGrupoAdministracion from "../../components/OptGrupoAdministracion.jsx";

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
    getVeladas,
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
      const tareas = [
        getAllVentas(),
        getAllProducts(),
        getCortesias(),
        getAllRelevos(),
        getAllCompras(),
        getAllSalidas(),
        getReposiciones(),
        getVeladas(),
      ];
      if (user?.role === "admin" || user?.role === "superadmin") {
        tareas.push(getUsers());
      }
      await Promise.all(tareas);
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

  useEffect(() => {
    if (user?.role === "recepcionista" && vistaActiva === "") {
      setVistaActiva("Ventas");
    }
    if (
      (user?.role === "admin" || user?.role === "superadmin") &&
      vistaActiva === ""
    ) {
      setVistaActiva("DataVentas");
    }
  }, [user?.role]);

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
          canAccess("admin", "recepcionista", "superadmin") &&
          [
            "Ventas",
            "Compras",
            "Salidas",
            "Reposiciones",
            "Cortesias",
            "Veladas",
            "Productos",
          ].includes(vistaActiva) ? (
            <OptAgregar onClick={() => setBotonAgregar(true)} />
          ) : null
        }
        opt2={
          canAccess("recepcionista", "superadmin", "admin") ? (
            <OptGrupoRecepcion onClick={() => setVistaActiva("Ventas")} />
          ) : null
        }
        opt3={
          canAccess("admin", "superadmin") ? (
            <OptGrupoAdministracion onClick={() => setVistaActiva("Compras")} />
          ) : null
        }
        opt8={
          canAccess("admin", "superadmin") ? (
            <OptListaProductos onClick={() => setVistaActiva("Productos")} />
          ) : null
        }
        opt9={
          canAccess("admin", "superadmin", "recepcionista") ? (
            <OptListaData onClick={() => setVistaActiva("DataVentas")} />
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
