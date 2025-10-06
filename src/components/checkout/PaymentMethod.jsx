// src/components/checkout/PaymentMethod.jsx
import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext'; // ← Importación necesaria
import { createOrder } from '../../data/orders';

const PaymentMethod = ({ onNextStep, onPreviousStep, onOrderComplete, orderData, cartItems, total }) => {
  // AGREGAR ESTE HOOK DENTRO DEL COMPONENTE
  const { currentUser, updateUser } = useAuth();

  const handlePlaceOrder = () => {
    // Crear objeto de orden con información del usuario
    const completeOrderData = {
      ...orderData,
      items: cartItems,
      total: total,
      // Calcular descuentos si es necesario
      discounts: orderData.discounts || 0,
      subtotal: orderData.subtotal || total,
      shippingCost: orderData.shippingCost || 0,
      // Información del usuario
      userId: currentUser?.id,
      userName: currentUser?.name,
      userEmail: currentUser?.email
    };

    // Crear la orden
    const order = createOrder(completeOrderData);
    
    // Agregar orden al usuario si está logueado
    if (currentUser) {
      const userOrders = currentUser.orders || [];
      userOrders.unshift({
        id: order.id,
        date: new Date().toISOString(),
        items: cartItems,
        total: total,
        discounts: orderData.discounts || 0,
        status: 'confirmado'
      });
      
      // Actualizar usuario
      updateUser({
        ...currentUser,
        orders: userOrders
      });
    }

    onOrderComplete(order.id);
  };

  return (
    <div className="payment-method">
      <h4 className="mb-4">Método de Pago</h4>
      <p>Selecciona tu método de pago preferido...</p>
      
      <div className="checkout-actions">
        <Row>
          <Col>
            <Button 
              variant="outline-secondary" 
              onClick={onPreviousStep}
              className="me-3"
            >
              Volver
            </Button>
            <Button 
              onClick={handlePlaceOrder}
              className="checkout-btn-primary"
            >
              Confirmar Pedido
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PaymentMethod;