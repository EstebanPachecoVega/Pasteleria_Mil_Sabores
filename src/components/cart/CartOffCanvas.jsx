import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters';

const CartOffCanvas = ({ show, onClose, cartItems, onUpdateQuantity, onRemoveItem }) => {
  const [discountCode, setDiscountCode] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');
  const [appliedDiscounts, setAppliedDiscounts] = useState({
    age: false,
    code: false,
    birthday: false
  });

  const [editingItemId, setEditingItemId] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const navigate = useNavigate();

  // Calcular totales con useMemo para optimización
  const { subtotal, ageDiscount, codeDiscount, birthdayDiscount, totalDiscounts, total } = useMemo(() => {
    const subtotalValue = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const ageDiscountValue = appliedDiscounts.age ? subtotalValue * 0.5 : 0;
    const codeDiscountValue = appliedDiscounts.code ? subtotalValue * 0.1 : 0;
    const birthdayDiscountValue = appliedDiscounts.birthday ? 0 : 0;
    const totalDiscountsValue = ageDiscountValue + codeDiscountValue + birthdayDiscountValue;
    const totalValue = subtotalValue - totalDiscountsValue;

    return {
      subtotal: subtotalValue,
      ageDiscount: ageDiscountValue,
      codeDiscount: codeDiscountValue,
      birthdayDiscount: birthdayDiscountValue,
      totalDiscounts: totalDiscountsValue,
      total: totalValue
    };
  }, [cartItems, appliedDiscounts]);

  // Aplicar código de descuento
  const applyDiscountCode = () => {
    if (discountCode.toUpperCase() === 'FELICES50') {
      setAppliedDiscounts(prev => ({ ...prev, code: true }));
      setDiscountMessage('¡10% de descuento aplicado!');
    } else {
      setDiscountMessage('Código no válido');
    }
  };

  // Funciones para manejar la edición del quantity
  const startEditing = (item) => {
    setEditingItemId(item.id);
    setEditQuantity(item.quantity.toString());
  };

  const cancelEditing = () => {
    setEditingItemId(null);
    setEditQuantity('');
  };

  const saveQuantity = (itemId) => {
    let newQuantity = parseInt(editQuantity);

    // Validaciones
    if (isNaN(newQuantity) || newQuantity < 1) {
      onRemoveItem(itemId);
    } else if (newQuantity > 100) {
      onUpdateQuantity(itemId, 100);
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

  // Resetear descuentos y edición cuando se cierra el carrito
  useEffect(() => {
    if (!show) {
      setDiscountCode('');
      setDiscountMessage('');
      setAppliedDiscounts({
        age: false,
        code: false,
        birthday: false
      });
      setEditingItemId(null);
      setEditQuantity('');
    }
  }, [show]);

  // Manejar tecla Enter para aplicar descuento
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyDiscountCode();
    }
  };

  // Función para proceder al checkout
  const handleProceedToCheckout = () => {
    onClose(); // Cerrar el offcanvas
    navigate('/checkout'); // Navegar al checkout
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
                <div key={item.id} className="cart-item d-flex align-items-center p-2 border-bottom">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-image rounded me-3"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                  <div className="cart-item-details flex-grow-1">
                    <h6 className="mb-2">{item.name}</h6>
                    <div className="cart-item-controls d-flex align-items-center justify-content-between w-100">
                      <div className="quantity-selector d-flex align-items-center">
                        <button
                          className="cart-item-decrease"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Disminuir cantidad"
                        >
                          -
                        </button>
                        {editingItemId === item.id ? (
                          <div className="quantity-edit-container position-relative">
                            <input
                              type="number"
                              className="quantity-input"
                              value={editQuantity}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                // Limitar a máximo 100
                                const numericValue = parseInt(value) || 0;
                                if (numericValue <= 100) {
                                  setEditQuantity(value);
                                } else {
                                  setEditQuantity('100');
                                }
                              }}
                              onKeyPress={(e) => handleQuantityKeyPress(e, item.id)}
                              onBlur={() => saveQuantity(item.id)}
                              autoFocus
                              min="1"
                              max="100"
                              aria-label="Editar cantidad"
                            />
                          </div>
                        ) : (
                          <span
                            className="quantity-number editable"
                            onClick={() => startEditing(item)}
                            title="Haz clic para editar la cantidad"
                          >
                            {item.quantity}
                          </span>
                        )}
                        <button
                          className="cart-item-increase"
                          onClick={() => {
                            if (item.quantity < 100) {
                              onUpdateQuantity(item.id, item.quantity + 1);
                            }
                          }}
                          disabled={item.quantity >= 100}
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
                  </div>
                </div>
              ))}
            </div>

            {/* Sección de descuentos y resumen */}
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
                <button
                  className="btn proceed-payment-btn"
                  id="proceed-to-checkout"
                  onClick={handleProceedToCheckout}  // ← ESTA LÍNEA FUE AGREGADA
                >
                  <i className="bi bi-credit-card me-2"></i>
                  Proceder al Pago
                </button>
                <button className="btn continue-shopping-btn btn-outline-secondary" onClick={onClose}>
                  Continuar Comprando
                </button>
              </div>
              {/* Información adicional del checkout */}
              <div className="checkout-info mt-3 p-2 bg-light rounded small">
                <div className="d-flex align-items-center mb-1">
                  <i className="bi bi-shield-check text-success me-2"></i>
                  <span>Compra 100% segura</span>
                </div>
                <div className="d-flex align-items-center mb-1">
                  <i className="bi bi-truck text-primary me-2"></i>
                  <span>Envío gratis sobre $50.000</span>
                </div>
              </div>              
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartOffCanvas;