import VentasList from "./VentasList";
import ComprasList from "./ComprasList";
import SalidasList from "./SalidasList";
import ProductsList from "./ProductsList";
import ReposicionesList from "./ReposicionList";
import CortesiaList from "./CortesiaList";
import VeladasProductList from "./VeladasProductList";
import RecepcionData from "./RecepcionData";

const TABS_RECEPCION = [
  { id: "Ventas", label: "Ventas" },
  { id: "Reposiciones", label: "Reposiciones" },
  { id: "Cortesias", label: "Cortesías" },
  { id: "Veladas", label: "Veladas" },
];

const TABS_ADMINISTRACION = [
  { id: "Compras", label: "Compras" },
  { id: "Salidas", label: "Salidas" },
];

function SubTabs({ tabs, vistaActiva, setVistaActiva }) {
  return (
    <div className="bg-white px-4 pt-4 w-full flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setVistaActiva(tab.id)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition border ${
            vistaActiva === tab.id
              ? "bg-[#b9bc31] text-white border-[#b9bc31]"
              : "bg-white text-gray-600 border-gray-300 hover:border-[#b9bc31]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function VentasSection({
  vistaActiva,
  setVistaActiva,
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
      <>
        <SubTabs tabs={TABS_RECEPCION} vistaActiva={vistaActiva} setVistaActiva={setVistaActiva} />
        <VentasList
          ventas={ventas}
          products={products}
          closeModal={closeModal}
          refreshPagina={refreshPagina}
          reposiciones={reposiciones}
          cortesias={cortesias}
        />
      </>
    );
  }

  if (vistaActiva === "Compras") {
    return (
      <>
        <SubTabs tabs={TABS_ADMINISTRACION} vistaActiva={vistaActiva} setVistaActiva={setVistaActiva} />
        <ComprasList
          compras={compras}
          products={products}
          closeModal={closeModal}
          refreshPagina={refreshPagina}
        />
      </>
    );
  }

  if (vistaActiva === "Salidas") {
    return (
      <>
        <SubTabs tabs={TABS_ADMINISTRACION} vistaActiva={vistaActiva} setVistaActiva={setVistaActiva} />
        <SalidasList
          salidas={salidas}
          products={products}
          closeModal={closeModal}
          refreshPagina={refreshPagina}
        />
      </>
    );
  }

  if (vistaActiva === "Reposiciones") {
    return (
      <>
        <SubTabs tabs={TABS_RECEPCION} vistaActiva={vistaActiva} setVistaActiva={setVistaActiva} />
        <ReposicionesList
          reposiciones={reposiciones}
          products={products}
          closeModal={closeModal}
          refreshPagina={refreshPagina}
        />
      </>
    );
  }

  if (vistaActiva === "Cortesias") {
    return (
      <>
        <SubTabs tabs={TABS_RECEPCION} vistaActiva={vistaActiva} setVistaActiva={setVistaActiva} />
        <CortesiaList
          cortesias={cortesias}
          products={products}
          closeModal={closeModal}
          refreshPagina={refreshPagina}
        />
      </>
    );
  }

  if (vistaActiva === "Veladas") {
    return (
      <>
        <SubTabs tabs={TABS_RECEPCION} vistaActiva={vistaActiva} setVistaActiva={setVistaActiva} />
        <VeladasProductList
          veladas={veladas}
          products={products}
          closeModal={closeModal}
          refreshPagina={refreshPagina}
        />
      </>
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

  if (vistaActiva === "DataVentas") {
    return (
      <>
        <RecepcionData
          ventas={ventas}
          compras={compras}
          productos={products}
          reposiciones={reposiciones}
          cortesias={cortesias}
        />
      </>
    );
  }

  if (user?.role === "recepcionista") {
    return (
      <>
        <SubTabs tabs={TABS_RECEPCION} vistaActiva={vistaActiva} setVistaActiva={setVistaActiva} />
        <VentasList
          ventas={ventas}
          products={products}
          closeModal={closeModal}
          refreshPagina={refreshPagina}
          reposiciones={reposiciones}
          cortesias={cortesias}
        />
      </>
    );
  }

  return (
    <VentasList
      ventas={ventas}
      vistaActiva="Ventas"
      compras={compras}
      products={products}
      reposiciones={reposiciones}
      cortesias={cortesias}
      veladas={veladas}
    />
  );
}

export default VentasSection;
