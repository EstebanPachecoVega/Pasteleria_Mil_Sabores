import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { getSpecialDiscounts } from '../../data/users';

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    birthDate: '',
    phone: '',
    address: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [specialDiscounts, setSpecialDiscounts] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        birthDate: currentUser.birthDate || '',
        phone: currentUser.phone || '',
        address: currentUser.address || ''
      });
      setSpecialDiscounts(getSpecialDiscounts(currentUser));
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await updateProfile(formData);
      setMessage('Perfil actualizado correctamente');
      setSpecialDiscounts(getSpecialDiscounts({ ...currentUser, ...formData }));
    } catch (err) {
      setError('Error al actualizar el perfil: ' + err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!currentUser) {
    return (
      <Container className="my-4">
        <Alert variant="warning">Debes iniciar sesión para ver tu perfil</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h4 className="mb-0">Mi Perfil</h4>
            </Card.Header>
            <Card.Body>
              {message && <Alert variant="success">{message}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre Completo *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
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
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de Nacimiento</Form.Label>
                      <Form.Control
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                      />
                      <Form.Text className="text-muted">
                        Para verificar descuentos especiales
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Teléfono</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+56 9 1234 5678"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Tu dirección para envíos..."
                  />
                </Form.Group>

                <Button variant="primary" type="submit" size="lg">
                  Actualizar Perfil
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* NUEVO: Sección de beneficios y descuentos */}
          <Card className="mb-3">
            <Card.Header>
              <h5 className="mb-0">Mis Beneficios</h5>
            </Card.Header>
            <Card.Body>
              {specialDiscounts && (
                <div className="benefits-list">
                  {specialDiscounts.seniorDiscount && (
                    <div className="benefit-item d-flex align-items-center mb-3 p-2 bg-warning bg-opacity-10 rounded">
                      <i className="bi bi-coin text-warning fs-4 me-3"></i>
                      <div>
                        <h6 className="mb-1">50% Descuento</h6>
                        <small className="text-muted">Por ser mayor de 50 años</small>
                      </div>
                    </div>
                  )}

                  {specialDiscounts.codeDiscount && (
                    <div className="benefit-item d-flex align-items-center mb-3 p-2 bg-success bg-opacity-10 rounded">
                      <i className="bi bi-tag text-success fs-4 me-3"></i>
                      <div>
                        <h6 className="mb-1">10% Descuento Permanente</h6>
                        <small className="text-muted">Código FELICES50</small>
                      </div>
                    </div>
                  )}

                  {currentUser.email.includes('@duoc.cl') && (
                    <div className="benefit-item d-flex align-items-center mb-3 p-2 bg-info bg-opacity-10 rounded">
                      <i className="bi bi-gift text-info fs-4 me-3"></i>
                      <div>
                        <h6 className="mb-1">Torta Gratis</h6>
                        <small className="text-muted">Estudiante Duoc - En tu cumpleaños</small>
                        {specialDiscounts.birthdayDiscount && (
                          <Badge bg="success" className="ms-2">¡Hoy es tu cumpleaños!</Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {!specialDiscounts.seniorDiscount && 
                   !specialDiscounts.codeDiscount && 
                   !currentUser.email.includes('@duoc.cl') && (
                    <p className="text-muted text-center mb-0">
                      Completa tu perfil para descubrir beneficios
                    </p>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;