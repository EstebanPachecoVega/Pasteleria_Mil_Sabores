import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatters';
import { obtenerProductoPorId } from '../../services/productService';

const CartOffCanvas = ({ show, onClose, cartItems, onUpdateQuantity, onRemoveItem }) => {
  const [productStocks, setProductStocks] = useState({});
  const [loadingItems, setLoadingItems] = useState({});
  const [editingItemId, setEditingItemId] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [localCartItems, setLocalCartItems] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Sincronizar cartItems con estado local para actualizaciones más fluidas
  useEffect(() => {
    setLocalCartItems(cartItems);
  }, [cartItems]);

  // Funciones auxiliares para calcular edad y cumpleaños
  const calculateUserAge = useCallback((birthDateString) => {
    if (!birthDateString) return 0;
    
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }, []);

  const isUserBirthdayToday = useCallback((birthDateString) => {
    if (!birthDateString) return false;
    
    const birthDate = new Date(birthDateString);
    const today = new Date();
    
    return today.getMonth() === birthDate.getMonth() && 
           today.getDate() === birthDate.getDate();
  }, []);

  // Cargar stocks de productos solo cuando sea necesario
  useEffect(() => {
    const loadProductStocks = async () => {
      // Solo cargar stocks de items que no los tengan aún
      const itemsToLoad = cartItems.filter(item => !productStocks[item.id]);
      if (itemsToLoad.length === 0) return;

      const stockPromises = itemsToLoad.map(async (item) => {
        try {
          setLoadingItems(prev => ({ ...prev, [item.id]: true }));
          const producto = await obtenerProductoPorId(item.id);
          return { id: item.id, stock: producto?.stock || 0 };
        } catch (error) {
          console.error(`Error cargando stock para ${item.id}:`, error);
          return { id: item.id, stock: 0 };
        } finally {
          setLoadingItems(prev => ({ ...prev, [item.id]: false }));
        }
      });

      const stocks = await Promise.all(stockPromises);
      setProductStocks(prev => {
        const newStocks = { ...prev };
        stocks.forEach(s => {
          newStocks[s.id] = s.stock;
        });
        return newStocks;
      });
    };

    if (show && cartItems.length > 0) {
      loadProductStocks();
    }
  }, [show, cartItems]); // Removí productStocks de las dependencias para evitar loops

  // Normalizar items del carrito usando estado local para mejor rendimiento
  const normalizedCartItems = useMemo(() => {
    return localCartItems.map(item => ({
      id: item.id || item.productId,
      name: item.nombre || item.name || 'Producto sin nombre',
      price: Number(item.precio || item.price || 0),
      quantity: Number(item.cantidad || item.quantity || 1),
      image: item.image || item.imagen || '/images/productos/default.png',
      category: item.categoriaNombre || item.categoryName || '',
      categoryId: item.categoriaId || item.categoryId || '',
      stock: productStocks[item.id] || item.stock || 0
    }));
  }, [localCartItems, productStocks]);

  // Optimizar cálculo de totales con memoización más granular
  const subtotal = useMemo(() => {
    return normalizedCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [normalizedCartItems]);

  const discountDetails = useMemo(() => {
    if (!currentUser) return [];
    
    const details = [];
    const userAge = calculateUserAge(currentUser.birthDate);
    
    if (userAge >= 50) {
      details.push('50% descuento para mayores de 50 años');
    }
    
    const discountCode = localStorage.getItem('discountCode');
    if (discountCode === 'FELICES50' || currentUser.discountCode === 'FELICES50') {
      details.push('10% descuento por promoción');
    }
    
    if (isUserBirthdayToday(currentUser.birthDate)) {
      const cake = normalizedCartItems.find(item => 
        item.category?.toLowerCase().includes('torta') || 
        item.name.toLowerCase().includes('torta')
      );
      if (cake) {
        details.push(`Torta gratis en tu cumpleaños (${cake.name})`);
      }
    }
    
    return details;
  }, [normalizedCartItems, currentUser, calculateUserAge, isUserBirthdayToday]);

  const totalDiscounts = useMemo(() => {
    if (!currentUser) return 0;
    
    let ageDiscountValue = 0;
    let codeDiscountValue = 0;
    let birthdayDiscountValue = 0;
    
    const userAge = calculateUserAge(currentUser.birthDate);
    
    if (userAge >= 50) {
      ageDiscountValue = subtotal * 0.5;
    }
    
    const discountCode = localStorage.getItem('discountCode');
    if (discountCode === 'FELICES50' || currentUser.discountCode === 'FELICES50') {
      codeDiscountValue = subtotal * 0.1;
    }
    
    if (isUserBirthdayToday(currentUser.birthDate)) {
      const cake = normalizedCartItems.find(item => 
        item.category?.toLowerCase().includes('torta') || 
        item.name.toLowerCase().includes('torta')
      );
      if (cake) {
        birthdayDiscountValue = cake.price * cake.quantity;
      }
    }
    
    return ageDiscountValue + codeDiscountValue + birthdayDiscountValue;
  }, [subtotal, normalizedCartItems, currentUser, calculateUserAge, isUserBirthdayToday]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - totalDiscounts);
  }, [subtotal, totalDiscounts]);

  // Optimizar manejo de cantidades con actualización local inmediata
  const handleIncrement = useCallback((itemId, currentQuantity) => {
    const maxStock = productStocks[itemId] || 100;
    
    if (currentQuantity >= maxStock) return;
    
    // Actualización local inmediata para mejor UX
    const newQuantity = currentQuantity + 1;
    const updatedItems = localCartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    // Actualizar estado local
    setLocalCartItems(updatedItems);
    
    // Actualizar localStorage inmediatamente
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    
    // Llamar a la función prop con un pequeño delay para evitar bloqueos
    setTimeout(() => {
      onUpdateQuantity(itemId, newQuantity);
    }, 0);
    
    // Notificar a otros componentes
    window.dispatchEvent(new Event('cartUpdated'));
  }, [localCartItems, productStocks, onUpdateQuantity]);

  const handleDecrement = useCallback((itemId, currentQuantity) => {
    if (currentQuantity <= 1) {
      // Eliminar item
      const updatedItems = localCartItems.filter(item => item.id !== itemId);
      setLocalCartItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      window.dispatchEvent(new Event('cartUpdated'));
      
      setTimeout(() => {
        onRemoveItem(itemId);
      }, 0);
    } else {
      // Decrementar cantidad
      const newQuantity = currentQuantity - 1;
      const updatedItems = localCartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      
      setLocalCartItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      
      setTimeout(() => {
        onUpdateQuantity(itemId, newQuantity);
      }, 0);
      
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, [localCartItems, onUpdateQuantity, onRemoveItem]);

  // Funciones para edición directa
  const startEditing = useCallback((item) => {
    setEditingItemId(item.id);
    setEditQuantity(item.quantity.toString());
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingItemId(null);
    setEditQuantity('');
  }, []);

  const saveQuantity = useCallback(async (itemId) => {
    let newQuantity = parseInt(editQuantity) || 1;
    const maxStock = productStocks[itemId] || 100;

    // Validar stock máximo
    if (newQuantity > maxStock) {
      newQuantity = maxStock;
    }

    if (newQuantity < 1) {
      handleDecrement(itemId, 1);
    } else {
      const updatedItems = localCartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      
      setLocalCartItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      
      setTimeout(() => {
        onUpdateQuantity(itemId, newQuantity);
      }, 0);
      
      window.dispatchEvent(new Event('cartUpdated'));
    }

    setEditingItemId(null);
    setEditQuantity('');
  }, [editQuantity, productStocks, localCartItems, handleDecrement, onUpdateQuantity]);

  const handleQuantityKeyPress = useCallback((e, itemId) => {
    if (e.key === 'Enter') {
      saveQuantity(itemId);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  }, [saveQuantity, cancelEditing]);

  // Resetear al cerrar
  useEffect(() => {
    if (!show) {
      setEditingItemId(null);
      setEditQuantity('');
    }
  }, [show]);

  const handleProceedToCheckout = useCallback(() => {
    onClose();
    navigate('/checkout');
  }, [onClose, navigate]);

  return (
    <div
      className={`offcanvas offcanvas-end cart-offcanvas-main ${show ? 'show' : ''}`}
      style={{
        visibility: show ? 'visible' : 'hidden',
        width: show ? '400px' : '0px'
      }}
      tabIndex="-1"
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title">
          <i className="bi bi-cart3 me-2"></i>Tu Carrito
        </h5>
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        ></button>
      </div>

      <div className="offcanvas-body">
        {normalizedCartItems.length === 0 ? (
          <div id="cart-empty-state" className="text-center py-5">
            <i className="bi bi-cart-x" style={{ fontSize: '3rem' }}></i>
            <p className="mt-3 text-muted">Tu carrito está vacío</p>
            <button className="btn continue-shopping-btn mt-3" onClick={onClose}>
              Continuar Comprando
            </button>
          </div>
        ) : (
          <div id="cart-items-container">
            <div className="cart-items-list">
              {normalizedCartItems.map(item => {
                const maxStock = productStocks[item.id] || item.stock || 100;
                const stockAvailable = maxStock - item.quantity;
                const isLoading = loadingItems[item.id];
                
                return (
                  <div key={item.id} className="cart-item d-flex align-items-center p-2 border-bottom">
                    <div className="position-relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="cart-item-image rounded me-3"
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          objectFit: 'cover',
                          opacity: isLoading ? 0.7 : 1
                        }}
                      />
                      {isLoading && (
                        <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
                          <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Cargando...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="cart-item-details flex-grow-1">
                      <h6 className="mb-1">{item.name}</h6>
                      <small className="text-muted">
                        Stock disponible: {maxStock} unidades
                      </small>
                      
                      <div className="cart-item-controls d-flex align-items-center justify-content-between w-100 mt-2">
                        <div className="quantity-selector d-flex align-items-center">
                          <button
                            className="cart-item-decrease btn btn-outline-secondary btn-sm"
                            onClick={() => handleDecrement(item.id, item.quantity)}
                            disabled={item.quantity <= 1 || isLoading}
                            aria-label="Disminuir cantidad"
                          >
                            -
                          </button>
                          
                          {editingItemId === item.id ? (
                            <div className="quantity-edit-container position-relative mx-2">
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={editQuantity}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^0-9]/g, '');
                                  const numericValue = parseInt(value) || 0;
                                  if (numericValue <= maxStock) {
                                    setEditQuantity(value);
                                  } else {
                                    setEditQuantity(maxStock.toString());
                                  }
                                }}
                                onKeyPress={(e) => handleQuantityKeyPress(e, item.id)}
                                onBlur={() => saveQuantity(item.id)}
                                autoFocus
                                min="1"
                                max={maxStock}
                                style={{ width: '60px' }}
                              />
                            </div>
                          ) : (
                            <span
                              className="quantity-number editable mx-3"
                              onClick={() => !isLoading && startEditing(item)}
                              title={isLoading ? "Cargando..." : "Haz clic para editar la cantidad"}
                              style={{ 
                                cursor: isLoading ? 'not-allowed' : 'pointer', 
                                minWidth: '30px', 
                                textAlign: 'center',
                                opacity: isLoading ? 0.5 : 1
                              }}
                            >
                              {isLoading ? '...' : item.quantity}
                            </span>
                          )}
                          
                          <button
                            className="cart-item-increase btn btn-outline-secondary btn-sm"
                            onClick={() => handleIncrement(item.id, item.quantity)}
                            disabled={item.quantity >= maxStock || isLoading}
                            aria-label="Aumentar cantidad"
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="d-flex align-items-center">
                          <div className="cart-item-price fw-bold me-3">
                            ${formatPrice(item.price * item.quantity)}
                          </div>
                          <button
                            className="cart-item-remove btn btn-outline-danger btn-sm"
                            onClick={() => handleDecrement(item.id, 1)}
                            disabled={isLoading}
                            aria-label='Eliminar producto'
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                      
                      {stockAvailable <= 5 && stockAvailable > 0 && (
                        <small className="text-warning d-block mt-1">
                          <i className="bi bi-exclamation-triangle"></i> Solo {stockAvailable} disponible(s)
                        </small>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sección de descuentos */}
            {discountDetails.length > 0 && (
              <div className="discount-section mt-3 p-3 bg-light rounded">
                <h6 className="mb-2">
                  <i className="bi bi-tag me-2"></i>
                  Descuentos Aplicados
                </h6>
                <div className="mt-2">
                  {discountDetails.map((detail, index) => (
                    <div key={index} className="alert alert-success py-2 small mb-2">
                      <i className="bi bi-check-circle me-2"></i>
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resumen */}
            <div className="cart-summary mt-3 p-3 border-top">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Subtotal:</span>
                <span>${formatPrice(subtotal)}</span>
              </div>

              {totalDiscounts > 0 && (
                <div className="d-flex justify-content-between align-items-center mb-2 text-success">
                  <span>Descuentos:</span>
                  <span>-${formatPrice(totalDiscounts)}</span>
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mb-3 fw-bold fs-5">
                <span>Total:</span>
                <span>${formatPrice(total)}</span>
              </div>

              <div className="d-grid gap-2">
                <button
                  className="btn proceed-payment-btn"
                  onClick={handleProceedToCheckout}
                >
                  <i className="bi bi-credit-card me-2"></i>
                  Proceder al Pago
                </button>
                <button className="btn continue-shopping-btn btn-outline-secondary" onClick={onClose}>
                  Continuar Comprando
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartOffCanvas;