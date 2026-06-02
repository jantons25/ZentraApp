import { useEffect, useState } from "react";
import { useInventarioData } from "../hooks/useInventarioData.js";
import MaquetaHtml from "../components/MaquetaHtml.jsx";
import OptInventarioCentral from "../components/OptInventarioCentral.jsx";
import OptInventarioRecepcion from "../components/OptInventarioRecepcion.jsx.jsx";
import BtnVenta from "../components/BtnVenta.jsx";
import BtnReposicion from "../components/BtnReposicion.jsx";
import BtnCortesia from "../components/BtnCortesia.jsx";

function Inventario() {
  const [vistaActiva, setVistaActiva] = useState("");

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
    } = useInventarioData();

    const [loading, setLoading] = useState(true);

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
        ];
        if (user?.role === "admin" || user?.role === "superadmin") {
          tareas.push(getUsers());
        }
        await Promise.all(tareas);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

  const canAccess = (...rolesPermitidos) => {
    if (!user?.role) return false;
    return rolesPermitidos.includes(user.role);
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

  return (
    <div>
      <MaquetaHtml
        user={user}
        users={users}
        products={products}
        compras={compras}
        ventas={ventas}
        salidas={salidas}
        cortesias={cortesias}
        reposiciones={reposiciones}
        relevos={relevos}
        opt2={
          canAccess("admin", "superadmin") ? (
            <OptInventarioCentral onClick={() => setVistaActiva("Central")} />
          ) : null
        }
        opt3={
          canAccess("admin", "user", "superadmin", "recepcionista") ? (
            <OptInventarioRecepcion
              onClick={() => setVistaActiva("Recepcion")}
            />
          ) : null
        }
        pagina="Inventario"
        vistaActiva={vistaActiva}
        setVistaActiva={setVistaActiva}
        btn1={
          <BtnVenta
            onClick={() => setVistaActiva("BtnNuevaVenta")}
            vistaActiva={vistaActiva}
            setVistaActiva={setVistaActiva}
          />
        }
        btn2={
          <BtnReposicion
            onClick={() => setVistaActiva("BtnNuevaReposicion")}
            vistaActiva={vistaActiva}
            setVistaActiva={setVistaActiva}
          />
        }
        btn3={
          <BtnCortesia
            onClick={() => setVistaActiva("BtnNuevaCortesia")}
            vistaActiva={vistaActiva}
            setVistaActiva={setVistaActiva}
          />
        }
      />
    </div>
  );
}

export default Inventario;
