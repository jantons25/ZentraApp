import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import ProductFormPage from "./pages/ProductFormPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import HomePage from "./pages/HomePage.jsx";
import AdministracionPage from "./pages/AdministracionPage.jsx";
import { Toaster } from "react-hot-toast";

import ProtectedRoute from "./ProtectedRoute.jsx";
import { ProductProvider } from "./context/ProductContext.jsx";
import Inventario from "./pages/Inventario.jsx";
import ComprasPage from "./pages/ComprasPage.jsx";
import { ComprasProvider } from "./context/CompraContext.jsx";
import VentasPage from "./pages/VentasPage.jsx";
import { VentaProvider } from "./context/VentaContext.jsx";
import SalidasPage from "./pages/SalidasPage.jsx";
import { CortesiaProvider } from "./context/CortesiaContext.jsx";
import { SalidaProvider } from "./context/SalidaContext.jsx";
import { RelevoProvider } from "./context/RelevoContext.jsx";
import { ReposicionProvider } from "./context/ReposicionContext.jsx";
import { ReservaProvider } from "./context/ReservaContext.jsx";
import { ClienteProvider } from "./context/ClienteContext.jsx";
import { DetalleReservaProvider } from "./context/DetalleReservaContext.jsx";
import { EspacioProvider } from "./context/EspacioContext.jsx";
import { VeladaProvider } from "./context/VeladaContext.jsx";
import ReservasPage from "./pages/ReservasPage.jsx";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <>
      <AuthProvider>
        <VeladaProvider>
          <EspacioProvider>
            <DetalleReservaProvider>
              <ReservaProvider>
                <ClienteProvider>
                  <ComprasProvider>
                    <VentaProvider>
                      <SalidaProvider>
                        <ReposicionProvider>
                          <CortesiaProvider>
                            <RelevoProvider>
                              <ProductProvider>
                                <BrowserRouter>
                                  <Routes>
                                    <Route
                                      path="/login"
                                      element={<LoginPage />}
                                    />
                                    <Route
                                      path="/register"
                                      element={<RegisterPage />}
                                    />
                                    <Route element={<ProtectedRoute />}>
                                      <Route
                                        path="/products"
                                        element={<ProductsPage />}
                                      />
                                      <Route
                                        path="/"
                                        element={<Inventario />}
                                      />
                                      <Route
                                        path="/dashboard"
                                        element={<Dashboard />}
                                      />
                                      <Route
                                        path="/inventario"
                                        element={<Inventario />}
                                      />
                                      <Route
                                        path="/compras"
                                        element={<ComprasPage />}
                                      />
                                      <Route
                                        path="/ventas"
                                        element={<VentasPage />}
                                      />
                                      <Route
                                        path="/salidas"
                                        element={<SalidasPage />}
                                      />
                                      <Route
                                        path="/administracion"
                                        element={<AdministracionPage />}
                                      />
                                      <Route
                                        path="/reservas"
                                        element={<ReservasPage />}
                                      />
                                      <Route
                                        path="/add-product"
                                        element={<ProductFormPage />}
                                      />
                                      <Route
                                        path="/products/:id"
                                        element={<ProductFormPage />}
                                      />
                                      <Route
                                        path="/profile"
                                        element={<ProfilePage />}
                                      />
                                    </Route>
                                  </Routes>
                                </BrowserRouter>
                              </ProductProvider>
                            </RelevoProvider>
                          </CortesiaProvider>
                        </ReposicionProvider>
                      </SalidaProvider>
                    </VentaProvider>
                  </ComprasProvider>
                </ClienteProvider>
              </ReservaProvider>
            </DetalleReservaProvider>
          </EspacioProvider>
        </VeladaProvider>
      </AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default App;
