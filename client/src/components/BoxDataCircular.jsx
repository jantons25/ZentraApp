import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "../css/boxDataCircular.css";

ChartJS.register(ArcElement, Tooltip, Legend);

function BoxDataCircular({ ventas, compras }) {
  const totalVentas = Array.isArray(ventas)
    ? ventas.reduce((total, venta) => {
        const cantidad_total = venta.cantidad || 1;
        return total + cantidad_total;
      }, 0)
    : 0;

  const totalCompras = Array.isArray(compras)
    ? compras.reduce((total, compra) => {
        const cantidad_total = compra.cantidad || 1;
        return total + cantidad_total;
      }, 0)
    : 0;

  const data = {
    datasets: [
      {
        data: [
          ((totalVentas / totalCompras) * 100).toFixed(2),
          100 - ((totalVentas / totalCompras) * 100).toFixed(2),
        ],
        backgroundColor: ["#b9bc31", "#e0e0e0"],
        borderWidth: 0,
        cutout: "70%", // grosor del anillo
      },
    ],
  };

  return (
    <div className="card-doughnut">
      <div className="text-content">
        <h4>Productos vendidos</h4>
        <h2>{totalVentas}</h2>
        <p>De un total de {totalCompras}</p>
      </div>
      <div className="chart-container">
        <Doughnut data={data} options={{ cutout: "70%" }} />
        <div className="centered-text">
          {((totalVentas / totalCompras) * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
}

export default BoxDataCircular;
