import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './components/pages/Home';
import Productos from './components/pages/Productos';
import Nosotros from './components/pages/Nosotros';
import Contacto from './components/pages/Contacto';
import SearchResults from './components/pages/SearchResults';
import ProductDetails from './components/products/ProductDetail';
import CategoryProducts from './components/pages/CategoryProducts';
import Checkout from './components/checkout/Checkout';
import Login from './components/pages/Login';
import Registro from './components/pages/Registro';
import Profile from './components/pages/user/Profile';
import OrderHistory from './components/pages/user/OrderHistory';
import OrderDetail from './components/pages/user/OrderDetail';
import ProfileAdmin from './components/pages/admin/ProfileAdmin';
import TerminosCondiciones from './components/pages/TerminosCondiciones';
import PrivacidadSeguridad from './components/pages/PrivacidadSeguridad';
import DevolucionReembolso from './components/pages/DevolucionReembolso';
import CalidadInocuidad from './components/pages/CalidadInocuidad';
import EntregaEnvios from './components/pages/EntregaEnvios';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import AdminRoute from './components/auth/AdminRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/main.css';
import Blogs from './components/pages/Blogs';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Ruta de Admin SIN layout general */}
            <Route path="/admin" element={
              <AdminRoute>
                <ProfileAdmin />
              </AdminRoute>
            } />

            {/* Todas las demás rutas CON layout general */}
            <Route path="*" element={
              <DefaultLayout />
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Componente para el layout por defecto (con Header, Navbar, Footer)
function DefaultLayout() {
  return (
    <>
      <Header />
      <Navbar />
      <main>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/blogs" element={<Blogs />} /> 
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/buscar" element={<SearchResults />} />
          <Route path="/producto/:productId" element={<ProductDetails />} />
          <Route path="/categoria/:category" element={<CategoryProducts />} />

          {/* Rutas Protegidas */}
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/mis-pedidos" element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          } />
          <Route path="/mis-pedidos/:orderId" element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          } />

          {/* Rutas Públicas con restricción */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/registro" element={
            <PublicRoute>
              <Registro />
            </PublicRoute>
          } />

          {/* Otras rutas públicas */}
          <Route path="/terminos-y-condiciones" element={<TerminosCondiciones />} />
          <Route path="/privacidad-y-seguridad" element={<PrivacidadSeguridad />} />
          <Route path="/devolucion-y-reembolso" element={<DevolucionReembolso />} />
          <Route path="/calidad-e-inocuidad" element={<CalidadInocuidad />} />
          <Route path="/entrega-y-envios" element={<EntregaEnvios />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;