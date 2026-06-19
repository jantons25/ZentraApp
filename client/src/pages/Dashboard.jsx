// pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  FaShoppingCart,
  FaBoxOpen,
  FaTruckLoading,
  FaRedo,
  FaChartLine,
  FaCalendarAlt,
} from "react-icons/fa";
import { MdAttachMoney, MdInventory } from "react-icons/md";
import DashboardCard from "../components/DashboardCard";
import { useVenta } from "../context/VentaContext";
import { useCompra } from "../context/CompraContext";
import { useSalida } from "../context/SalidaContext";
import { useReposicion } from "../context/ReposicionContext";
import { useCortesia } from "../context/CortesiaContext";

const Dashboard = () => {
  const { ventas } = useVenta();
  const { compras } = useCompra();
  const { salidas } = useSalida();
  const { reposiciones } = useReposicion();
  const { cortesias } = useCortesia();

  const [stats, setStats] = useState({
    ventasHoy: { total: 0, cantidad: 0 },
    comprasHoy: { total: 0, cantidad: 0 },
    salidasHoy: { total: 0, cantidad: 0 },
    reposicionesHoy: { total: 0, cantidad: 0 },
    cortesiasHoy: { total: 0, cantidad: 0 },
  });

  // Función para filtrar registros del día actual
  // Usa getFullYear/getMonth/getDate (hora local del navegador) en lugar de
  // toISOString() (UTC) para evitar el desfase de UTC-5 que desplazaba
  // los registros nocturnos al día siguiente.
  const filtrarHoy = (registros) => {
    const hoy = new Date();
    return registros.filter((registro) => {
      const fechaRegistro = new Date(registro.createdAt);
      return (
        fechaRegistro.getFullYear() === hoy.getFullYear() &&
        fechaRegistro.getMonth()    === hoy.getMonth()    &&
        fechaRegistro.getDate()     === hoy.getDate()
      );
    });
  };

  // Calcular estadísticas del día
  useEffect(() => {
    // Ventas del día
    const ventasHoy = filtrarHoy(ventas);
    const totalVentas = ventasHoy.reduce(
      (sum, venta) => sum + (venta.importe_venta || 0),
      0,
    );

    // Compras del día
    const comprasHoy = filtrarHoy(compras);
    const totalCompras = comprasHoy.reduce(
      (sum, compra) => sum + (compra.importe_compra || 0),
      0,
    );

    // Salidas del día
    const salidasHoy = filtrarHoy(salidas);
    const totalSalidas = salidasHoy.reduce(
      (sum, salida) => sum + (salida.cantidad || 0),
      0,
    );

    // Reposiciones del día
    const reposicionesHoy = filtrarHoy(reposiciones);
    const totalReposiciones = reposicionesHoy.reduce(
      (sum, reposicion) => sum + (reposicion.cantidad || 0),
      0,
    );

    // Cortesías del día
    const cortesiasHoy = filtrarHoy(cortesias);
    const totalCortesias = cortesiasHoy.reduce(
      (sum, cortesia) => sum + (cortesia.cantidad || 0),
      0,
    );

    setStats({
      ventasHoy: {
        total: totalVentas,
        cantidad: ventasHoy.length,
      },
      comprasHoy: {
        total: totalCompras,
        cantidad: comprasHoy.length,
      },
      salidasHoy: {
        total: totalSalidas,
        cantidad: salidasHoy.length,
      },
      reposicionesHoy: {
        total: totalReposiciones,
        cantidad: reposicionesHoy.length,
      },
      cortesiasHoy: {
        total: totalCortesias,
        cantidad: cortesiasHoy.length,
      },
    });
  }, [ventas, compras, salidas, reposiciones, cortesias]);

  // Calcular total de ingresos netos (ventas - compras)
  const ingresosNetos = stats.ventasHoy.total - stats.comprasHoy.total;

  // Tarjetas del dashboard
  const cards = [
    {
      title: "Ventas",
      value: `S/${stats.ventasHoy.total.toFixed(2)}`,
      subtitle: `${stats.ventasHoy.cantidad} transacciones`,
      icon: FaShoppingCart,
      color: "green",
    },
    // {
    //   title: "Compras",
    //   value: `S/${stats.comprasHoy.total.toFixed(2)}`,
    //   subtitle: `${stats.comprasHoy.cantidad} productos`,
    //   icon: FaBoxOpen,
    //   color: "orange",
    // },
    // {
    //   title: "Ingresos Netos",
    //   value: `S/${ingresosNetos.toFixed(2)}`,
    //   subtitle: ingresosNetos >= 0 ? "Ganancia del día" : "Pérdida del día",
    //   icon: MdAttachMoney,
    //   color: ingresosNetos >= 0 ? "green" : "red",
    // },
    {
      title: "Salidas a Recepción",
      value: `${stats.salidasHoy.total} unid.`,
      subtitle: `${stats.salidasHoy.cantidad} registros`,
      icon: FaTruckLoading,
      color: "blue",
    },
    {
      title: "Reposiciones",
      value: `${stats.reposicionesHoy.total} unid.`,
      subtitle: `${stats.reposicionesHoy.cantidad} habitaciones`,
      icon: FaRedo,
      color: "purple",
    },
    {
      title: "Cortesías",
      value: `${stats.cortesiasHoy.total} unid.`,
      subtitle: `${stats.cortesiasHoy.cantidad} registros`,
      icon: MdInventory,
      color: "yellow",
    },
  ];

  // Calcular resumen general
  const totalMovimientos =
    stats.ventasHoy.cantidad +
    stats.comprasHoy.cantidad +
    stats.salidasHoy.cantidad +
    stats.reposicionesHoy.cantidad +
    stats.cortesiasHoy.cantidad;

  return (
    <div className="p-6 bg-gray-50">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Hotel</h1>
        <div className="flex items-center gap-2 mt-2">
          <FaCalendarAlt className="text-gray-400" />
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#b9bc31] p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col min-h-[160px]">
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm font-medium text-white">Items Vendidos Hoy</p>
            <div className="p-2.5 rounded-full bg-blue-50 text-blue-500 flex-shrink-0 ml-3 border border-blue-100">
              <FaChartLine className="h-4 w-4" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white tracking-tight leading-none">
            {totalMovimientos}
          </p>
          <p className="text-xs text-white mt-auto pt-4">Movimientos totales del día</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col min-h-[160px]">
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm font-medium text-gray-500">Ingresos Brutos</p>
            <div className="p-2.5 rounded-full bg-green-50 text-green-500 flex-shrink-0 ml-3 border border-green-100">
              <MdAttachMoney className="h-4 w-4" />
            </div>
          </div>
          <p className="text-4xl font-bold text-green-600 tracking-tight leading-none">
            S/{stats.ventasHoy.total.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-auto pt-4">Ventas registradas hoy</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col min-h-[160px]">
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm font-medium text-gray-500">Salidas a Recepción</p>
            <div className="p-2.5 rounded-full bg-blue-50 text-blue-500 flex-shrink-0 ml-3 border border-blue-100">
              <FaTruckLoading className="h-4 w-4" />
            </div>
          </div>
          <p className="text-4xl font-bold text-blue-600 tracking-tight leading-none">
            {stats.salidasHoy.total +
              stats.reposicionesHoy.total +
              stats.cortesiasHoy.total}
          </p>
          <p className="text-xs text-gray-400 mt-auto pt-4">Unidades enviadas hoy</p>
        </div>
      </div>

      {/* Grid de tarjetas principales */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Estadísticas del Día
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <DashboardCard
              key={index}
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              icon={card.icon}
              color={card.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
