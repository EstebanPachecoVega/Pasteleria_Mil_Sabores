import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch';
import CartOffCanvas from '../cart/CartOffCanvas';
import { useAuth } from '../../context/AuthContext';
import '../../styles/components/cart.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const [showCart, setShowCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const {
    searchTerm,
    setSearchTerm,
    suggestions,
    isSearching
  } = useSearch();

  const navigate = useNavigate();
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // === FUNCIONES PARA EL CARRITO ===
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    setCartCount(totalItems);
  };

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(cart);
    updateCartCount();
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ).filter(item => item.quantity > 0);

      localStorage.setItem('cart', JSON.stringify(updatedItems));
      window.dispatchEvent(new Event('cartUpdated'));
      return updatedItems;
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.id !== productId);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      window.dispatchEvent(new Event('cartUpdated'));
      return updatedItems;
    });
  };

  // === EFECTOS PRINCIPALES ===
  useEffect(() => {
    // Cargar estado inicial
    loadCart();

    // Configurar listener para actualizaciones del carrito
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // === MANEJO DE BÚSQUEDA ===
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length > 1) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setShowSuggestions(false);
      if (isMobile) {
        setIsMenuOpen(false);
      }
    }
  };

  const handleSuggestionClick = (product) => {
    navigate(`/producto/${product.id}`);
    setSearchTerm('');
    setShowSuggestions(false);
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  const handleViewAllResults = () => {
    navigate(`/buscar?q=${encodeURIComponent(searchTerm)}`);
    setShowSuggestions(false);
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  // === FUNCIÓN PARA MANEJO DE CATEGORÍAS ===
  const handleCategoryClick = (path) => {
    navigate(path);
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  // === FUNCIÓN PARA MANEJAR USUARIO ===
  const formatUserName = (user) => {
    if (!user) return 'Usuario';

    // Si es admin
    if (user.rol === 'admin') {
      return 'Administrador';
    }

    // Para clientes, usar el nombre del contexto
    if (user.name) {
      const nameParts = user.name.split(' ').filter(part => part.trim() !== '');

      if (nameParts.length >= 2) {
        const firstName = nameParts[0];
        const firstSurname = nameParts.length >= 3 ? nameParts[nameParts.length - 2] : nameParts[1];
        return `${firstName} ${firstSurname.charAt(0)}.`;
      }

      return user.name;
    }

    return 'Usuario';
  };

  const handleLogout = () => {
    logout(); // Esto limpia el contexto y localStorage
    navigate('/'); // Redirige al home después del logout
    if (isMobile) setIsMenuOpen(false);
  };

  // Focus en input cuando se muestran sugerencias en móvil
  useEffect(() => {
    if (showSuggestions && isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSuggestions, isMobile]);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-bg shadow-sm">
        <div className="container">
          {/* Logo */}
          <Link className="navbar-brand" to="/" onClick={() => setIsMenuOpen(false)}>
            <img
              src="/images/logo/logo_pasteleria_sin_fondo.png"
              alt="Logo Pastelería Mil Sabores"
              height="60"
            />
            <span className="navbar-title ms-2 d-none d-md-inline">Pastelería Mil Sabores</span>
          </Link>

          {/* Mobile toggle */}
          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navbar contenido */}
          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
            {/* Navegación principal */}
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/productos" onClick={() => setIsMenuOpen(false)}>Productos</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/nosotros" onClick={() => setIsMenuOpen(false)}>Nosotros</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/blogs" onClick={() => setIsMenuOpen(false)}>Blogs</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/contacto" onClick={() => setIsMenuOpen(false)}>Contacto</Link>
              </li>

              {/* Dropdown Categorías */}
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  onClick={(e) => {
                    if (isMobile) {
                      e.preventDefault();
                      const dropdown = e.target.closest('.dropdown');
                      dropdown.classList.toggle('show');
                    }
                  }}
                >
                  Categorías
                </a>
                <ul className="dropdown-menu dropdown-menu-bg">
                  {/* Sección Tortas */}
                  <li>
                    <span className="dropdown-header text-uppercase small fw-bold">Tortas</span>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/categoria/cuadradas"
                      onClick={() => handleCategoryClick('/categoria/cuadradas')}
                    >
                      <i className="bi bi-square me-2"></i>
                      Tortas Cuadradas
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/categoria/circulares"
                      onClick={() => handleCategoryClick('/categoria/circulares')}
                    >
                      <i className="bi bi-circle me-2"></i>
                      Tortas Circulares
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/categoria/especiales"
                      onClick={() => handleCategoryClick('/categoria/especiales')}
                    >
                      <i className="bi bi-star me-2"></i>
                      Tortas Especiales
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>

                  {/* Sección Categorías Especiales */}
                  <li>
                    <span className="dropdown-header text-uppercase small fw-bold">Categorías Especiales</span>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/categoria/individuales"
                      onClick={() => handleCategoryClick('/categoria/individuales')}
                    >
                      <i className="bi bi-cup-straw me-2"></i>
                      Postres Individuales
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/categoria/tradicional"
                      onClick={() => handleCategoryClick('/categoria/tradicional')}
                    >
                      <i className="bi bi-heart me-2"></i>
                      Pastelería Tradicional
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/categoria/sin_azucar"
                      onClick={() => handleCategoryClick('/categoria/sin_azucar')}
                    >
                      <i className="bi bi-droplet me-2"></i>
                      Sin Azúcar
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/categoria/sin_gluten"
                      onClick={() => handleCategoryClick('/categoria/sin_gluten')}
                    >
                      <i className="bi bi-flower1 me-2"></i>
                      Sin Gluten
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/categoria/veganos"
                      onClick={() => handleCategoryClick('/categoria/veganos')}
                    >
                      <i className="bi bi-leaf me-2"></i>
                      Productos Veganos
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>

            {/* Buscador */}
            <div className={`d-flex me-3 search-container ${isMobile ? 'w-100' : ''}`} ref={searchRef}>
              <form className={`input-group navbar-search ${isMobile ? 'w-100' : ''}`} onSubmit={handleSearchSubmit}>
                <input
                  ref={inputRef}
                  className="form-control"
                  type="search"
                  placeholder="Buscar productos..."
                  aria-label="Search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
                />
                <button className="btn navbar-search-btn" type="submit">
                  <i className="bi bi-search"></i>
                </button>
              </form>

              {/* Sugerencias de búsqueda */}
              {showSuggestions && (
                <div
                  className="search-suggestions"
                  style={{
                    maxHeight: isMobile ? '60vh' : '300px',
                  }}
                >
                  {isSearching ? (
                    <div className="suggestion-item">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                        <span className="visually-hidden">Buscando...</span>
                      </div>
                      Buscando...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <>
                      {suggestions.map((product) => (
                        <div
                          key={product.id}
                          className="suggestion-item"
                          onClick={() => handleSuggestionClick(product)}
                        >
                          <i className="bi bi-cake me-2"></i>
                          <div className="suggestion-content">
                            <div className="suggestion-name">{product.name}</div>
                            <div className="suggestion-category">{product.category}</div>
                          </div>
                        </div>
                      ))}
                      <div
                        className="suggestion-item view-all"
                        onClick={handleViewAllResults}
                      >
                        <i className="bi bi-search me-2"></i>
                        <span className="view-all-text">
                          Ver todos los resultados para "{searchTerm}"
                        </span>
                      </div>
                    </>
                  ) : searchTerm.length > 1 ? (
                    <div className="suggestion-item no-results">
                      <i className="bi bi-exclamation-circle me-2"></i>
                      No se encontraron productos
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Botones de usuario y carrito */}
            <div className="d-flex">
              {/* Carrito */}
              <button
                className="btn navbar-cart-btn position-relative me-2"
                onClick={() => setShowCart(true)}
              >
                <i className="bi bi-cart3"></i>
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Usuario */}
              {currentUser ? (
                <div className="dropdown">
                  <button
                    className="btn navbar-person-btn dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    {formatUserName(currentUser)}
                    {currentUser.rol === 'admin' && (
                      <span className="badge bg-danger ms-1" title="Administrador">
                        <i className="bi bi-shield-check"></i>
                      </span>
                    )}
                    {currentUser.discountCode === 'FELICES50' && (
                      <span className="badge bg-success ms-1" title="10% descuento permanente">
                        <i className="bi bi-star-fill"></i>
                      </span>
                    )}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-bg">
                    {/* Enlaces según el rol */}
                    {currentUser.rol === 'admin' ? (
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/admin"
                          onClick={() => {
                            console.log('Navegando a /admin, usuario es admin:', currentUser.rol);
                            if (isMobile) {
                              setIsMenuOpen(false);
                            }
                            const dropdown = document.querySelector('.dropdown .show');
                            if (dropdown) {
                              dropdown.classList.remove('show');
                            }
                          }}
                        >
                          <i className="bi bi-speedometer2 me-2"></i>Panel Administrador
                        </Link>
                      </li>
                    ) : (
                      <>
                        <li>
                          <Link
                            className="dropdown-item"
                            to="/perfil"
                            onClick={() => isMobile && setIsMenuOpen(false)}
                          >
                            <i className="bi bi-person me-2"></i>Mi Perfil
                          </Link>
                        </li>
                        <li>
                          <Link
                            className="dropdown-item"
                            to="/mis-pedidos"
                            onClick={() => isMobile && setIsMenuOpen(false)}
                          >
                            <i className="bi bi-bag me-2"></i>Mis Pedidos
                          </Link>
                        </li>
                      </>
                    )}

                    <li><hr className="dropdown-divider" /></li>

                    {/* Mostrar beneficios del usuario */}
                    {currentUser.discountCode === 'FELICES50' && (
                      <li>
                        <span className="dropdown-item text-success small">
                          <i className="bi bi-check-circle me-2"></i>
                          10% descuento permanente
                        </span>
                      </li>
                    )}

                    <li>
                      <button
                        className="dropdown-item"
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="dropdown">
                  <button
                    className="btn btn-outline-secondary dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    Acceso
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/login"
                        onClick={() => isMobile && setIsMenuOpen(false)}
                      >
                        <i className="bi bi-box-arrow-in-right me-2"></i>Iniciar Sesión
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/registro"
                        onClick={() => isMobile && setIsMenuOpen(false)}
                      >
                        <i className="bi bi-person-plus me-2"></i>Registrarse
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Componente Cart OffCanvas */}
      <CartOffCanvas
        show={showCart}
        onClose={() => setShowCart(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
      />
    </>
  );
};

export default Navbar;