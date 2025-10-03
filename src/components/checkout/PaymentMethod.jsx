// src/components/checkout/PaymentMethod.jsx
import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';

const PaymentMethod = ({ onNextStep, onPreviousStep, onOrderComplete }) => {
  const handlePlaceOrder = () => {
    // Simular creación de orden
    const orderId = `ORD-${Date.now()}`;
    onOrderComplete(orderId);
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