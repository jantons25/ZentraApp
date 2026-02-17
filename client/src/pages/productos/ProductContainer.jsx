import { useEffect, useState } from "react";
import { useProduct } from "../../context/ProductContext";
import { useCompra } from "../../context/CompraContext";
import { useAuth } from "../../context/AuthContext";
import MaquetaHtml from "../../components/MaquetaHtml";
import OptAgregarProducto from "../../components/OptAgregarProducto.jsx";
import OptAgregarPromocionesProducto from "../../components/OptAgregarPromocionesProducto.jsx";
import OptVistaProducto from "../../components/OptVistaProducto.jsx";

function ProductsContainer() {
  const { getProducts, getAllProducts, products } = useProduct();
  const { getAllCompras, compras } = useCompra();
  const { user } = useAuth();

  const [vistaActiva, setVistaActiva] = useState("");
  const [botonAgregar, setBotonAgregar] = useState(false);
  const [botonFiltro, setBotonFiltro] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshPagina = async () => {
    try {
      if (user?.role === "admin") {
        await Promise.all([getAllProducts(), getAllCompras()]);
      } else {
        await getProducts();
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await refreshPagina();
      setLoading(false);
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
    <MaquetaHtml
      user={user}
      products={products}
      compras={compras}
      opt1={
        user?.role === "admin" ? (
          <OptAgregarProducto
            onClick={() => setVistaActiva("AgregarProducto")}
          />
        ) : null
      }
      opt2={
        <OptAgregarPromocionesProducto
          onClick={() => setVistaActiva("AgregarPromo")}
        />
      }
      opt3={
        <OptVistaProducto onClick={() => setVistaActiva("VistaProductos")} />
      }
      pagina="Productos"
      vistaActiva={vistaActiva}
      setVistaActiva={setVistaActiva}
      refreshPagina={refreshPagina}
      botonAgregar={botonAgregar}
      setBotonAgregar={setBotonAgregar}
      botonFiltro={botonFiltro}
      setBotonFiltro={setBotonFiltro}
    />
  );
}

export default ProductsContainer;
