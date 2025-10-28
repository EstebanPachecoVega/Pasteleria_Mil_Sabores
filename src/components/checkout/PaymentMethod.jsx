import React, { useState } from 'react';
import { Row, Col, Button, Card, Form } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { createOrder} from '../../services/firestoreService';
import { decreaseProductStock } from '../../services/productService';

const PaymentMethod = ({ onNextStep, onPreviousStep, onOrderComplete, orderData, cartItems, total, discountAmount, userDiscounts }) => {
  const { currentUser, updateUser } = useAuth(); // ← SOLO currentUser, sin updateUser
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    setLoading(true);
    console.log('🛒 Iniciando proceso de compra...');

    try {
      // Validaciones básicas
      if (!orderData.shippingInfo) {
        throw new Error('Información de envío incompleta');
      }

      if (cartItems.length === 0) {
        throw new Error('El carrito está vacío');
      }

      // ✅ 1. PRIMERO DESCONTAR STOCK EN FIREBASE
      console.log('📦 Descontando stock de productos...');
      for (const item of cartItems) {
        console.log(`➖ Producto: ${item.name}, Cantidad: ${item.quantity}`);
        try {
          await decreaseProductStock(item.id, item.quantity);
          console.log(`✅ Stock actualizado: ${item.quantity} unidades de ${item.name}`);
        } catch (error) {
          console.error(`❌ Error actualizando stock de ${item.name}:`, error);
          alert(`Error: ${error.message}. No se pudo completar la compra.`);
          setLoading(false);
          return;
        }
      }

      console.log('✅ Todo el stock fue actualizado correctamente');

      // Crear objeto de orden limpio
      const cleanCartItems = cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      const cleanShippingInfo = orderData.shippingInfo ? {
        primerNombre: orderData.shippingInfo.primerNombre,
        segundoNombre: orderData.shippingInfo.segundoNombre,
        primerApellido: orderData.shippingInfo.primerApellido,
        segundoApellido: orderData.shippingInfo.segundoApellido,
        nombreCompleto: orderData.shippingInfo.nombreCompleto,
        email: orderData.shippingInfo.email,
        telefono: orderData.shippingInfo.telefono,
        region: orderData.shippingInfo.region,
        comuna: orderData.shippingInfo.comuna,
        nombreCalle: orderData.shippingInfo.nombreCalle,
        numeroCalle: orderData.shippingInfo.numeroCalle,
        tipoVivienda: orderData.shippingInfo.tipoVivienda,
        codigoPostal: orderData.shippingInfo.codigoPostal,
        direccionCompleta: orderData.shippingInfo.direccionCompleta,
        notes: orderData.shippingInfo.notes
      } : {};

      // Generar un ID de orden personalizado
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

      const completeOrderData = {
        orderId: customOrderId,
        shippingInfo: cleanShippingInfo,
        items: cleanCartItems,
        total: total,
        discountAmount: discountAmount || 0,
        subtotal: total + (discountAmount || 0),
        shippingCost: 0,
        discounts: userDiscounts || {},
        userId: currentUser?.id || '',
        userName: currentUser?.name || cleanShippingInfo.nombreCompleto || 'Cliente',
        userEmail: currentUser?.email || cleanShippingInfo.email || '',
        paymentMethod: selectedPayment,
        status: 'confirmado',
        date: new Date().toISOString()
      };

      console.log('Creando orden en Firebase...');

      const order = await createOrder(completeOrderData);
      console.log('Orden creada exitosamente:', order.id);

      // Actualizar usuario localmente (opcional)
      if (currentUser && updateUser) {
        try {
          const userOrders = currentUser.orders || [];
          const userOrder = {
            id: customOrderId,
            date: new Date().toISOString(),
            items: cleanCartItems,
            total: total,
            discountAmount: discountAmount || 0,
            status: 'confirmado',
            shippingInfo: cleanShippingInfo,
            paymentMethod: selectedPayment,
            userId: currentUser.id
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
      setLoading(false);
      alert('Error al procesar la orden: ' + error.message);
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

  return (
    <div className="payment-method">
      <h4 className="mb-4">Método de Pago</h4>

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
            <span>${(total + (discountAmount || 0)).toLocaleString()}</span>
          </div>
          {discountAmount > 0 && (
            <div className="d-flex justify-content-between mb-2 text-success">
              <span>Descuentos:</span>
              <span>-${(discountAmount || 0).toLocaleString()}</span>
            </div>
          )}
          <div className="d-flex justify-content-between mb-2">
            <span>Envío:</span>
            <span>GRATIS</span>
          </div>
          <hr />
          <div className="d-flex justify-content-between fw-bold fs-5">
            <span>Total a pagar:</span>
            <span>${total.toLocaleString()}</span>
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
              Podrás pagar con efectivo o tarjeta cuando recibas tu pedido. Nuestro repartidor llevará datáfono.
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

      <div className="checkout-actions">
        <Row>
          <Col>
            <Button
              variant="outline-secondary"
              onClick={onPreviousStep}
              className="me-3"
              disabled={loading}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Volver a Envío
            </Button>
            <Button
              onClick={handlePlaceOrder}
              className="checkout-btn-primary"
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
                  <i className="bi bi-check-lg me-2"></i>
                  Confirmar Pedido
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