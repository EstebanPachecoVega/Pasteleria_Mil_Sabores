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

  // Calcular subtotal CORREGIDO - usar item.precio || item.price
  const subtotal = cartItems.reduce((total, item) => {
    const price = item.precio || item.price || 0;
    const quantity = item.quantity || item.cantidad || 1;
    return total + (price * quantity);
  }, 0);

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    console.log('🛒 PaymentMethod: Iniciando proceso de compra...');
    console.log('🛒 PaymentMethod: orderData.shippingInfo:', orderData.shippingInfo);
    console.log('🛒 PaymentMethod: cartItems:', cartItems.length, 'items');
    console.log('🛒 PaymentMethod: shippingCost:', shippingCost);

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

      // Validación de shippingInfo - verificar nombres de campos reales
      const shippingInfo = orderData.shippingInfo;
      console.log('🛒 PaymentMethod: Campos en shippingInfo:', Object.keys(shippingInfo));

      // Verificar campos requeridos (ajustar según los nombres reales)
      const requiredFields = [
        'nombre', 'apellido', 'email', 'telefono', 
        'region', 'comuna', 'direccion', 'numero'
      ];
      
      // Verificar campos alternativos
      const hasRequiredFields = 
        (shippingInfo.nombre || shippingInfo.primerNombre) &&
        (shippingInfo.apellido || shippingInfo.primerApellido) &&
        shippingInfo.email &&
        shippingInfo.telefono &&
        shippingInfo.region &&
        shippingInfo.comuna &&
        (shippingInfo.direccion || shippingInfo.nombreCalle) &&
        (shippingInfo.numero || shippingInfo.numeroCalle);

      if (!hasRequiredFields) {
        console.error('🛒 PaymentMethod: Campos faltantes en shippingInfo:', shippingInfo);
        throw new Error('Falta información requerida de envío. Por favor completa todos los campos obligatorios.');
      }

      // Validar que shippingCost sea un número válido
      const finalShippingCost = isNaN(shippingCost) || shippingCost < 0 ? 0 : Number(shippingCost);
      console.log('🛒 PaymentMethod: Costo de envío final:', finalShippingCost);

      // Actualizar stock de productos
      console.log('📦 PaymentMethod: Descontando stock de productos...');
      for (const item of cartItems) {
        const productName = item.nombre || item.name || 'Producto sin nombre';
        console.log(`➖ Producto: ${productName}, Cantidad: ${item.quantity}`);
        
        try {
          await descontarStockProducto(item.id, item.quantity);
          console.log(`✅ Stock actualizado: ${item.quantity} unidades de ${productName}`);
        } catch (error) {
          console.error(`❌ Error actualizando stock de ${productName}:`, error);
          throw new Error(`${error.message}. No se pudo completar la compra.`);
        }
      }

      console.log('✅ PaymentMethod: Todo el stock fue actualizado correctamente');

      // Crear objeto de orden limpio
      const cleanCartItems = cartItems.map(item => ({
        id: item.id,
        name: item.nombre || item.name || 'Producto sin nombre',
        price: item.precio || item.price || 0,
        quantity: item.quantity || item.cantidad || 1,
        image: item.image || item.imagen || '/images/placeholder.jpg',
        categoryName: item.categoriaNombre || item.categoryName || ''
      }));

      // Generar un ID de orden compra personalizado
      const generateOrderId = (user) => {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
        const userPrefix = user ? (user.id || 'USER').slice(-4) : 'GUEST';
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();

        return `ORD-${dateStr}-${timeStr}-${userPrefix}-${random}`;
      };

      const customOrderId = generateOrderId(currentUser);
      console.log('🛒 PaymentMethod: ID de orden generado:', customOrderId);

      if (!customOrderId) {
        throw new Error('No se pudo generar el ID de la orden');
      }

      // Preparar datos de envío para la orden
      const orderShippingInfo = {
        nombreCompleto: shippingInfo.nombreCompleto || 
          `${shippingInfo.nombre || shippingInfo.primerNombre || ''} ${shippingInfo.apellido || shippingInfo.primerApellido || ''}`.trim(),
        email: shippingInfo.email || '',
        telefono: shippingInfo.telefono || '',
        direccionCompleta: 
          `${shippingInfo.direccion || shippingInfo.nombreCalle || ''} ${shippingInfo.numero || shippingInfo.numeroCalle || ''}`.trim(),
        region: shippingInfo.regionName || shippingInfo.region || '',
        comuna: shippingInfo.comunaName || shippingInfo.comuna || '',
        tipoVivienda: shippingInfo.tipoViviendaName || shippingInfo.tipoVivienda || '',
        codigoPostal: shippingInfo.codigoPostal || '',
        notas: shippingInfo.notes || shippingInfo.notas || ''
      };

      // Crear datos de orden
      const completeOrderData = {
        orderId: customOrderId,
        shippingInfo: orderShippingInfo,
        items: cleanCartItems,
        subtotal: subtotal,
        discountAmount: discountAmount || 0,
        shippingCost: finalShippingCost,
        total: total,
        discounts: userDiscounts || {},
        userId: currentUser?.id || '',
        userName: currentUser?.name || orderShippingInfo.nombreCompleto || 'Cliente',
        userEmail: currentUser?.email || orderShippingInfo.email || '',
        paymentMethod: selectedPayment,
        status: 'confirmado',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('🛒 PaymentMethod: Creando orden en Firebase...');
      console.log('🛒 PaymentMethod: Datos de orden:', JSON.stringify(completeOrderData, null, 2));

      // Crear la orden en Firebase
      try {
        const order = await createOrder(completeOrderData);
        console.log('✅ PaymentMethod: Orden creada exitosamente:', order.id || customOrderId);

        // Actualizar usuario localmente (opcional)
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
              shippingInfo: orderShippingInfo,
              paymentMethod: selectedPayment
            };

            userOrders.unshift(userOrder);
            await updateUser({
              ...currentUser,
              orders: userOrders
            });
            console.log('✅ PaymentMethod: Usuario actualizado con nueva orden');
          } catch (userError) {
            console.warn('⚠️ PaymentMethod: Error al actualizar usuario local:', userError);
            // No fallar la orden por esto
          }
        }

        // Proceder a confirmación
        console.log('✅ PaymentMethod: Orden completada, llamando onOrderComplete');
        onOrderComplete(customOrderId);

      } catch (firestoreError) {
        console.error('❌ PaymentMethod: Error en createOrder:', firestoreError);
        throw new Error(`Error al crear la orden en la base de datos: ${firestoreError.message}`);
      }

    } catch (error) {
      console.error('❌ PaymentMethod: Error al crear la orden:', error);
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

  // Preparar información para mostrar en la tarjeta de envío
  const shippingInfo = orderData.shippingInfo || {};
  const nombreCompleto = shippingInfo.nombreCompleto || 
    `${shippingInfo.nombre || shippingInfo.primerNombre || ''} ${shippingInfo.apellido || shippingInfo.primerApellido || ''}`.trim();
  const direccionCompleta = 
    `${shippingInfo.direccion || shippingInfo.nombreCalle || ''} ${shippingInfo.numero || shippingInfo.numeroCalle || ''}`.trim();

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
                <p className="mb-1"><strong>Nombre:</strong> {nombreCompleto}</p>
                <p className="mb-1"><strong>Email:</strong> {shippingInfo.email}</p>
                <p className="mb-1"><strong>Teléfono:</strong> {shippingInfo.telefono}</p>
              </Col>
              <Col md={6}>
                <p className="mb-1"><strong>Dirección:</strong></p>
                <p className="mb-0 small">
                  {direccionCompleta}
                  {shippingInfo.tipoViviendaName && `, ${shippingInfo.tipoViviendaName}`}
                  {shippingInfo.codigoPostal && `, Código Postal: ${shippingInfo.codigoPostal}`}
                  <br />
                  {shippingInfo.comunaName || shippingInfo.comuna}, {shippingInfo.regionName || shippingInfo.region}
                </p>
              </Col>
            </Row>
            {(shippingInfo.notes || shippingInfo.notas) && (
              <Row className="mt-2">
                <Col>
                  <p className="mb-0"><strong>Notas:</strong> {shippingInfo.notes || shippingInfo.notas}</p>
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
                  <i className="bi bi-check-lg ms-2"></i>
                </>
              )}
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PaymentMethod;