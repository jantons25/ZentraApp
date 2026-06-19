import "../css/recepcionData.css";
import BoxDataCircular from "./BoxDataCircular.jsx";
import BoxDatos from "./BoxDatos.jsx";
import BoxDataGraficoBarra from "./BoxDataGraficoBarra.jsx";
import BoxTopProductos from "./BoxTopProductos.jsx";
import BoxTopStock from "./BoxTopStock.jsx";
import BoxTopSinStock from "./BoxTopSinStock.jsx";
import Dashboard from "../pages/Dashboard.jsx";

function RecepcionData({
  ventas,
  compras,
  productos,
  reposiciones,
  cortesias,
}) {
  const filtroBoxDatos = "hoy";
  return (
    <div className="recepcion-data">
      <div className="container max-w-full">
        <div>
          <Dashboard />
        </div>
      </div>
    </div>
  );
}

export default RecepcionData;
