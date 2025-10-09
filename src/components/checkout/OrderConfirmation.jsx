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

              {orderData && orderData.shippingInfo && (
                <Card className="mb-4 text-start">
                  <Card.Body>
                    <h6 className="mb-3 border-bottom pb-2">
                      <i className="bi bi-truck me-2"></i>
                      Información de Envío
                    </h6>
                    <p className="mb-1"><strong>Nombre:</strong> {orderData.shippingInfo.nombreCompleto}</p>
                    <p className="mb-1"><strong>Email:</strong> {orderData.shippingInfo.email}</p>
                    <p className="mb-1"><strong>Teléfono:</strong> {orderData.shippingInfo.telefono}</p>
                    <p className="mb-0"><strong>Dirección:</strong> {orderData.shippingInfo.direccionCompleta}</p>
                  </Card.Body>
                </Card>
              )}

              <Card className="mb-4 bg-success bg-opacity-10 border-success">
                <Card.Body>
                  <h6 className="mb-2 text-success">
                    <i className="bi bi-clock me-2"></i>
                    Próximos Pasos
                  </h6>
                  <p className="mb-0 small text-success">
                    Te contactaremos dentro de las próximas 24 horas para coordinar la entrega de tu pedido.
                  </p>
                </Card.Body>
              </Card>
              
              <div className="d-grid gap-2">
                <Button 
                  as={Link} 
                  to="/productos" 
                  variant="primary" 
                  size="lg"
                >
                  <i className="bi bi-bag me-2"></i>
                  Seguir Comprando
                </Button>
                <Button 
                  as={Link} 
                  to="/" 
                  variant="outline-primary"
                >
                  <i className="bi bi-house me-2"></i>
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