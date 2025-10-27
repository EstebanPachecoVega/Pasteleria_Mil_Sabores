// src/components/auth/Login.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { email, password } = formData;
        const correo = email.trim().toLowerCase();

        if (!correo || !password) {
            setError('Debes completar correo y clave');
            setLoading(false);
            return;
        }

        try {
            // Usar el AuthContext unificado
            await login(correo, password);
            
            // Redirección única - el rol lo maneja AuthContext
            setTimeout(() => {
                navigate('/perfil');
            }, 1000);

        } catch (err) {
            console.error('Error en login:', err);
            setError('Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="my-5">
            <Row className="justify-content-center">
                <Col md={6} lg={4}>
                    <Card className="shadow">
                        <Card.Header className="bg-primary text-white text-center">
                            <h4 className="mb-0">
                                <i className="bi bi-person-circle me-2"></i>
                                Iniciar Sesión
                            </h4>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {error && <Alert variant="danger">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Correo electrónico</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="tu@email.com"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Contraseña</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Tu contraseña"
                                        required
                                    />
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-100"
                                    disabled={loading}
                                >
                                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                                </Button>
                            </Form>

                            <div className="text-center mt-3">
                                <p className="mb-0">
                                    ¿No tienes cuenta?{' '}
                                    <a href="/registro" className="text-decoration-none">
                                        Regístrate aquí
                                    </a>
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;