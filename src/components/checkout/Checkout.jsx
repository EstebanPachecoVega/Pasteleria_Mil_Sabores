import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Col, Card, Breadcrumb, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CheckoutSummary from './CheckoutSummary';
import ShippingInfo from './ShippingInfo';
import PaymentMethod from './PaymentMethod';
import OrderConfirmation from './OrderConfirmation';
import { formatPrice } from '../../utils/formatters';
import { calculateShippingCost } from '../../services/shippingService';
import { obtenerProductoPorId } from '../../services/productService';
import { calculateUserDiscounts } from '../../data/users';

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [productStocks, setProductStocks] = useState({});
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

  // Normalizar items
  const normalizeCartItem = useCallback((item) => ({
    id: item.id || item.productId,
    name: item.nombre || item.name || 'Producto sin nombre',
    price: Number(item.precio || item.price || 0),
    quantity: Number(item.cantidad || item.quantity || 1),
    image: item.image || item.imagen || '/images/productos/default.png',
    categoryName: item.categoriaNombre || item.categoryName || '',
    stock: item.stock || 0,
    maxStock: item.maxStock || 0
  }), []);

  // Cargar items y stock de manera optimizada
  const loadCartItems = useCallback(async () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const normalizedCart = cart.map(normalizeCartItem);

      // Cargar stocks solo si hay cambios
      const stockPromises = normalizedCart.map(async (item) => {
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

      setCartItems(normalizedCart);
      setProductStocks(stockMap);

      if (normalizedCart.length === 0 && currentStep === 1) {
        navigate('/productos');
      }
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      setCartItems([]);
    }
  }, [normalizeCartItem, navigate, currentStep]);

  // Cargar items inicialmente
  useEffect(() => {
    loadCartItems();

    const handleCartUpdate = () => {
      loadCartItems();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [loadCartItems]);

  // Calcular descuentos de manera optimizada
  useEffect(() => {
    const calculateDiscounts = async () => {
      if (currentUser && cartItems.length > 0) {
        const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

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

    calculateDiscounts();
  }, [cartItems, currentUser]);

  // Calcular subtotal con useMemo
  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  // Calcular total con useMemo
  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + (hasRegionSelected ? shippingCost : 0));
  }, [subtotal, discountAmount, shippingCost, hasRegionSelected]);

  // Manejar envío
  const handleShippingCostChange = useCallback((shippingData) => {
    setShippingCost(shippingData.costo);
    setShippingConfig(shippingData.config);
    setIsShippingFree(shippingData.costo === 0);
    setHasRegionSelected(!!shippingData.config);
  }, []);

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

  // Funciones del carrito optimizadas
  const updateCartQuantity = useCallback(async (productId, newQuantity) => {
    try {
      const producto = await obtenerProductoPorId(productId);
      const maxStock = producto?.stock || 100;
      const finalQuantity = Math.max(1, Math.min(newQuantity, maxStock));

      const updatedItems = cartItems.map(item =>
        item.id === productId ? {
          ...item,
          quantity: finalQuantity
        } : item
      ).filter(item => item.quantity > 0);

      setCartItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      window.dispatchEvent(new Event('cartUpdated'));

      // Actualizar stock localmente para mejor UX
      setProductStocks(prev => ({
        ...prev,
        [productId]: maxStock
      }));
    } catch (error) {
      console.error('Error actualizando cantidad:', error);
    }
  }, [cartItems]);

  const removeFromCart = useCallback((productId) => {
    const updatedItems = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('cartUpdated'));
  }, [cartItems]);

  // Navegación
  const handleNextStep = useCallback((data = {}) => {
    setOrderData(prev => ({ ...prev, ...data }));
    setCurrentStep(prev => prev + 1);
  }, []);

  const handlePreviousStep = useCallback(() => {
    setCurrentStep(prev => prev - 1);
  }, []);

  const handleOrderComplete = useCallback((orderId) => {
    setOrderComplete(true);
    setOrderNumber(orderId);
    setCurrentStep(4);
    localStorage.removeItem('cart');
    localStorage.removeItem('discountCode');
    window.dispatchEvent(new Event('cartUpdated'));
  }, []);

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
                    const maxStock = productStocks[item.id] || item.maxStock || 100;
                    const stockAvailable = maxStock - item.quantity;

                    return (
                      <div key={item.id} className="order-item d-flex justify-content-between align-items-center">
                        <div>
                          <span className="fw-semibold">{item.quantity}x</span> {item.name}
                          {stockAvailable <= 5 && stockAvailable > 0 && (
                            <small className="text-warning d-block">
                              <i className="bi bi-exclamation-triangle me-1"></i>
                              Solo {stockAvailable} disponible(s)
                            </small>
                          )}
                        </div>
                        <div className="text-end">
                          <div>${formatPrice(item.price * item.quantity)}</div>
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