import React, { useState, useEffect } from 'react';
import { formatPrice } from '../../utils/formatters';

const CartOffCanvas = ({ show, onClose, cartItems, onUpdateQuantity, onRemoveItem }) => {
  const [discountCode, setDiscountCode] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');
  const [appliedDiscounts, setAppliedDiscounts] = useState({
    age: false,
    code: false,
    birthday: false
  });

  // Calcular totales
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Calcular descuentos
  const ageDiscount = appliedDiscounts.age ? subtotal * 0.5 : 0;
  const codeDiscount = appliedDiscounts.code ? subtotal * 0.1 : 0;
  const birthdayDiscount = appliedDiscounts.birthday ? 0 : 0;
  
  const totalDiscounts = ageDiscount + codeDiscount + birthdayDiscount;
  const total = subtotal - totalDiscounts;

  // Aplicar código de descuento
  const applyDiscountCode = () => {
    if (discountCode.toUpperCase() === 'FELICES50') {
      setAppliedDiscounts(prev => ({ ...prev, code: true }));
      setDiscountMessage('¡10% de descuento aplicado!');
    } else {
      setDiscountMessage('Código no válido');
    }
  };

  // Resetear descuentos cuando se cierra el carrito
  useEffect(() => {
    if (!show) {
      setDiscountCode('');
      setDiscountMessage('');
      setAppliedDiscounts({
        age: false,
        code: false,
        birthday: false
      });
    }
  }, [show]);

  // Manejar tecla Enter para aplicar descuento
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyDiscountCode();
    }
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
        {cartItems.length === 0 ? (
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
              {cartItems.map(item => (
                <div key={item.id} className="cart-item d-flex align-items-start p-2 border-bottom">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="cart-item-image rounded"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                  <div className="flex-grow-1 ms-3">
                    <h6 className="mb-1">{item.name}</h6>
                    <div className="d-flex align-items-center">
                      <div className="quantity-selector d-flex align-items-center border rounded">
                        <button 
                          className="cart-item-decrease btn btn-sm border-0"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-2">{item.quantity}</span>
                        <button 
                          className="cart-item-increase btn btn-sm border-0"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="cart-item-price ms-3 fw-bold">
                        ${formatPrice(item.price * item.quantity)}
                      </div>
                      <button 
                        className="cart-item-remove btn btn-outline-danger btn-sm ms-2"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="discount-section mt-3 p-3 bg-light rounded">
              <h6 className="mb-2">¿Tienes un código de descuento?</h6>
              <div className="input-group mb-2">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ingresa tu código" 
                  id="discount-code-input"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button 
                  className="btn btn-outline-primary" 
                  type="button" 
                  id="apply-discount-btn"
                  onClick={applyDiscountCode}
                >
                  Aplicar
                </button>
              </div>
              {discountMessage && (
                <div id="discount-message" className={`small ${discountMessage.includes('no válido') ? 'text-danger' : 'text-success'}`}>
                  {discountMessage}
                </div>
              )}

              <div id="applied-discounts" className="mt-2">
                {appliedDiscounts.age && (
                  <div className="alert alert-success py-2 small mb-2">
                    <i className="bi bi-coin me-2"></i> 50% de descuento para mayores de 50 años
                  </div>
                )}
                {appliedDiscounts.code && (
                  <div className="alert alert-success py-2 small mb-2">
                    <i className="bi bi-tag me-2"></i> 10% de descuento con código FELICES50
                  </div>
                )}
                {appliedDiscounts.birthday && (
                  <div className="alert alert-success py-2 small mb-2">
                    <i className="bi bi-gift me-2"></i> ¡Torta gratis en tu cumpleaños!
                  </div>
                )}
              </div>
            </div>

            <div className="cart-summary mt-3 p-3 border-top">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Subtotal:</span>
                <span id="cart-subtotal">${formatPrice(subtotal)}</span>
              </div>
              
              {totalDiscounts > 0 && (
                <div className="d-flex justify-content-between align-items-center mb-2 text-success">
                  <span>Descuentos:</span>
                  <span id="cart-discounts">-${formatPrice(totalDiscounts)}</span>
                </div>
              )}
              
              <div className="d-flex justify-content-between align-items-center mb-3 fw-bold fs-5">
                <span>Total:</span>
                <span id="cart-total">${formatPrice(total)}</span>
              </div>
              
              <div className="d-grid gap-2">
                <button className="btn proceed-payment-btn btn-primary" id="proceed-to-checkout">
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