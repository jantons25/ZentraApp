import { useEffect, useState } from "react";
import { useCompra } from "../../context/CompraContext.jsx";
import { useProduct } from "../../context/ProductContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import MaquetaHtml from "../../components/MaquetaHtml.jsx";
import OptAgregarCompra from "../../components/OptAgregarCompra.jsx";

function ComprasContainer() {
  const {
    getAllCompras,
    compras,
    deleteLoteCompras, // nuevo hook disponible
  } = useCompra();

  const { user } = useAuth();
  const { getAllProducts, products } = useProduct();

  const [vistaActiva, setVistaActiva] = useState("");
  const [idLoteSeleccionado, setIdLoteSeleccionado] = useState(null); // si deseas habilitar acciones por lote
  const [loading, setLoading] = useState(true);

  const refreshPagina = async () => {
    try {
      await Promise.all([getAllCompras(), getAllProducts()]);
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

  const handleEliminarLote = async () => {
    if (idLoteSeleccionado) {
      try {
        await deleteLoteCompras(idLoteSeleccionado);
        await refreshPagina();
        setIdLoteSeleccionado(null);
      } catch (error) {
        console.error("Error al eliminar lote de compras:", error);
      }
    }
  };

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
        compras={compras}
        products={products}
        opt1={
          <OptAgregarCompra onClick={() => setVistaActiva("AgregarCompra")} />
        }
        pagina="Compras"
        vistaActiva={vistaActiva}
        setVistaActiva={setVistaActiva}
        refreshPagina={refreshPagina}
        idLoteSeleccionado={idLoteSeleccionado}
        setIdLoteSeleccionado={setIdLoteSeleccionado}
        handleEliminarLote={handleEliminarLote}
      />
    </div>
  );
}

export default ComprasContainer;
