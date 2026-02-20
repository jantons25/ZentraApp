import VentasList from "./VentasList";
import ComprasList from "./ComprasList";
import SalidasList from "./SalidasList";
import ProductsList from "./ProductsList";
import ReposicionesList from "./ReposicionList";
import CortesiaList from "./CortesiaList";
import VeladasProductList from "./VeladasProductList";

function VentasSection({
  vistaActiva,
  user,
  ventas,
  compras,
  salidas,
  reposiciones,
  cortesias,
  veladas,
  products,
  closeModal,
  refreshPagina,
}) {
  if (vistaActiva === "Ventas") {
    return (
      <VentasList
        ventas={ventas}
        products={products}
        closeModal={closeModal}
        refreshPagina={refreshPagina}
        reposiciones={reposiciones}
        cortesias={cortesias}
      />
    );
  }

  if (vistaActiva === "Compras") {
    return (
      <ComprasList
        compras={compras}
        products={products}
        closeModal={closeModal}
        refreshPagina={refreshPagina}
      />
    );
  }

  if (vistaActiva === "Salidas") {
    return (
      <SalidasList
        salidas={salidas}
        products={products}
        closeModal={closeModal}
        refreshPagina={refreshPagina}
      />
    );
  }

  if (vistaActiva === "Reposiciones") {
    return (
      <ReposicionesList
        reposiciones={reposiciones}
        products={products}
        closeModal={closeModal}
        refreshPagina={refreshPagina}
      />
    );
  }

  if (vistaActiva === "Cortesias") {
    return (
      <CortesiaList
        cortesias={cortesias}
        products={products}
        closeModal={closeModal}
        refreshPagina={refreshPagina}
      />
    );
  }

  if (vistaActiva === "Veladas") {
    return (
      <VeladasProductList
        veladas={veladas}
        products={products}
        closeModal={closeModal}
        refreshPagina={refreshPagina}
      />
    );
  }

  if (vistaActiva === "Recepcion") {
    return (
      <VentasList
        ventas={ventas}
        vistaActiva="DataVentas"
        compras={compras}
        products={products}
        reposiciones={reposiciones}
        cortesias={cortesias}
      />
    );
  }

  if (vistaActiva === "Productos") {
    return (
      <ProductsList
        compras={compras}
        products={products}
        closeModal={closeModal}
        refreshPagina={refreshPagina}
      />
    );
  }

  if (user?.role === "recepcionista") {
    return (
      <VentasList
        ventas={ventas}
        products={products}
        closeModal={closeModal}
        refreshPagina={refreshPagina}
        reposiciones={reposiciones}
        cortesias={cortesias}
      />
    );
  }

  return (
    <VentasList
      ventas={ventas}
      vistaActiva="DataVentas"
      compras={compras}
      products={products}
      reposiciones={reposiciones}
      cortesias={cortesias}
      veladas={veladas}
    />
  );
}

export default VentasSection;
