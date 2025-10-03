// src/components/checkout/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Breadcrumb, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import CheckoutSummary from './CheckoutSummary';
import ShippingInfo from './ShippingInfo';
import PaymentMethod from './PaymentMethod';
import OrderConfirmation from './OrderConfirmation';
import { formatPrice } from '../../utils/formatters';
import './../../styles/components/checkout.css';

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [orderData, setOrderData] = useState({
    shippingInfo: {},
    paymentMethod: '',
    orderNotes: ''
  });
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const navigate = useNavigate();

  // Cargar items del carrito
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(cart);

    // Si el carrito está vacío, redirigir a productos
    if (cart.length === 0 && currentStep === 1) {
      navigate('/productos');
    }
  }, [navigate, currentStep]);

  // Calcular totales
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingCost = subtotal > 50000 ? 0 : 3000; // Envío gratis sobre $50,000
  const total = subtotal + shippingCost;

  const updateCartQuantity = (productId, newQuantity) => {
    const updatedItems = cartItems.map(item =>
      item.id === productId ? { ...item, quantity: Math.max(0, newQuantity) } : item
    ).filter(item => item.quantity > 0);
    
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeFromCart = (productId) => {
    const updatedItems = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleNextStep = (data = {}) => {
    setOrderData(prev => ({ ...prev, ...data }));
    setCurrentStep(prev => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleOrderComplete = (orderId) => {
    setOrderComplete(true);
    setOrderNumber(orderId);
    // Limpiar carrito después de completar la orden
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const steps = [
    { number: 1, title: 'Resumen', active: currentStep === 1, completed: currentStep > 1 },
    { number: 2, title: 'Envío', active: currentStep === 2, completed: currentStep > 2 },
    { number: 3, title: 'Pago', active: currentStep === 3, completed: currentStep > 3 },
    { number: 4, title: 'Confirmación', active: currentStep === 4, completed: currentStep > 4 }
  ];

  if (orderComplete) {
    return <OrderConfirmation orderNumber={orderNumber} orderData={orderData} />;
  }

  return (
    <Container className="checkout-container py-4">
      {/* Migas de pan */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Inicio</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/productos' }}>Productos</Breadcrumb.Item>
        <Breadcrumb.Item active>Checkout</Breadcrumb.Item>
      </Breadcrumb>

      {/* Progreso del checkout */}
      <Row className="mb-5">
        <Col>
          <div className="checkout-progress">
            {steps.map(step => (
              <div key={step.number} className={`progress-step ${step.active ? 'active' : ''} ${step.completed ? 'completed' : ''}`}>
                <div className="step-number">{step.number}</div>
                <div className="step-title">{step.title}</div>
              </div>
            ))}
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Columna principal - Pasos del checkout */}
        <Col lg={8}>
          <Card className="checkout-card">
            <Card.Body className="p-4">
              {currentStep === 1 && (
                <CheckoutSummary
                  cartItems={cartItems}
                  onUpdateQuantity={updateCartQuantity}
                  onRemoveItem={removeFromCart}
                  onNextStep={handleNextStep}
                  subtotal={subtotal}
                  shippingCost={shippingCost}
                  total={total}
                />
              )}

              {currentStep === 2 && (
                <ShippingInfo
                  onNextStep={handleNextStep}
                  onPreviousStep={handlePreviousStep}
                  initialData={orderData.shippingInfo}
                />
              )}

              {currentStep === 3 && (
                <PaymentMethod
                  onNextStep={handleNextStep}
                  onPreviousStep={handlePreviousStep}
                  onOrderComplete={handleOrderComplete}
                  orderData={orderData}
                  cartItems={cartItems}
                  total={total}
                />
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Columna lateral - Resumen del pedido */}
        <Col lg={4}>
          <Card className="order-summary-card">
            <Card.Header>
              <h5 className="mb-0">Resumen del Pedido</h5>
            </Card.Header>
            <Card.Body>
              <div className="order-items">
                {cartItems.map(item => (
                  <div key={item.id} className="order-item d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <span className="fw-semibold">{item.quantity}x</span> {item.name}
                    </div>
                    <div className="text-end">
                      <div>${formatPrice(item.price * item.quantity)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <hr />

              <div className="order-totals">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>${formatPrice(subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Envío:</span>
                  <span>{shippingCost === 0 ? 'GRATIS' : `$${formatPrice(shippingCost)}`}</span>
                </div>
                {shippingCost === 0 && subtotal < 50000 && (
                  <div className="text-success small mb-2">
                    <i className="bi bi-truck me-1"></i>
                    Envío gratis sobre $50,000
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total:</span>
                  <span>${formatPrice(total)}</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Información de seguridad */}
          <Card className="mt-3 security-info-card">
            <Card.Body className="text-center">
              <i className="bi bi-shield-check text-primary fs-1 mb-3"></i>
              <h6>Compra 100% Segura</h6>
              <p className="small text-muted mb-0">
                Tus datos están protegidos con encriptación SSL
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;