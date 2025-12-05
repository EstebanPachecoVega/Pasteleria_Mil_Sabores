import React, { useState } from 'react';
import { Row, Col, Button, Card, Form, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../services/firestoreService';
import { descontarStockProducto } from '../../services/productService';
import { formatPrice } from '../../utils/formatters';

const PaymentMethod = ({
  onNextStep,
  onPreviousStep,
  onOrderComplete,
  orderData,
  cartItems,
  total,
  discountAmount,
  userDiscounts,
  shippingCost,
  hasRegionSelected,
  isShippingLoading
}) => {
  const { currentUser, updateUser } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calcular subtotal
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    console.log('🛒 Iniciando proceso de compra...');

    try {
      // Validaciones básicas antes de proceder
      if (!selectedPayment) {
        throw new Error('Por favor, selecciona un método de pago');
      }

      if (!orderData.shippingInfo) {
        throw new Error('Información de envío incompleta');
      }

      if (cartItems.length === 0) {
        throw new Error('El carrito está vacío');
      }

      // Validación consistente con ShippingInfo
      const requiredFields = ['primerNombre', 'primerApellido', 'email', 'telefono', 'region', 'comuna', 'nombreCalle', 'numeroCalle'];
      const missingFields = requiredFields.filter(field => !orderData.shippingInfo[field]);

      if (missingFields.length > 0) {
        throw new Error('Falta información requerida de envío. Por favor completa todos los campos obligatorios.');
      }

      // Validar que shippingCost sea un número válido
      if (isNaN(shippingCost) || shippingCost < 0) {
        console.warn('⚠️ Costo de envío inválido, usando valor por defecto 0');
      }

      // Actualizar stock de productos
      console.log('📦 Descontando stock de productos...');
      for (const item of cartItems) {
        console.log(`➖ Producto: ${item.name}, Cantidad: ${item.quantity}`);
        try {
          await descontarStockProducto(item.id, item.quantity);
          console.log(`✅ Stock actualizado: ${item.quantity} unidades de ${item.name}`);
        } catch (error) {
          console.error(`❌ Error actualizando stock de ${item.name}:`, error);
          throw new Error(`${error.message}. No se pudo completar la compra.`);
        }
      }

      console.log('✅ Todo el stock fue actualizado correctamente');

      // Crear objeto de orden limpio
      const cleanCartItems = cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        categoryName: item.categoryName
      }));

      // Usar shippingInfo directamente
      const shippingInfo = orderData.shippingInfo;

      // Generar un ID de orden compra personalizado
      const generateOrderId = (user) => {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
        const userPrefix = user ? user.id.slice(-4) : 'GUEST';
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();

        return `ORD-${dateStr}-${timeStr}-${userPrefix}-${random}`;
      };

      const customOrderId = generateOrderId(currentUser);

      if (!customOrderId) {
        throw new Error('No se pudo generar el ID de la orden');
      }

      console.log('ID personalizado generado:', customOrderId);

      // Usar shippingCost de las props
      const finalShippingCost = isNaN(shippingCost) ? 0 : Number(shippingCost);

      // Crear datos de orden consistentes
      const completeOrderData = {
        orderId: customOrderId,
        shippingInfo: shippingInfo,
        items: cleanCartItems,
        subtotal: subtotal,
        discountAmount: discountAmount || 0,
        shippingCost: finalShippingCost,
        total: total,
        discounts: userDiscounts || {},
        userId: currentUser?.id || '',
        userName: currentUser?.name || shippingInfo.nombreCompleto || 'Cliente',
        userEmail: currentUser?.email || shippingInfo.email || '',
        paymentMethod: selectedPayment,
        status: 'confirmado',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Creando orden en Firebase...');
      console.log('🔍 DEBUG - OrderData completo:', JSON.stringify(completeOrderData, null, 2));

      const order = await createOrder(completeOrderData);
      console.log('Orden creada exitosamente:', order.id);

      // Actualizar usuario localmente
      if (currentUser && updateUser) {
        try {
          const userOrders = currentUser.orders || [];
          const userOrder = {
            id: customOrderId,
            date: new Date().toISOString(),
            items: cleanCartItems,
            subtotal: subtotal,
            discountAmount: discountAmount || 0,
            shippingCost: finalShippingCost,
            total: total,
            status: 'confirmado',
            shippingInfo: shippingInfo,
            paymentMethod: selectedPayment
          };

          userOrders.unshift(userOrder);
          await updateUser({
            ...currentUser,
            orders: userOrders
          });
          console.log('Usuario actualizado con nueva orden');
        } catch (userError) {
          console.warn('Error al actualizar usuario local:', userError);
        }
      }

      // Proceder a confirmación
      onOrderComplete(customOrderId);

    } catch (error) {
      console.error('❌ Error al crear la orden:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const paymentMethods = [
    {
      id: 'cash',
      name: 'Pago Contra Entrega',
      description: 'Paga cuando recibas tu pedido',
      icon: 'bi bi-cash-coin',
      available: true
    },
    {
      id: 'transfer',
      name: 'Transferencia Bancaria',
      description: 'Transferencia a nuestra cuenta bancaria',
      icon: 'bi bi-bank',
      available: true
    },
    {
      id: 'card',
      name: 'Tarjeta de Crédito/Débito',
      description: 'Próximamente disponible',
      icon: 'bi bi-credit-card',
      available: false
    }
  ];

  // shippingCost seguro para display
  const displayShippingCost = isNaN(shippingCost) ? 0 : shippingCost;

  return (
    <div className="payment-method">
      <h4 className="mb-4">Método de Pago</h4>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Resumen de Información de Envío */}
      {orderData.shippingInfo && (
        <Card className="mb-4 border-primary">
          <Card.Header className="bg-primary text-white">
            <h6 className="mb-0">
              <i className="bi bi-truck me-2"></i>
              Información de Envío
            </h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p className="mb-1"><strong>Nombre:</strong> {orderData.shippingInfo.nombreCompleto}</p>
                <p className="mb-1"><strong>Email:</strong> {orderData.shippingInfo.email}</p>
                <p className="mb-1"><strong>Teléfono:</strong> {orderData.shippingInfo.telefono}</p>
              </Col>
              <Col md={6}>
                <p className="mb-1"><strong>Dirección:</strong></p>
                <p className="mb-0 small">
                  {orderData.shippingInfo.nombreCalle} {orderData.shippingInfo.numeroCalle}
                  {orderData.shippingInfo.tipoViviendaName && `, ${orderData.shippingInfo.tipoViviendaName}`}
                  {orderData.shippingInfo.codigoPostal && `, Código Postal: ${orderData.shippingInfo.codigoPostal}`}
                  <br />
                  {orderData.shippingInfo.comunaName}, {orderData.shippingInfo.regionName}
                </p>
              </Col>
            </Row>
            {orderData.shippingInfo.notes && (
              <Row className="mt-2">
                <Col>
                  <p className="mb-0"><strong>Notas:</strong> {orderData.shippingInfo.notes}</p>
                </Col>
              </Row>
            )}
          </Card.Body>
        </Card>
      )}

      <div className="payment-options mb-4">
        {paymentMethods.map(method => (
          <Card
            key={method.id}
            className={`mb-3 ${!method.available ? 'opacity-50' : ''} ${selectedPayment === method.id ? 'border-primary' : ''}`}
            style={{ cursor: method.available ? 'pointer' : 'not-allowed' }}
            onClick={() => method.available && setSelectedPayment(method.id)}
          >
            <Card.Body className="p-3">
              <div className="d-flex align-items-center">
                <Form.Check
                  type="radio"
                  name="paymentMethod"
                  id={method.id}
                  checked={selectedPayment === method.id}
                  onChange={() => method.available && setSelectedPayment(method.id)}
                  disabled={!method.available}
                  className="me-3"
                />
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center">
                    <i className={`${method.icon} me-3 fs-5`}></i>
                    <div>
                      <h6 className="mb-1">{method.name}</h6>
                      <p className="text-muted mb-0 small">{method.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* Resumen Final */}
      <Card className="order-summary-card mb-4">
        <Card.Body>
          <h6 className="card-title border-bottom pb-2 mb-3">Resumen Final</h6>
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

          {/* Mostrar loading, envío o nada según estado */}
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
              <span>{displayShippingCost === 0 ? 'GRATIS' : `$${formatPrice(displayShippingCost)}`}</span>
            </div>
          ) : null}

          <hr />
          <div className="d-flex justify-content-between fw-bold fs-5">
            <span>Total a pagar:</span>
            <span>${formatPrice(total)}</span>
          </div>
        </Card.Body>
      </Card>

      {/* Información del método seleccionado */}
      {selectedPayment === 'cash' && (
        <Card className="bg-light mb-4">
          <Card.Body>
            <h6 className="mb-2">
              <i className="bi bi-info-circle me-2"></i>
              Pago Contra Entrega
            </h6>
            <p className="mb-0 small">
              Podrás pagar con efectivo o tarjeta cuando recibas tu pedido.
            </p>
          </Card.Body>
        </Card>
      )}

      {selectedPayment === 'transfer' && (
        <Card className="bg-light mb-4">
          <Card.Body>
            <h6 className="mb-2">
              <i className="bi bi-info-circle me-2"></i>
              Transferencia Bancaria
            </h6>
            <p className="mb-2 small">
              Una vez confirmado tu pedido, te enviaremos los datos bancarios para realizar la transferencia.
            </p>
            <div className="small text-muted">
              <strong>Nota:</strong> Tu pedido se preparará una vez confirmemos el pago.
            </div>
          </Card.Body>
        </Card>
      )}

      <div className="checkout-actions mt-4">
        <Row className="g-3">
          <Col xs={12} md={6}>
            <Button
              className="continue-shopping-btn btn-outline-secondary w-100 py-2"
              variant="outline-secondary"
              onClick={onPreviousStep}
              disabled={loading}
              size="lg"
            >
              <i className="bi bi-arrow-left me-2"></i>
              Volver a Envío
            </Button>
          </Col>

          <Col xs={12} md={6} className="text-md-end">
            <Button
              onClick={handlePlaceOrder}
              className="proceed-payment-btn w-100 py-2"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Procesando...
                </>
              ) : (
                <>
                  Confirmar Pedido
                  <i className="bi bi-check-lg me-2"></i>
                </>
              )}
            </Button>
          </Col>
        </Row>
      </div>
    </div >
  );
};

export default PaymentMethod;