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
  const { getUsers, users, user } = useAuth();
  const { reservas, getReservas } = useReserva();
  const { clientes, getClientes } = useCliente();
  const { detalleReserva, createDetalleReserva, createPagoDetalleReserva } = useDetalleReserva();
  const { espacios, getEspacios } = useEspacio();
  const { getVeladas, veladas } = useVelada();

  return {
    user,
    users,
    getUsers,
    ventas,
    getVentas,
    getAllVentas,
    createVenta,
    deleteVenta,
    updateLoteVentas,
    deleteLoteVentas,
    products,
    getProducts,
    getAllProducts,
    cortesias,
    getCortesias,
    compras,
    getCompras,
    getAllCompras,
    createCompra,
    deleteCompra,
    updateCompra,
    reposiciones,
    getReposiciones,
    salidas,
    getAllSalidas,
    relevos,
    getAllRelevos,
    reservas,
    getReservas,
    clientes,
    getClientes,
    detalleReserva,
    createDetalleReserva,
    createPagoDetalleReserva,
    espacios,
    getEspacios,
    veladas,
    getVeladas,
  };
}
