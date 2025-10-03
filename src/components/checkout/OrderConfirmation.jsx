// src/components/checkout/OrderConfirmation.jsx
import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const OrderConfirmation = ({ orderNumber, orderData }) => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="text-center border-0 shadow">
            <Card.Body className="p-5">
              <div className="mb-4">
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
              </div>
              
              <h2 className="mb-3">¡Pedido Confirmado!</h2>
              <p className="text-muted mb-4">
                Tu pedido ha sido procesado exitosamente. Te hemos enviado un correo de confirmación.
              </p>
              
              <Card className="bg-light mb-4">
                <Card.Body>
                  <h5 className="mb-2">Número de Pedido</h5>
                  <h3 className="text-primary">{orderNumber}</h3>
                </Card.Body>
              </Card>
              
              <div className="d-grid gap-2">
                <Button 
                  as={Link} 
                  to="/productos" 
                  variant="primary" 
                  size="lg"
                >
                  Seguir Comprando
                </Button>
                <Button 
                  as={Link} 
                  to="/" 
                  variant="outline-secondary"
                >
                  Volver al Inicio
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderConfirmation;