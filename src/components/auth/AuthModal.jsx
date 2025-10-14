import React, { useState } from 'react';
import { Modal, Tab, Tabs, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const AuthModal = ({ show, onHide }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    discountCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await login(formData.email, formData.password);
      } else {
        // Validaciones para registro
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Las contraseñas no coinciden');
        }

        if (!formData.primerNombre.trim() || !formData.primerApellido.trim() || !formData.segundoApellido.trim()) {
          throw new Error('Primer nombre, primer apellido y segundo apellido son obligatorios');
        }

        // Crear nombre completo para compatibilidad
        const nameParts = [
          formData.primerNombre,
          formData.segundoNombre,
          formData.primerApellido,
          formData.segundoApellido
        ].filter(Boolean);

        const fullName = nameParts.join(' ');

        await register({
          name: fullName,
          primerNombre: formData.primerNombre.trim(),
          segundoNombre: formData.segundoNombre.trim(),
          primerApellido: formData.primerApellido.trim(),
          segundoApellido: formData.segundoApellido.trim(),
          email: formData.email,
          password: formData.password,
          birthDate: formData.birthDate,
          discountCode: formData.discountCode
        });
      }
      onHide();
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      email: '',
      password: '',
      confirmPassword: '',
      birthDate: '',
      discountCode: ''
    });
    setError('');
  };

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {activeTab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs
          activeKey={activeTab}
          onSelect={handleTabSelect}
          className="mb-3"
        >
          <Tab eventKey="login" title="Iniciar Sesión">
            <Form onSubmit={handleSubmit}>
              {error && <Alert variant="danger">{error}</Alert>}

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="tu@email.com"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Tu contraseña"
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100"
                disabled={loading}
              >
                {loading ? 'Cargando...' : 'Iniciar Sesión'}
              </Button>
            </Form>
          </Tab>

          <Tab eventKey="register" title="Crear Cuenta">
            <Form onSubmit={handleSubmit}>
              {error && <Alert variant="danger">{error}</Alert>}

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Primer Nombre *</Form.Label>
                    <Form.Control
                      type="text"
                      name="primerNombre"
                      value={formData.primerNombre}
                      onChange={handleChange}
                      required
                      maxLength={25}
                      placeholder="Ej: María"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Segundo Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      name="segundoNombre"
                      value={formData.segundoNombre}
                      onChange={handleChange}
                      maxLength={25}
                      placeholder="Ej: José (opcional)"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Primer Apellido *</Form.Label>
                    <Form.Control
                      type="text"
                      name="primerApellido"
                      value={formData.primerApellido}
                      onChange={handleChange}
                      required
                      maxLength={25}
                      placeholder="Ej: González"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Segundo Apellido *</Form.Label>
                    <Form.Control
                      type="text"
                      name="segundoApellido"
                      value={formData.segundoApellido}
                      onChange={handleChange}
                      required
                      maxLength={25}
                      placeholder="Ej: López"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="ejemplo@correo.com"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Contraseña *</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={4}
                      placeholder="Mínimo 4 caracteres"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Confirmar Contraseña *</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Fecha de Nacimiento *</Form.Label>
                <Form.Control
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Código de Descuento (opcional)</Form.Label>
                <Form.Control
                  type="text"
                  name="discountCode"
                  value={formData.discountCode}
                  onChange={handleChange}
                  placeholder="Ej: FELICES50"
                  maxLength={20}
                />
                <Form.Text className="text-muted">
                  Si tienes un código de descuento especial, ingrésalo aquí
                </Form.Text>
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100"
                disabled={loading}
              >
                {loading ? 'Cargando...' : 'Crear Cuenta'}
              </Button>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default AuthModal;