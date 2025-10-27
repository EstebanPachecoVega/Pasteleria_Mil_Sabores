import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button } from 'react-bootstrap';
import { useAuth } from '../../../context/AuthContext';
import { formatPrice } from '../../../utils/formatters';

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de pedidos
    const loadOrders = () => {
      setLoading(true);
      
      // Obtener pedidos del localStorage
      const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
      
      // Filtrar pedidos del usuario actual
      const userOrders = currentUser 
        ? allOrders.filter(order => order.userId === currentUser.id)
        : [];
      
      setOrders(userOrders);
      setLoading(false);
    };

    loadOrders();
  }, [currentUser]);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'confirmado':
        return 'success';
      case 'en_preparacion':
        return 'warning';
      case 'en_camino':
        return 'info';
      case 'entregado':
        return 'primary';
      case 'cancelado':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentUser) {
    return (
      <Container className="my-4">
        <Card>
          <Card.Body className="text-center py-5">
            <i className="bi bi-person-x" style={{ fontSize: '3rem' }}></i>
            <h4 className="mt-3">Debes iniciar sesión</h4>
            <p className="text-muted">Para ver tu historial de pedidos, inicia sesión en tu cuenta.</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="my-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando tus pedidos...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Row>
        <Col>
          <Card className='custom-card'>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="order-title mb-0">Mis Pedidos</h4>
              <Badge bg="primary">{orders.length} pedidos</Badge>
            </Card.Header>
            <Card.Body>
              {orders.length === 0 ? (
                <div className="text-center py-5">
                  <i className="icon-custom bi bi-bag-x" style={{ fontSize: '3rem' }}></i>
                  <h5 className="mt-3">No tienes pedidos aún</h5>
                  <p className="text-muted mb-4">
                    Cuando realices tu primer pedido, aparecerá aquí.
                  </p>
                  <Button className='custom-button' href="/productos">
                    Comenzar a Comprar
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>N° Pedido</th>
                        <th>Fecha</th>
                        <th>Productos</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <strong>{order.id}</strong>
                          </td>
                          <td>
                            <small>{formatDate(order.date)}</small>
                          </td>
                          <td>
                            <div>
                              {order.items.slice(0, 2).map((item, index) => (
                                <div key={index} className="d-flex align-items-center mb-1">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="rounded me-2"
                                    style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                                  />
                                  <small>
                                    {item.quantity}x {item.name}
                                    {index === 0 && order.items.length > 2 && (
                                      <Badge bg="light" text="dark" className="ms-1">
                                        +{order.items.length - 2} más
                                      </Badge>
                                    )}
                                  </small>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td>
                            <strong>${formatPrice(order.total)}</strong>
                            {order.discounts > 0 && (
                              <div>
                                <small className="text-success">
                                  -${formatPrice(order.discounts)} desc.
                                </small>
                              </div>
                            )}
                          </td>
                          <td>
                            <Badge bg={getStatusVariant(order.status)}>
                              {order.status}
                            </Badge>
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => {
                                // Aquí podrías implementar la vista de detalle del pedido
                                alert(`Detalles del pedido ${order.id}`);
                              }}
                            >
                              <i className="bi bi-eye"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Estadísticas del usuario */}
          {orders.length > 0 && (
            <Row className="mt-4">
              <Col md={4}>
                <Card className="text-center">
                  <Card.Body>
                    <i className="bi bi-bag-check text-primary fs-1"></i>
                    <h5 className="mt-2">{orders.length}</h5>
                    <p className="text-muted mb-0">Pedidos Totales</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center">
                  <Card.Body>
                    <i className="bi bi-currency-dollar text-success fs-1"></i>
                    <h5 className="mt-2">
                      ${formatPrice(orders.reduce((total, order) => total + order.total, 0))}
                    </h5>
                    <p className="text-muted mb-0">Total Gastado</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default OrderHistory;