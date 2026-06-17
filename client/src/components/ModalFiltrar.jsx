import React, { useState } from "react";
import "../css/modalFiltrar.css"; 

function ModalFiltrar({ onFilter, onReset, closeModal, refreshPagina, products }) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [producto, setProducto] = useState("Todos");
  const [cantidad, setCantidad] = useState("Todos");
  const [oficina, setOficina] = useState("Todas");

  const aplicarFiltros = () => {
    onFilter({
      fechaInicio,
      fechaFin,
      producto,
      cantidad,
      oficina,
    });
  };

  const resetearFiltros = () => {
    setFechaInicio("");
    setFechaFin("");
    setProducto("Todos");
    setCantidad("Todos");
    setOficina("Todas");
    onReset();
  };

  return (
    <div className="filtro-container">
      <h2>Filtrar Ventas</h2>

      <label>Fecha</label>
      <div className="filtro-fechas">
        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
      </div>

      <label>Producto</label>
      <select
          className=""
        >
          <option value="">Selecciona un producto</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.nombre}
            </option>
          ))}
        </select>

      <label>Cantidad</label>
      <input type="number" />

      <label>Habitaciones</label>
      <select value={oficina} onChange={(e) => setOficina(e.target.value)}>
        <option>Todas</option>
        <option>Chiclayo</option>
        <option>Lima</option>
      </select>

      <div className="filtro-botones">
        <button className="btn-restablecer" onClick={resetearFiltros}>
          Restablecer
        </button>
        <button className="btn-filtrar" onClick={aplicarFiltros}>
          Aplicar filtros
        </button>
      </div>
    </div>
  );
}

export default ModalFiltrar;
