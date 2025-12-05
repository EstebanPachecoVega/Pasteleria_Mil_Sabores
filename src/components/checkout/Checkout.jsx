import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Breadcrumb, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CheckoutSummary from './CheckoutSummary';
import ShippingInfo from './ShippingInfo';
import PaymentMethod from './PaymentMethod';
import OrderConfirmation from './OrderConfirmation';
import { formatPrice } from '../../utils/formatters';
import { calculateShippingCost } from '../../services/shippingService';

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
  const [hasRegionSelected, setHasRegionSelected] = useState(false);
  const [isShippingLoading, setIsShippingLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Función para calcular edad desde birthDate
  const calculateAge = (birthDateString) => {
    if (!birthDateString) return 0;
    
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Función para verificar si es cumpleaños
  const isBirthdayToday = (birthDateString) => {
    if (!birthDateString) return false;
    
    const birthDate = new Date(birthDateString);
    const today = new Date();
    
    return today.getMonth() === birthDate.getMonth() && 
           today.getDate() === birthDate.getDate();
  };

  // Normalizar items
  const normalizeCartItem = (item) => ({
    id: item.id || item.productId,
    name: item.nombre || item.name || 'Producto sin nombre',
    price: Number(item.precio || item.price || 0),
    quantity: Number(item.cantidad || item.quantity || 1),
    image: item.image || item.imagen || '/images/productos/default.png',
    categoryName: item.categoriaNombre || item.categoryName || '',
    stock: item.stock || 0
  });

  // Cargar items
  useEffect(() => {
    const loadCartItems = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const normalizedCart = cart.map(normalizeCartItem);
        setCartItems(normalizedCart);
        
        if (normalizedCart.length === 0 && currentStep === 1) {
          navigate('/productos');
        }
      } catch (error) {
        console.error('Error al cargar carrito:', error);
        setCartItems([]);
      }
    };

    loadCartItems();
    window.addEventListener('cartUpdated', loadCartItems);
    return () => window.removeEventListener('cartUpdated', loadCartItems);
  }, [navigate, currentStep]);

  // Calcular descuentos
  const { discountAmount, discounts } = useMemo(() => {
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    let discountAmount = 0;
    const discounts = {};
    
    if (currentUser) {
      // Calcular edad desde birthDate
      const userAge = calculateAge(currentUser.birthDate);
      console.log('📅 Edad calculada:', userAge, 'años');
      
      if (userAge >= 50) {
        discountAmount += subtotal * 0.5;
        discounts.seniorDiscount = true;
      }
      
      // Verificar código de descuento
      const discountCode = localStorage.getItem('discountCode');
      if (discountCode === 'FELICES50') {
        discountAmount += subtotal * 0.1;
        discounts.codeDiscount = true;
      }
      
      // Verificar cumpleaños
      if (isBirthdayToday(currentUser.birthDate)) {
        const cakeItem = cartItems.find(item => 
          item.categoryName?.toLowerCase().includes('torta') || 
          item.name.toLowerCase().includes('torta')
        );
        if (cakeItem) {
          discountAmount += cakeItem.price * cakeItem.quantity;
          discounts.birthdayDiscount = true;
        }
      }
    }
    
    return { discountAmount, discounts };
  }, [cartItems, currentUser]);

  // Calcular subtotal
  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  // Calcular total
  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + (hasRegionSelected ? shippingCost : 0));
  }, [subtotal, discountAmount, shippingCost, hasRegionSelected]);

  // Manejar envío
  const handleShippingCostChange = (shippingData) => {
    setShippingCost(shippingData.costo);
    setShippingConfig(shippingData.config);
    setIsShippingFree(shippingData.costo === 0);
    setHasRegionSelected(!!shippingData.config);
  };

  // Calcular envío automático
  useEffect(() => {
    const calculateShipping = async () => {
      const regionId = orderData.shippingInfo?.region;
      
      if (regionId) {
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

    calculateShipping();
  }, [orderData.shippingInfo?.region, subtotal]);

  // Funciones del carrito
  const updateCartQuantity = (productId, newQuantity) => {
    const updatedItems = cartItems.map(item =>
      item.id === productId ? { ...item, quantity: Math.max(1, newQuantity) } : item
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

  // Navegación
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
    localStorage.removeItem('discountCode');
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Steps
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
                  userDiscounts={discounts}
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
                  userDiscounts={discounts}
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
            <Card className="order-summary-card mb-3">
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

                  {discountAmount > 0 && (
                    <>
                      <div className="d-flex justify-content-between mb-2 text-success">
                        <span>Descuentos:</span>
                        <span>-${formatPrice(discountAmount)}</span>
                      </div>
                      {discounts.seniorDiscount && (
                        <div className="small text-success mb-1">
                          <i className="bi bi-coin me-1"></i>
                          50% descuento (Mayor de 50 años)
                        </div>
                      )}
                      {discounts.codeDiscount && (
                        <div className="small text-success mb-1">
                          <i className="bi bi-tag me-1"></i>
                          10% descuento adicional
                        </div>
                      )}
                      {discounts.birthdayDiscount && (
                        <div className="small text-success mb-1">
                          <i className="bi bi-gift me-1"></i>
                          Torta gratis en cumpleaños
                        </div>
                      )}
                    </>
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
                      <span>{shippingCost === 0 ? 'GRATIS' : `$${formatPrice(shippingCost)}`}</span>
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