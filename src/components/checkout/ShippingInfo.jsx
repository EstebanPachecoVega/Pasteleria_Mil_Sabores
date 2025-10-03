// src/components/checkout/ShippingInfo.jsx
import React, { useState } from 'react';
import { Row, Col, Form, Button, Card } from 'react-bootstrap';

const ShippingInfo = ({ onNextStep, onPreviousStep, initialData }) => {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    address: initialData.address || '',
    city: initialData.city || '',
    region: initialData.region || '',
    notes: initialData.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onNextStep({ shippingInfo: formData });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="shipping-info">
      <h4 className="mb-4">Información de Envío</h4>
      
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Apellido *</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Teléfono *</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Dirección *</Form.Label>
          <Form.Control
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Ciudad *</Form.Label>
              <Form.Control
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Región *</Form.Label>
              <Form.Control
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-4">
          <Form.Label>Notas de entrega (opcional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Instrucciones especiales para la entrega..."
          />
        </Form.Group>

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
                type="submit" 
                className="checkout-btn-primary"
              >
                Continuar con Pago
              </Button>
            </Col>
          </Row>
        </div>
      </Form>
    </div>
  );
};

export default ShippingInfo;