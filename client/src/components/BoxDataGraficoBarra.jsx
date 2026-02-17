import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "../css/boxDataGraficoBarra.css";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
);

// Función para procesar los datos de productos vendidos por mes
function procesarProductosPorMes(ventas) {
  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const productosPorMes = new Array(12).fill(0); // Inicializar en 0 para cada mes

  ventas.forEach((venta) => {
    const fecha = new Date(venta.createdAt);
    const mes = fecha.getMonth(); // 0 (Enero) a 11 (Diciembre)
    productosPorMes[mes] += venta.cantidad || 0; // Sumar cantidad de productos
  });

  const mesesConProductos = productosPorMes
    .map((cantidad, index) => ({ mes: meses[index], cantidad }))
    .filter((entry) => entry.cantidad > 0);

  const labels = mesesConProductos.map((entry) => entry.mes);
  const datos = mesesConProductos.map((entry) => entry.cantidad);
  const maxProductos = Math.max(...datos);

  return { labels, datos, maxProductos };
}

function BoxDataGraficoBarra({ ventas }) {
  const { labels, datos, maxProductos } = procesarProductosPorMes(ventas);

  const data = {
    labels,
    datasets: [
      {
        label: "Productos Vendidos",
        data: datos,
        borderColor: "#b9bc31",
        backgroundColor: "#b9bc31",
        fill: false,
        tension: 0.4,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#b9bc31",
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: maxProductos,
        max: maxProductos,
        ticks: { stepSize: Math.ceil(maxProductos / 4) },
      },
    },
  };

  return (
    <div className="ventas-mensuales-card">
      <h4>Productos Vendidos por Mes</h4>
      <Line data={data} options={options} />
    </div>
  );
}

export default BoxDataGraficoBarra;
