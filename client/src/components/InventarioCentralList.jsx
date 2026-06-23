import { useState, useEffect } from "react";
import Tooltip from "./Tooltip.jsx";

function InventarioCentralList({ products, compras, ventas, user }) {
  if (products === undefined) {
    return <h1>No hay productos</h1>;
  }

  // ---------- ESTADO PARA FILTROS ----------
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredCompras, setFilteredCompras] = useState(compras || []);
  const [filteredVentas, setFilteredVentas] = useState(ventas || []);

  // Cuando cambien las compras/ventas desde el padre, actualizamos base
  useEffect(() => {
    setFilteredCompras(compras || []);
    setFilteredVentas(ventas || []);
  }, [compras, ventas]);

  // Helper para convertir Date -> "YYYY-MM-DD"
  const toInputDate = (date) => date.toISOString().slice(0, 10);

  // --------- BOTONES RÁPIDOS (solo rellenan fechas) ---------
  const setTodayRange = () => {
    const today = new Date();
    const value = toInputDate(today);
    setStartDate(value);
    setEndDate(value);
  };

  const setThisWeekRange = () => {
    const today = new Date();
    const day = today.getDay(); // 0=Dom, 1=Lun, ... 6=Sab
    const diffToMonday = day === 0 ? -6 : 1 - day; // Lunes inicio
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    setStartDate(toInputDate(monday));
    setEndDate(toInputDate(sunday));
  };

  const setThisMonthRange = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setStartDate(toInputDate(start));
    setEndDate(toInputDate(end));
  };

  const setThisYearRange = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 1);
    const end = new Date(today.getFullYear(), 11, 31);
    setStartDate(toInputDate(start));
    setEndDate(toInputDate(end));
  };

  // --------- APLICAR FILTROS (se ejecuta solo al dar clic en Filtrar) ---------
  const aplicarFiltros = () => {
    if (!startDate && !endDate) {
      setFilteredCompras(compras || []);
      setFilteredVentas(ventas || []);
      return;
    }

    const start = startDate || null;
    const end = endDate || null;

    const comprasFiltradas = (compras || []).filter((compra) => {
      if (!compra.createdAt) return false;
      const fechaStr = new Date(compra.createdAt).toISOString().slice(0, 10);
      if (start && fechaStr < start) return false;
      if (end && fechaStr > end) return false;
      return true;
    });

    const ventasFiltradas = (ventas || []).filter((venta) => {
      if (!venta.createdAt) return false;
      const fechaStr = new Date(venta.createdAt).toISOString().slice(0, 10);
      if (start && fechaStr < start) return false;
      if (end && fechaStr > end) return false;
      return true;
    });

    setFilteredCompras(comprasFiltradas);
    setFilteredVentas(ventasFiltradas);
  };

  // ---------- CÁLCULOS USANDO LOS ARRAYS FILTRADOS ----------
  const calcularPrecioPromedio = (productId) => {
    const comprasDelProducto = filteredCompras.filter(
      (compra) => compra.producto._id === productId
    );
    if (comprasDelProducto.length === 0) return 0;

    const sumaPrecios = comprasDelProducto.reduce(
      (total, compra) => total + compra.precio_compra,
      0
    );
    return (sumaPrecios / comprasDelProducto.length).toFixed(2);
  };

  const obtenerVentasDelProducto = (productId) => {
    return filteredVentas.filter((venta) => {
      if (!venta.producto) return false;

      if (typeof venta.producto === "object") {
        return venta.producto._id === productId;
      }

      return venta.producto === productId;
    });
  };

  const calcularImporteTotalCompras = (productId) => {
    const comprasDelProducto = filteredCompras.filter(
      (compra) => compra.producto._id === productId
    );
    if (comprasDelProducto.length === 0) return 0;

    const total = comprasDelProducto.reduce(
      (sum, compra) => sum + compra.importe_compra,
      0
    );
    return total.toFixed(2);
  };

  const calcularImporteTotalVentas = (productId) => {
    const ventasDelProducto = obtenerVentasDelProducto(productId);

    if (ventasDelProducto.length === 0) return 0;

    const total = ventasDelProducto.reduce((sum, venta) => {
      const importe =
        typeof venta.importe_venta === "number" && !isNaN(venta.importe_venta)
          ? venta.importe_venta
          : (venta.cantidad || 0) * (venta.precio_venta || 0);

      return sum + importe;
    }, 0);

    return total.toFixed(2);
  };

  const calcularMargenUnitarioReal = (productId) => {
    const ventasDelProducto = obtenerVentasDelProducto(productId);

    if (ventasDelProducto.length === 0) return "0.00";

    let totalCantidadVendida = 0;
    let totalImporteVenta = 0;
    let totalCostoReal = 0;

    ventasDelProducto.forEach((venta) => {
      const importeVenta =
        typeof venta.importe_venta === "number" && !isNaN(venta.importe_venta)
          ? venta.importe_venta
          : (venta.cantidad || 0) * (venta.precio_venta || 0);

      totalImporteVenta += importeVenta;
      totalCantidadVendida += venta.cantidad || 0;

      (venta.lotes_vendidos || []).forEach((lote) => {
        totalCostoReal += (lote.cantidad || 0) * (lote.precio_compra || 0);
      });
    });

    if (totalCantidadVendida === 0) return "0.00";

    const margenTotalReal = totalImporteVenta - totalCostoReal;
    const margenUnitarioReal = margenTotalReal / totalCantidadVendida;

    return margenUnitarioReal.toFixed(2);
  };

  const calcularMargenVentasReal = (productId) => {
    const ventasDelProducto = obtenerVentasDelProducto(productId);

    if (ventasDelProducto.length === 0) return "0";

    let totalImporteVenta = 0;
    let totalCostoReal = 0;

    ventasDelProducto.forEach((venta) => {
      const importeVenta =
        typeof venta.importe_venta === "number" && !isNaN(venta.importe_venta)
          ? venta.importe_venta
          : (venta.cantidad || 0) * (venta.precio_venta || 0);

      totalImporteVenta += importeVenta;

      (venta.lotes_vendidos || []).forEach((lote) => {
        totalCostoReal += (lote.cantidad || 0) * (lote.precio_compra || 0);
      });
    });

    const margenTotalReal = totalImporteVenta - totalCostoReal;

    if (totalCostoReal === 0) return "0";

    const margenPorcentaje = (margenTotalReal / totalCostoReal) * 100;
    return margenPorcentaje.toFixed(0);
  };

  const calcularMargenAcumuladoReal = (productId) => {
    const ventasDelProducto = obtenerVentasDelProducto(productId);

    if (ventasDelProducto.length === 0) return "0.00";

    let totalImporteVenta = 0;
    let totalCostoReal = 0;

    ventasDelProducto.forEach((venta) => {
      const importeVenta =
        typeof venta.importe_venta === "number" && !isNaN(venta.importe_venta)
          ? venta.importe_venta
          : (venta.cantidad || 0) * (venta.precio_venta || 0);

      totalImporteVenta += importeVenta;

      (venta.lotes_vendidos || []).forEach((lote) => {
        totalCostoReal += (lote.cantidad || 0) * (lote.precio_compra || 0);
      });
    });

    const margenTotalReal = totalImporteVenta - totalCostoReal;
    return margenTotalReal.toFixed(2);
  };

  // ---------- RENDER ----------
  return (
    <div className="bg-white p-4 w-full descripcion__container">
      <h1 className="text-2xl bold font-medium">Inventario Central</h1>
      <p className="p_final">
        En esta sección puedes revisar y controlar el inventario central de
        todos los productos a la fecha de consulta. Aquí verás los ingresos por
        compras, las salidas por reposición, el stock actual y los márgenes de
        compra y venta.
      </p>

      {/* ---------- FILTRO DE PERIODO ---------- */}
      <div className="mt-4 mb-4 p-3 bg-gray-50 border rounded-lg flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Desde
          </label>
          <input
            type="date"
            className="border rounded px-2 py-1 text-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Hasta
          </label>
          <input
            type="date"
            className="border rounded px-2 py-1 text-sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">
            Atajos de periodo
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={setTodayRange}
              className="text-xs border rounded px-2 py-1 hover:bg-gray-100"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={setThisWeekRange}
              className="text-xs border rounded px-2 py-1 hover:bg-gray-100"
            >
              Esta semana
            </button>
            <button
              type="button"
              onClick={setThisMonthRange}
              className="text-xs border rounded px-2 py-1 hover:bg-gray-100"
            >
              Este mes
            </button>
            <button
              type="button"
              onClick={setThisYearRange}
              className="text-xs border rounded px-2 py-1 hover:bg-gray-100"
            >
              Este año
            </button>
            <button
              type="button"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="text-xs border rounded px-2 py-1 hover:bg-gray-100"
            >
              Limpiar
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={aplicarFiltros}
          className="ml-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded"
        >
          Filtrar
        </button>
      </div>

      {/* ---------- TABLA CON SCROLL SOLO EN EL BODY ---------- */}
      <div className="mt-2 max-h-[60vh] overflow-y-auto border rounded-lg">
        <table className="w-full table-auto text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-center bg-gray-100">Producto</th>
              <th className="px-6 py-3 text-center bg-amber-100">
                <Tooltip text="Cantidad total de unidades que ingresaron al almacén por compras." />
                <br />
                <span>
                  Ingresos
                  <br />
                  (Compras)
                </span>
              </th>
              <th className="px-6 py-3 text-center bg-amber-100">
                <Tooltip text="Cantidad total de unidades que salieron de almacén hacia recepción." />
                <br />
                <span>
                  Salidas
                  <br />
                  (Reposición)
                </span>
              </th>
              <th className="px-6 py-3 text-center bg-amber-100">
                Stock Actual
              </th>
              <th className="px-6 py-3 text-center bg-gray-100">
                <Tooltip text="= Importe total de compras ÷ Unidades totales compradas del producto." />
                <br />
                <span>Px. Compra Pond.</span>
              </th>
              <th className="px-6 py-3 text-center bg-gray-100">
                <Tooltip text="El precio de venta puede ser visto por el recepcionista pero no editado." />
                <br />
                Precio Venta
              </th>
              <th className="px-6 py-3 text-center bg-emerald-200">
                <Tooltip text="= Sumatoria de todos los importes de compra del producto (Σ cantidad comprada × precio de compra)." />
                <br />
                Total Compras
              </th>
              <th className="px-6 py-3 text-center bg-emerald-200">
                <Tooltip text="= Sumatoria de todos los importes de venta del producto (Σ cantidad vendida × precio de venta)." />
                <br />
                Total Ventas
              </th>
              <th className="px-6 py-3 text-center bg-amber-100">
                <Tooltip text="= (Total ventas − Costo total) de los lotes vendidos ÷ Total de unidades vendidas." />
                <br />
                Margen Unitario
              </th>
              <th className="px-6 py-3 text-center bg-amber-100">
                <Tooltip text="= (Total ventas − Costo total) de los lotes vendidos o ganancia acumulada del producto." />
                <br />
                Margen Acumulado
              </th>
              <th className="px-6 py-3 text-center bg-amber-100">
                <Tooltip
                  text={`= (Margen acumulado ÷ total compras) de los lotes vendidos × 100.
Muestra el porcentaje que ganas por cada sol invertido en la compra de cada producto.`}
                />
                <br />
                Margen Ventas
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const precioPromedio = parseFloat(
                calcularPrecioPromedio(product._id)
              );
              const margenUnitario = calcularMargenUnitarioReal(product._id);

              return (
                <tr
                  key={product._id}
                  className="border-b hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-6 py-4 font-medium">{product.nombre}</td>
                  <td className="px-6 py-4 text-center">{product.ingresos}</td>
                  <td className="px-6 py-4 text-center">{product.salidas}</td>
                  <td className="px-6 py-4 text-center text-green-600 font-semibold">
                    {product.ingresos - product.salidas}
                  </td>
                  <td className="px-6 py-4 text-right">
                    S/{precioPromedio.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    S/ {product.precio_venta.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    S/ {calcularImporteTotalCompras(product._id)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    S/ {calcularImporteTotalVentas(product._id)}
                  </td>
                  <td className="px-6 py-4 text-right">S/ {margenUnitario}</td>
                  <td className="px-6 py-4 text-right">
                    S/ {calcularMargenAcumuladoReal(product._id)}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-blue-600">
                    {calcularMargenVentasReal(product._id)} %
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventarioCentralList;
