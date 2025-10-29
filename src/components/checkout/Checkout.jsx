import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Breadcrumb, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CheckoutSummary from './CheckoutSummary';
import ShippingInfo from './ShippingInfo';
import PaymentMethod from './PaymentMethod';
import OrderConfirmation from './OrderConfirmation';
import { formatPrice } from '../../utils/formatters';
import { getSpecialDiscounts } from '../../data/users';
import { calculateShippingCost } from '../../services/shippingService';
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
  const [userDiscounts, setUserDiscounts] = useState({});
  const [shippingCost, setShippingCost] = useState(0);
  const [isShippingFree, setIsShippingFree] = useState(false);
  const [shippingConfig, setShippingConfig] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Calcular subtotal
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Cargar items del carrito y descuentos del usuario
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(cart);

    if (currentUser) {
      const discounts = getSpecialDiscounts(currentUser);
      setUserDiscounts(discounts);
    }

    if (cart.length === 0 && currentStep === 1) {
      navigate('/productos');
    }
  }, [navigate, currentStep, currentUser]);

  // Calcular envío cuando cambia región o subtotal - UNIFICADO
  useEffect(() => {
    const calculateShipping = async () => {
      // Si tenemos región en shippingInfo, usar esa
      const regionId = orderData.shippingInfo?.region;
      
      if (regionId) {
        try {
          const shippingResult = await calculateShippingCost(regionId, subtotal);
          
          setShippingCost(shippingResult.costo);
          setIsShippingFree(shippingResult.esGratis);
          setShippingConfig(shippingResult.config);
        } catch (error) {
          console.error('Error calculando envío:', error);
          // Fallback básico
          const fallbackCost = subtotal >= 50000 ? 0 : 3000;
          setShippingCost(fallbackCost);
          setIsShippingFree(subtotal >= 50000);
        }
      } else {
        // Sin región seleccionada - costo por defecto
        const defaultCost = subtotal >= 50000 ? 0 : 3000;
        setShippingCost(defaultCost);
        setIsShippingFree(subtotal >= 50000);
      }
    };

    calculateShipping();
  }, [orderData.shippingInfo?.region, subtotal]);

  // Calcular descuentos y total
  let discountAmount = 0;
  if (userDiscounts.seniorDiscount) {
    discountAmount += subtotal * 0.5;
  }
  if (userDiscounts.codeDiscount) {
    discountAmount += subtotal * 0.1;
  }

  const total = Math.max(0, subtotal - discountAmount + shippingCost);

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
    setCurrentStep(4);
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
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Inicio</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/productos' }}>Productos</Breadcrumb.Item>
        <Breadcrumb.Item active>Checkout</Breadcrumb.Item>
      </Breadcrumb>

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
                  discountAmount={discountAmount}
                  userDiscounts={userDiscounts}
                />
              )}

              {currentStep === 2 && (
                <ShippingInfo
                  onNextStep={handleNextStep}
                  onPreviousStep={handlePreviousStep}
                  initialData={orderData.shippingInfo}
                  currentUser={currentUser}
                  subtotal={subtotal}
                  shippingCost={shippingCost}
                  shippingConfig={shippingConfig}
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
                  discountAmount={discountAmount}
                  userDiscounts={userDiscounts}
                  shippingCost={shippingCost}
                />
              )}
            </Card.Body>
          </Card>
        </Col>

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

                {/* MOSTRAR DESCUENTOS APLICADOS */}
                {discountAmount > 0 && (
                  <>
                    <div className="d-flex justify-content-between mb-2 text-success">
                      <span>Descuentos:</span>
                      <span>-${formatPrice(discountAmount)}</span>
                    </div>
                    {userDiscounts.seniorDiscount && (
                      <div className="small text-success mb-1">
                        <i className="bi bi-coin me-1"></i>
                        50% descuento (Mayor de 50 años)
                      </div>
                    )}
                    {userDiscounts.codeDiscount && (
                      <div className="small text-success mb-1">
                        <i className="bi bi-tag me-1"></i>
                        10% descuento adicional
                      </div>
                    )}
                  </>
                )}

                <div className="d-flex justify-content-between mb-2">
                  <span>Envío:</span>
                  <span>{shippingCost === 0 ? 'GRATIS' : `$${formatPrice(shippingCost)}`}</span>
                </div>
                
                {/* INFORMACIÓN DE ENVÍO DINÁMICA */}
                {shippingConfig && (
                  <div className={`small mb-2 ${shippingCost === 0 ? 'text-success' : 'text-muted'}`}>
                    <i className={`${shippingConfig.icon} me-1`}></i>
                    {shippingCost === 0 ? (
                      `¡Envío GRATIS para ${shippingConfig.name}!`
                    ) : (
                      `Envío ${shippingConfig.name} - Gratis desde $${formatPrice(shippingConfig.costoGratisDesde)}`
                    )}
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