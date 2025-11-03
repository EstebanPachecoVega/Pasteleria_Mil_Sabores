import React from 'react';
import { Container, Row, Col, Card, Button, Nav } from 'react-bootstrap';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileAdmin = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  console.log('🚀 ProfileAdmin se está montando, usuario:', currentUser);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleBackToStore = () => {
    navigate('/');
  };

  return (
    <Container fluid className="p-4 admin-dashboard">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div>
            <h1 className="mb-1">Dashboard de Administración</h1>
            <p className="text-muted mb-0">
              Bienvenido, {currentUser?.name || 'Administrador'}
            </p>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Sidebar de Navegación */}
        <Col md={2} className="mb-4">
          <Card className="h-100">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Menú Administrativo</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link href="#dashboard" active>
                    <i className="bi bi-speedometer2 me-2"></i>
                    Dashboard
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link href="#usuarios">
                    <i className="bi bi-people me-2"></i>
                    Gestión de Usuarios
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link href="#productos">
                    <i className="bi bi-box-seam me-2"></i>
                    Productos y Stock
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link href="#categorias">
                    <i className="bi bi-tags me-2"></i>
                    Categorías
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link href="#ventas">
                    <i className="bi bi-graph-up me-2"></i>
                    Reportes de Ventas
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link href="#pedidos">
                    <i className="bi bi-receipt me-2"></i>
                    Órdenes y Boletas
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              
              {/* Botones de acción debajo del menú */}
              <div className="p-3 border-top">
                <Button 
                  variant="outline-primary" 
                  className="w-100 mb-2"
                  onClick={handleBackToStore}
                >
                  <i className="bi bi-shop me-2"></i>
                  Volver a la Tienda
                </Button>
                <Button 
                  variant="outline-danger" 
                  className="w-100"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Cerrar Sesión
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Contenido Principal - Dashboard */}
        <Col md={10}>
          {/* Tarjetas de Estadísticas Rápidas */}
          <Row className="mb-4">
            <Col md={3} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <i className="bi bi-people fs-1 text-primary"></i>
                  <h3 className="mt-2">890</h3>
                  <p className="text-muted mb-0">Usuarios Registrados</p>
                  <small className="text-success">+120 este mes</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <i className="bi bi-cart-check fs-1 text-success"></i>
                  <h3 className="mt-2">1,234</h3>
                  <p className="text-muted mb-0">Total Compras</p>
                  <small className="text-success">+20% probabilidad</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <i className="bi bi-currency-dollar fs-1 text-warning"></i>
                  <h3 className="mt-2">$2.5M</h3>
                  <p className="text-muted mb-0">Ventas Totales</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <i className="bi bi-box-seam fs-1 text-info"></i>
                  <h3 className="mt-2">400</h3>
                  <p className="text-muted mb-0">Productos Activos</p>
                  <small className="text-muted">Inventario: 500</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Gráficos y Reportes */}
          <Row>
            <Col md={8} className="mb-4">
              <Card className="h-100">
                <Card.Header>
                  <h5 className="mb-0">Ventas de los Últimos 7 Días</h5>
                </Card.Header>
                <Card.Body>
                  <div className="text-center p-5 bg-light rounded">
                    <i className="bi bi-bar-chart fs-1 text-muted"></i>
                    <p className="mt-3 text-muted">Gráfico de ventas se cargará aquí</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-4">
              <Card className="h-100">
                <Card.Header>
                  <h5 className="mb-0">Productos Más Vendidos</h5>
                </Card.Header>
                <Card.Body>
                  <div className="text-center p-5 bg-light rounded">
                    <i className="bi bi-trophy fs-1 text-muted"></i>
                    <p className="mt-3 text-muted">Top productos se cargará aquí</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Acciones Rápidas */}
          <Row>
            <Col>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Acciones Rápidas</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={3} className="mb-3">
                      <Button variant="outline-primary" className="w-100 py-3">
                        <i className="bi bi-plus-circle me-2"></i>
                        Nuevo Producto
                      </Button>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Button variant="outline-success" className="w-100 py-3">
                        <i className="bi bi-file-earmark-text me-2"></i>
                        Generar Reporte
                      </Button>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Button variant="outline-warning" className="w-100 py-3">
                        <i className="bi bi-bell me-2"></i>
                        Ver Alertas
                      </Button>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Button variant="outline-info" className="w-100 py-3">
                        <i className="bi bi-gear me-2"></i>
                        Configuración
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfileAdmin;