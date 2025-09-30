// src/components/pages/Contacto.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const Contacto = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [showAlert, setShowAlert] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulación de envío - por ahora solo muestra alerta
    console.log('Datos del formulario:', formData);
    setShowAlert(true);
    
    // Resetear formulario
    setFormData({
      name: '',
      email: '',
      message: ''
    });

    // Ocultar alerta después de 5 segundos
    setTimeout(() => setShowAlert(false), 5000);
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="text-center mb-4">
            <i className="bi bi-shop" style={{ fontSize: '100px', color: 'var(--accent-pink)' }}></i>
            <h1 className="h2" style={{ fontFamily: 'Pacifico, cursive' }}>Pastelería Mil Sabores</h1>
            <p className="text-muted">Contáctanos para más información</p>
          </div>

          {showAlert && (
            <Alert variant="success" className="text-center">
              <i className="bi bi-check-circle-fill me-2"></i>
              ¡Mensaje enviado correctamente! Te contactaremos pronto.
            </Alert>
          )}

          <Card className="shadow">
            <Card.Header className="bg-primary text-white text-center py-4">
              <h4 className="card-title mb-0">
                <i className="bi bi-envelope me-2"></i>Contacto
              </h4>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="contactName">Nombre Completo</Form.Label>
                  <Form.Control
                    type="text"
                    id="contactName"
                    placeholder="Tu nombre completo"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa tu nombre completo
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label htmlFor="contactEmail">Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    id="contactEmail"
                    placeholder="Tu correo electrónico"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa un correo válido
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label htmlFor="contactMessage">Mensaje</Form.Label>
                  <Form.Control
                    as="textarea"
                    id="contactMessage"
                    rows={4}
                    placeholder="Escribe tu mensaje aquí..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa tu mensaje
                  </Form.Control.Feedback>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  <i className="bi bi-send me-2"></i>Enviar Mensaje
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Información de contacto adicional */}
          <Card className="mt-4 shadow-sm">
            <Card.Body className="text-center">
              <h5 className="card-title">También puedes contactarnos por:</h5>
              <div className="row mt-3">
                <div className="col-md-4 mb-3">
                  <i className="bi bi-telephone-fill text-primary" style={{ fontSize: '1.5rem' }}></i>
                  <p className="mb-0 mt-2">+56 9 1234 5678</p>
                </div>
                <div className="col-md-4 mb-3">
                  <i className="bi bi-whatsapp text-success" style={{ fontSize: '1.5rem' }}></i>
                  <p className="mb-0 mt-2">WhatsApp</p>
                </div>
                <div className="col-md-4 mb-3">
                  <i className="bi bi-instagram text-danger" style={{ fontSize: '1.5rem' }}></i>
                  <p className="mb-0 mt-2">@milSaboresPasteleria</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Contacto;