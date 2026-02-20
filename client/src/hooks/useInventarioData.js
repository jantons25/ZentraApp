import { useVenta } from "../context/VentaContext";
import { useProduct } from "../context/ProductContext";
import { useCortesia } from "../context/CortesiaContext";
import { useReposicion } from "../context/ReposicionContext";
import { useSalida } from "../context/SalidaContext";
import { useCompra } from "../context/CompraContext";
import { useRelevo } from "../context/RelevoContext";
import { useAuth } from "../context/AuthContext";
import { useReserva } from "../context/ReservaContext";
import { useCliente } from "../context/ClienteContext";
import { useDetalleReserva } from "../context/DetalleReservaContext";
import { useEspacio } from "../context/EspacioContext";
import { useVelada } from "../context/VeladaContext";

export function useInventarioData() {
  const { getVentas, ventas, getAllVentas, deleteVenta, updateLoteVentas, deleteLoteVentas, createVenta } = useVenta();
  const { getProducts, products, getAllProducts } = useProduct();
  const { getCortesias, cortesias } = useCortesia();
  const { getReposiciones, reposiciones } = useReposicion();
  const { getAllSalidas, salidas } = useSalida();
  const { getCompras, getAllCompras, compras, createCompra, deleteCompra, updateCompra } = useCompra();
  const { getAllRelevos, relevos } = useRelevo();
  const { getUsers, users, user, empresa } = useAuth();
  const { reservas, getReservas } = useReserva();
  const { clientes, getClientes } = useCliente();
  const { detalleReservas, getDetalleReservas } = useDetalleReserva();
  const { espacios, getEspacios } = useEspacio();
  const { getVeladas, veladas} = useVelada();

  return {
    // auth
    user,
    users,
    getUsers,
    empresa,
    // ventas
    ventas,
    getVentas,
    getAllVentas,
    createVenta,
    deleteVenta,
    updateLoteVentas,
    deleteLoteVentas,
    // productos
    products,
    getProducts,
    getAllProducts,
    // cortesías
    cortesias,
    getCortesias,
    // compras
    compras,
    getCompras,
    getAllCompras,
    createCompra,
    deleteCompra,
    updateCompra,
    // reposiciones
    reposiciones,
    getReposiciones,
    // salidas
    salidas,
    getAllSalidas,
    // relevos
    relevos,
    getAllRelevos,
    // reservas
    reservas,
    getReservas,
    // clientes
    clientes,
    getClientes,
    // detalle reservas
    detalleReservas,
    getDetalleReservas,
    // espacios
    espacios,
    getEspacios,
    // veladas
    veladas,
    getVeladas,
  };
}