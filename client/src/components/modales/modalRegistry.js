import VentasVariasFormPage from "../VentasVariasFormPage.jsx";
import ComprasVariasFormPage from "../ComprasVariasFormPage.jsx";
import SalidasVariasFormPage from "../SalidasVariasFormPage";
import ReposicionesVariasFormPage from "../ReposicionesVariasFormPage.jsx";
import CortesiasVariasFormPage from "../CortesiasVariasFormPage.jsx";
import VeladasVariasFormPage from "../VeladasVariasFormPage.jsx";
import RegisterPage from "../../pages/RegisterPage";
import ProductFormPage from "../../pages/ProductFormPage";
import Trabajando from "../Trabajando";
import WizardComponent from "../WizardComponent.jsx";
import EspaciosForm from "../EspaciosForm.jsx";
import ClientesForm from "../ClienteForm.jsx";

export const modalRegistry = {
  Ventas: {
    component: VentasVariasFormPage,
    props: (ctx) => ({
      closeModal: ctx.closeModal,
      refreshPagina: ctx.refreshPagina,
      products: ctx.products,
      ventas: ctx.ventas,
    }),
  },
  Compras: {
    component: ComprasVariasFormPage,
    props: (ctx) => ({
      closeModal: ctx.closeModal,
      refreshPagina: ctx.refreshPagina,
      products: ctx.products,
      compras: ctx.compras,
    }),
  },
  Salidas: {
    component: SalidasVariasFormPage,
    props: (ctx) => ({
      closeModal: ctx.closeModal,
      refreshPagina: ctx.refreshPagina,
      products: ctx.products,
    }),
  },
  Reposiciones: {
    component: ReposicionesVariasFormPage,
    props: (ctx) => ({
      closeModal: ctx.closeModal,
      refreshPagina: ctx.refreshPagina,
      products: ctx.products,
    }),
  },
  Cortesias: {
    component: CortesiasVariasFormPage,
    props: (ctx) => ({
      closeModal: ctx.closeModal,
      refreshPagina: ctx.refreshPagina,
      products: ctx.products,
    }),
  },
  Veladas: {
    component: VeladasVariasFormPage,
    props: (ctx) => ({
      closeModal: ctx.closeModal,
      refreshPagina: ctx.refreshPagina,
      products: ctx.products,
    }),
  },
  Reservas: {
    component : WizardComponent,
    props: (ctx) => ({
      closeModal: ctx.closeModal,
      refreshPagina: ctx.refreshPagina,
      espacios: ctx.espacios,
      clientes: ctx.clientes,
      reservas: ctx.reservas,
    }),
  },
  Espacios: {
    component : EspaciosForm,
    props: (ctx) => ({
      closeModal: ctx.closeModal,
      refreshPagina: ctx.refreshPagina,
      espacios: ctx.espacios,
      clientes: ctx.clientes,
      reservas: ctx.reservas,
    }),
  },
  Clientes: {
    component : ClientesForm,
    props: (ctx) => ({
      closeModal: ctx.closeModal,
      refreshPagina: ctx.refreshPagina,
      espacios: ctx.espacios,
      clientes: ctx.clientes,
      reservas: ctx.reservas,
    }),
  },
  AgregarUsuario: {
    component: RegisterPage,
    props: (ctx) => ({
      closeModal: ctx.closeModal,
      refreshPagina: ctx.refreshPagina,
    }),
  },
  Productos: {
    component: ProductFormPage,
    props: (ctx) => ({
      closeModal: ctx.closeModal,
      refreshPagina: ctx.refreshPagina,
    }),
  },
  Promociones: {
    component: Trabajando,
    props: () => ({}), // No requiere props
  },
};
