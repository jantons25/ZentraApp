import "../css/modalBigVarios.css";
import { IoClose } from "react-icons/io5";

function ModalBigVarios({ isOpen, closeModal, component, vistaActiva }) {
  if (!isOpen) return null;
  return (
    <div className="modalBig">
      <div className="container">
        <div className="header">
          <h2>
            {vistaActiva === "AgregarUsuario"
              ? "Nuevo Usuario"
              : vistaActiva === "ActualizarUsuario"
              ? "Actualizar Usuario"
              : vistaActiva === "Ventas" 
              ? "Nueva Venta"
              : vistaActiva === "Compras"
              ? "Nueva Compra"
              : vistaActiva === "Salidas"
              ? "Nueva Salida"
              : vistaActiva === "Productos"
              ? "Nuevo Producto"
              : vistaActiva?.startsWith("Novedades")
              ? "Nueva Novedad"
              : vistaActiva}
          </h2>
          <button className="bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer">
            <IoClose onClick={closeModal} size={20} />
          </button>
        </div>
        {component}
      </div>
    </div>
  );
}

export default ModalBigVarios;
