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
import Profile from './components/user/Profile';
import OrderHistory from './components/user/OrderHistory';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/main.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/productos" element={<Productos />} />
              <Route path="/nosotros" element={<Nosotros />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/buscar" element={<SearchResults />} />
              <Route path="/producto/:productId" element={<ProductDetails />} />
              <Route path="/categoria/:category" element={<CategoryProducts />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/mis-pedidos" element={<OrderHistory />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;