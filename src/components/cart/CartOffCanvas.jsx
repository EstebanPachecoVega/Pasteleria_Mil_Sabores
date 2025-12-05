import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { calculateUserDiscounts } from '../../data/users';
import { formatPrice } from '../../utils/formatters';
import { obtenerProductoPorId } from '../../services/productService';

const CartOffCanvas = ({ show, onClose, cartItems, onUpdateQuantity, onRemoveItem }) => {
  const [discountCode, setDiscountCode] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');
  const [productStocks, setProductStocks] = useState({});
  const [loadingStocks, setLoadingStocks] = useState({});

  const [editingItemId, setEditingItemId] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Cargar stocks de productos
  useEffect(() => {
    const loadProductStocks = async () => {
      const stockPromises = cartItems.map(async (item) => {
        try {
          const producto = await obtenerProductoPorId(item.id);
          return { id: item.id, stock: producto?.stock || 0 };
        } catch (error) {
          console.error(`Error cargando stock para ${item.id}:`, error);
          return { id: item.id, stock: 0 };
        }
      });

      const stocks = await Promise.all(stockPromises);
      const stockMap = {};
      stocks.forEach(s => {
        stockMap[s.id] = s.stock;
      });
      setProductStocks(stockMap);
    };

    if (show && cartItems.length > 0) {
      loadProductStocks();
    }
  }, [show, cartItems]);

  // Normalizar items del carrito
  const normalizedCartItems = useMemo(() => {
    return cartItems.map(item => ({
      id: item.id || item.productId,
      name: item.nombre || item.name || 'Producto sin nombre',
      price: Number(item.precio || item.price || 0),
      quantity: Number(item.cantidad || item.quantity || 1),
      image: item.image || item.imagen || '/images/productos/default.png',
      category: item.categoriaNombre || item.categoryName || '',
      categoryId: item.categoriaId || item.categoryId || '',
      stock: productStocks[item.id] || item.stock || 0
    }));
  }, [cartItems, productStocks]);

  // Calcular totales con useMemo
  const { subtotal, ageDiscount, codeDiscount, birthdayDiscount, totalDiscounts, total } = useMemo(() => {
    const subtotalValue = normalizedCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Calcular descuentos
    const userDiscounts = currentUser ? calculateUserDiscounts(currentUser, subtotalValue, normalizedCartItems) : { specialDiscounts: {} };
    
    const ageDiscountValue = userDiscounts.specialDiscounts?.seniorDiscount ? subtotalValue * 0.5 : 0;
    const codeDiscountValue = userDiscounts.specialDiscounts?.codeDiscount ? subtotalValue * 0.1 : 0;
    
    // Descuento de torta gratis
    let birthdayDiscountValue = 0;
    if (userDiscounts.specialDiscounts?.birthdayDiscount) {
      const cake = normalizedCartItems.find(item => 
        item.category?.toLowerCase().includes('torta') || 
        item.name.toLowerCase().includes('torta')
      );
      if (cake) {
        birthdayDiscountValue = cake.price * cake.quantity;
      }
    }

    const totalDiscountsValue = ageDiscountValue + codeDiscountValue + birthdayDiscountValue;
    const totalValue = Math.max(0, subtotalValue - totalDiscountsValue);

    return {
      subtotal: subtotalValue,
      ageDiscount: ageDiscountValue,
      codeDiscount: codeDiscountValue,
      birthdayDiscount: birthdayDiscountValue,
      totalDiscounts: totalDiscountsValue,
      total: totalValue
    };
  }, [normalizedCartItems, currentUser]);

  // Aplicar código de descuento
  const applyDiscountCode = () => {
    if (discountCode.toUpperCase() === 'FELICES50') {
      localStorage.setItem('discountCode', 'FELICES50');
      setDiscountMessage('¡10% de descuento aplicado! Recarga para ver el efecto.');
      setDiscountCode('');
    } else {
      setDiscountMessage('Código no válido');
    }
  };

  // Funciones para manejar la edición del quantity CORREGIDAS
  const startEditing = (item) => {
    setEditingItemId(item.id);
    setEditQuantity(item.quantity.toString());
  };

  const cancelEditing = () => {
    setEditingItemId(null);
    setEditQuantity('');
  };

  const saveQuantity = async (itemId) => {
    let newQuantity = parseInt(editQuantity) || 1;
    const maxStock = productStocks[itemId] || 100;

    // Validar stock máximo
    if (newQuantity > maxStock) {
      newQuantity = maxStock;
      setDiscountMessage(`Stock máximo disponible: ${maxStock} unidades`);
    }

    if (newQuantity < 1) {
      onRemoveItem(itemId);
    } else {
      onUpdateQuantity(itemId, newQuantity);
    }

    setEditingItemId(null);
    setEditQuantity('');
  };

  const handleQuantityKeyPress = (e, itemId) => {
    if (e.key === 'Enter') {
      saveQuantity(itemId);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // Incrementar cantidad con validación de stock
  const handleIncrement = (itemId, currentQuantity) => {
    const maxStock = productStocks[itemId] || 100;
    if (currentQuantity < maxStock) {
      onUpdateQuantity(itemId, currentQuantity + 1);
    } else {
      setDiscountMessage(`Stock máximo: ${maxStock} unidades`);
    }
  };

  // Decrementar cantidad
  const handleDecrement = (itemId, currentQuantity) => {
    if (currentQuantity > 1) {
      onUpdateQuantity(itemId, currentQuantity - 1);
    } else {
      onRemoveItem(itemId);
    }
  };

  // Resetear al cerrar
  useEffect(() => {
    if (!show) {
      setDiscountCode('');
      setDiscountMessage('');
      setEditingItemId(null);
      setEditQuantity('');
    }
  }, [show]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyDiscountCode();
    }
  };

  const handleProceedToCheckout = () => {
    onClose();
    navigate('/checkout');
  };

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
                
                return (
                  <div key={item.id} className="cart-item d-flex align-items-center p-2 border-bottom">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item-image rounded me-3"
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                    />
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
                            disabled={item.quantity <= 1}
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
                              onClick={() => startEditing(item)}
                              title="Haz clic para editar la cantidad"
                              style={{ cursor: 'pointer', minWidth: '30px', textAlign: 'center' }}
                            >
                              {item.quantity}
                            </span>
                          )}
                          
                          <button
                            className="cart-item-increase btn btn-outline-secondary btn-sm"
                            onClick={() => handleIncrement(item.id, item.quantity)}
                            disabled={item.quantity >= maxStock}
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
                            onClick={() => onRemoveItem(item.id)}
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
            <div className="discount-section mt-3 p-3 bg-light rounded">
              <h6 className="mb-2">¿Tienes un código de descuento?</h6>
              {discountMessage && (
                <div className={`small ${discountMessage.includes('no válido') ? 'text-danger' : 'text-success'}`}>
                  {discountMessage}
                </div>
              )}

              <div className="mt-2">
                {currentUser && (
                  <>
                    {ageDiscount > 0 && (
                      <div className="alert alert-success py-2 small mb-2">
                        <i className="bi bi-coin me-2"></i> 50% de descuento para mayores de 50 años
                      </div>
                    )}
                    {codeDiscount > 0 && (
                      <div className="alert alert-success py-2 small mb-2">
                        <i className="bi bi-tag me-2"></i> 10% de descuento con código FELICES50
                      </div>
                    )}
                    {birthdayDiscount > 0 && (
                      <div className="alert alert-success py-2 small mb-2">
                        <i className="bi bi-gift me-2"></i> ¡Torta gratis en tu cumpleaños!
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

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