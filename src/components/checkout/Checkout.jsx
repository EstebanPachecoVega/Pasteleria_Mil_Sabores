// components/Checkout/Checkout.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Col, Card, Breadcrumb, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCartContext } from '../../context/CartContext';
import CheckoutSummary from './CheckoutSummary';
import ShippingInfo from './ShippingInfo';
import PaymentMethod from './PaymentMethod';
import OrderConfirmation from './OrderConfirmation';
import { formatPrice } from '../../utils/formatters';
import { calculateShippingCost } from '../../services/shippingService';
import { calculateUserDiscounts } from '../../data/users';

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState({
    shippingInfo: {},
    paymentMethod: '',
    orderNotes: ''
  });
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [userDiscounts, setUserDiscounts] = useState({});
  const [discountDetails, setDiscountDetails] = useState([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [isShippingFree, setIsShippingFree] = useState(false);
  const [shippingConfig, setShippingConfig] = useState(null);
  const [hasRegionSelected, setHasRegionSelected] = useState(false);
  const [isShippingLoading, setIsShippingLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Usar el contexto del carrito
  const {
    cartItems,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    productStocks,
    isLoading: cartLoading
  } = useCartContext();

  console.log('🔍 Checkout: Estado del carrito -', {
    cartItems: cartItems.length,
    cartLoading,
    productStocks: Object.keys(productStocks).length
  });

  // Redirigir si el carrito está vacío - PERO ESPERAR A QUE CARGUE
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0 && currentStep === 1 && !orderComplete) {
      console.log('⚠️ Checkout: Carrito vacío después de cargar, redirigiendo');
      navigate('/productos');
    }
  }, [cartItems, currentStep, orderComplete, navigate, cartLoading]);

  // Calcular descuentos
  useEffect(() => {
    const calculateDiscounts = async () => {
      if (currentUser && cartItems.length > 0) {
        const subtotal = cartItems.reduce((total, item) => {
          const price = item.precio || item.price || 0;
          const quantity = item.quantity || item.cantidad || 1;
          return total + (price * quantity);
        }, 0);

        try {
          const discountResult = await calculateUserDiscounts(currentUser, subtotal, cartItems);

          setUserDiscounts(discountResult.specialDiscounts);
          setDiscountAmount(discountResult.discountAmount);
          setDiscountDetails(discountResult.discountDetails);
        } catch (error) {
          console.error('Error calculando descuentos:', error);
          setUserDiscounts({});
          setDiscountAmount(0);
          setDiscountDetails([]);
        }
      } else {
        setUserDiscounts({});
        setDiscountAmount(0);
        setDiscountDetails([]);
      }
    };

    if (!cartLoading) {
      calculateDiscounts();
    }
  }, [cartItems, currentUser, cartLoading]);

  // Calcular subtotal
  const subtotal = useMemo(() => {
    if (cartLoading) return 0;
    
    const total = cartItems.reduce((total, item) => {
      const price = item.precio || item.price || 0;
      const quantity = item.quantity || item.cantidad || 1;
      return total + (price * quantity);
    }, 0);
    
    console.log('🔍 Checkout: Subtotal calculado:', total);
    return total;
  }, [cartItems, cartLoading]);

  // Calcular total
  const total = useMemo(() => {
    if (cartLoading) return 0;
    
    const calculatedTotal = Math.max(0, subtotal - discountAmount + (hasRegionSelected ? shippingCost : 0));
    console.log('🔍 Checkout: Total calculado:', calculatedTotal);
    return calculatedTotal;
  }, [subtotal, discountAmount, shippingCost, hasRegionSelected, cartLoading]);

  // Calcular envío automático
  useEffect(() => {
    const calculateShipping = async () => {
      const regionId = orderData.shippingInfo?.region;

      if (regionId && !cartLoading) {
        try {
          setIsShippingLoading(true);
          const shippingResult = await calculateShippingCost(regionId, subtotal);

          setShippingCost(shippingResult.costo);
          setIsShippingFree(shippingResult.esGratis);
          setShippingConfig(shippingResult.config);
          setHasRegionSelected(true);
        } catch (error) {
          console.error('Error calculando envío:', error);
          const fallbackCost = subtotal >= 50000 ? 0 : 3000;
          setShippingCost(fallbackCost);
          setIsShippingFree(subtotal >= 50000);
        } finally {
          setIsShippingLoading(false);
        }
      } else {
        setShippingCost(0);
        setIsShippingFree(false);
        setShippingConfig(null);
        setHasRegionSelected(false);
      }
    };

    if (!cartLoading) {
      calculateShipping();
    }
  }, [orderData.shippingInfo?.region, subtotal, cartLoading]);

  // Manejar envío
  const handleShippingCostChange = useCallback((shippingData) => {
    setShippingCost(shippingData.costo);
    setShippingConfig(shippingData.config);
    setIsShippingFree(shippingData.costo === 0);
    setHasRegionSelected(!!shippingData.config);
  }, []);

  // Navegación
  const handleNextStep = useCallback((data = {}) => {
    setOrderData(prev => ({ ...prev, ...data }));
    setCurrentStep(prev => prev + 1);
  }, []);

  const handlePreviousStep = useCallback(() => {
    setCurrentStep(prev => prev - 1);
  }, []);

  const handleOrderComplete = useCallback((orderId) => {
    console.log('Checkout: Orden completada con ID:', orderId);
    setOrderComplete(true);
    setOrderNumber(orderId);
    setCurrentStep(4);
    clearCart(); // Limpiar carrito después de completar la orden
    localStorage.removeItem('discountCode');
  }, [clearCart]);

  // Steps
  const steps = [
    { number: 1, title: 'Resumen', active: currentStep === 1, completed: currentStep > 1 },
    { number: 2, title: 'Envío', active: currentStep === 2, completed: currentStep > 2 },
    { number: 3, title: 'Pago', active: currentStep === 3, completed: currentStep > 3 },
    { number: 4, title: 'Confirmación', active: currentStep === 4, completed: currentStep > 4 }
  ];

  // Mostrar loading mientras el carrito carga
  if (cartLoading) {
    return (
      <Container className="checkout-container py-4">
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando carrito...</span>
          </Spinner>
          <p className="mt-3">Cargando tu carrito...</p>
        </div>
      </Container>
    );
  }

  // Si el carrito está vacío después de cargar, ya se redirigió
  if (cartItems.length === 0 && !orderComplete) {
    return (
      <Container className="checkout-container py-4">
        <div className="text-center py-5">
          <i className="bi bi-cart-x" style={{ fontSize: '3rem' }}></i>
          <h4 className="mt-3">Tu carrito está vacío</h4>
          <p className="text-muted">Serás redirigido a los productos...</p>
          <Link to="/productos" className="btn btn-primary mt-3">
            Ver Productos
          </Link>
        </div>
      </Container>
    );
  }

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

      <Row className="mb-4">
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
                  discountDetails={discountDetails}
                  productStocks={productStocks}
                  shippingConfig={shippingConfig}
                  hasRegionSelected={hasRegionSelected}
                  isShippingLoading={isShippingLoading}
                />
              )}

              {currentStep === 2 && (
                <ShippingInfo
                  onNextStep={handleNextStep}
                  onPreviousStep={handlePreviousStep}
                  initialData={orderData.shippingInfo}
                  currentUser={currentUser}
                  subtotal={subtotal}
                  onShippingCostChange={handleShippingCostChange}
                  isShippingLoading={isShippingLoading}
                  setIsShippingLoading={setIsShippingLoading}
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
                  discountDetails={discountDetails}
                  shippingCost={shippingCost}
                  hasRegionSelected={hasRegionSelected}
                  isShippingLoading={isShippingLoading}
                />
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <div className="sticky-sidebar">
            <Card className="order-summary-card">
              <Card.Header>
                <h5 className="mb-0">Resumen del Pedido</h5>
              </Card.Header>
              <Card.Body>
                <div className="order-items">
                  {cartItems.map(item => {
                    const maxStock = productStocks[item.id] || item.stock || 100;
                    const stockAvailable = maxStock - item.quantity;

                    return (
                      <div key={item.id} className="order-item d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                        <div>
                          <span className="fw-semibold">{item.quantity}x</span> {item.nombre || item.name}
                          {stockAvailable <= 5 && stockAvailable > 0 && (
                            <small className="text-warning d-block">
                              <i className="bi bi-exclamation-triangle me-1"></i>
                              Solo {stockAvailable} disponible(s)
                            </small>
                          )}
                        </div>
                        <div className="text-end">
                          <div>${formatPrice((item.precio || item.price || 0) * item.quantity)}</div>
                          {item.quantity > maxStock && (
                            <small className="text-danger d-block">
                              Stock máximo: {maxStock}
                            </small>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <hr />

                <div className="order-totals">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>${formatPrice(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="d-flex justify-content-between mb-2 text-success">
                      <span>Descuentos:</span>
                      <span>-${formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  {isShippingLoading ? (
                    <div className="d-flex justify-content-between mb-2">
                      <span>Envío:</span>
                      <span>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Calculando...
                      </span>
                    </div>
                  ) : hasRegionSelected ? (
                    <div className="d-flex justify-content-between mb-2">
                      <span>Envío:</span>
                      <span className={shippingCost === 0 ? 'text-success fw-bold' : ''}>
                        {shippingCost === 0 ? 'GRATIS' : `$${formatPrice(shippingCost)}`}
                      </span>
                    </div>
                  ) : null}

                  <hr />
                  <div className="d-flex justify-content-between fw-bold fs-5">
                    <span>Total:</span>
                    <span>${formatPrice(total)}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;