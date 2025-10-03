import React from 'react';
import { Row, Col, Button, Card } from 'react-bootstrap';
import { formatPrice } from '../../utils/formatters';

const CheckoutSummary = ({ 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onNextStep, 
  subtotal, 
  shippingCost, 
  total 
}) => {
  return (
    <div className="checkout-summary">
      <h4 className="mb-4">Resumen de tu Pedido</h4>
      
      <div className="cart-items mb-4">
        {cartItems.map(item => (
          <Card key={item.id} className="mb-3">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={2}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="img-fluid rounded"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                </Col>
                <Col md={4}>
                  <h6 className="mb-1">{item.name}</h6>
                  <small className="text-muted">${formatPrice(item.price)} c/u</small>
                </Col>
                <Col md={3}>
                  <div className="d-flex align-items-center">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="mx-3 fw-bold">{item.quantity}</span>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </Col>
                <Col md={2} className="text-end">
                  <strong>${formatPrice(item.price * item.quantity)}</strong>
                </Col>
                <Col md={1}>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}
      </div>

      <div className="checkout-actions">
        <Row>
          <Col className="text-end">
            <Button 
              className="checkout-btn-primary"
              onClick={onNextStep}
              disabled={cartItems.length === 0}
            >
              Continuar con Envío
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CheckoutSummary;