import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button } from 'react-bootstrap';
import { useAuth } from '../../../context/AuthContext';
import { formatPrice } from '../../../utils/formatters';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Link } from 'react-router-dom';

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Crear consulta para obtener órdenes del usuario actual
    const ordersRef = collection(db, "order");
    const q = query(
      ordersRef,
      where("userId", "==", currentUser.id),
      orderBy("createdAt", "desc")
    );

    // Suscribirse a cambios en tiempo real
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userOrders = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userOrders.push({
          id: data.orderId || doc.id,
          ...data,
          // Asegurar que date exista
          date: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          // Priorizar estado desde Firebase
          status: data.estado || data.status || 'pendiente',
          estado: data.estado || data.status || 'pendiente',
          // Asegurar que discounts sea un número
          discounts: data.discountAmount || data.discounts || 0
        });
      });

      setOrders(userOrders);
      setLoading(false);
    }, (error) => {
      console.error('Error en suscripción a órdenes:', error);
      setLoading(false);
      
      // Fallback a localStorage si hay error
      try {
        const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
        const localUserOrders = allOrders.filter(order => order.userId === currentUser.id);
        setOrders(localUserOrders);
      } catch (e) {
        console.error('Error con fallback:', e);
      }
    });

    // Limpiar suscripción al desmontar
    return () => unsubscribe();
  }, [currentUser]);

  const getStatusVariant = (status) => {
    const statusValue = status || 'pendiente';
    switch (statusValue.toLowerCase()) {
      case 'pendiente':
        return 'warning';
      case 'confirmado':
      case 'confirmada':
        return 'success';
      case 'en_preparacion':
      case 'en preparación':
        return 'info';
      case 'en_camino':
      case 'en camino':
        return 'primary';
      case 'entregado':
        return 'secondary';
      case 'cancelado':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status) => {
    const statusValue = status || 'pendiente';
    switch (statusValue.toLowerCase()) {
      case 'pendiente':
        return 'PENDIENTE';
      case 'confirmado':
      case 'confirmada':
        return 'CONFIRMADO';
      case 'en_preparacion':
      case 'en preparación':
        return 'EN PREPARACIÓN';
      case 'en_camino':
      case 'en camino':
        return 'EN CAMINO';
      case 'entregado':
        return 'ENTREGADO';
      case 'cancelado':
        return 'CANCELADO';
      default:
        return statusValue.toUpperCase();
    }
  };

  const formatDate = (dateValue) => {
    try {
      if (!dateValue) return 'Fecha no disponible';
      
      let date;
      if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      } else if (dateValue && typeof dateValue.toDate === 'function') {
        // Si es un timestamp de Firebase
        date = dateValue.toDate();
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        return 'Fecha no disponible';
      }
      
      return date.toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha no disponible';
    }
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
                            <strong title={order.id}>
                              {order.id?.length > 15 ? order.id.substring(0, 15) + '...' : order.id}
                            </strong>
                          </td>
                          <td>
                            <small>{formatDate(order.createdAt || order.date)}</small>
                          </td>
                          <td>
                            <div>
                              {(order.items || []).slice(0, 2).map((item, index) => (
                                <div key={index} className="d-flex align-items-center mb-1">
                                  <img
                                    src={item.image || '/images/productos/default.png'}
                                    alt={item.name || 'Producto'}
                                    className="rounded me-2"
                                    style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                                    onError={(e) => {
                                      e.target.src = '/images/productos/default.png';
                                    }}
                                  />
                                  <small>
                                    {(item.quantity || 1)}x {item.name || 'Producto'}
                                    {index === 0 && order.items && order.items.length > 2 && (
                                      <Badge bg="light" text="dark" className="ms-1">
                                        +{(order.items.length - 2)} más
                                      </Badge>
                                    )}
                                  </small>
                                </div>
                              ))}
                              {(!order.items || order.items.length === 0) && (
                                <small className="text-muted">Sin productos</small>
                              )}
                            </div>
                          </td>
                          <td>
                            <strong>${formatPrice(order.total || 0)}</strong>
                            {order.discountAmount > 0 && (
                              <div>
                                <small className="text-success">
                                  -${formatPrice(order.discountAmount)} desc.
                                </small>
                              </div>
                            )}
                          </td>
                          <td>
                            <Badge bg={getStatusVariant(order.estado)} className="px-3 py-2">
                              {getStatusText(order.estado)}
                            </Badge>
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              as={Link}
                              to={`/mis-pedidos/${order.id}`}
                            >
                              <i className="bi bi-eye me-1"></i>
                              Ver Detalle
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
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <i className="bi bi-bag-check text-primary fs-1"></i>
                    <h5 className="mt-2">{orders.length}</h5>
                    <p className="text-muted mb-0">Pedidos Totales</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <i className="bi bi-currency-dollar text-success fs-1"></i>
                    <h5 className="mt-2">
                      ${formatPrice(orders.reduce((total, order) => total + (order.total || 0), 0))}
                    </h5>
                    <p className="text-muted mb-0">Total Gastado</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <i className="bi bi-clock-history text-warning fs-1"></i>
                    <h5 className="mt-2">
                      {orders.filter(o => (o.estado || '').toLowerCase() === 'pendiente').length}
                    </h5>
                    <p className="text-muted mb-0">Pendientes</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <i className="bi bi-check-circle text-success fs-1"></i>
                    <h5 className="mt-2">
                      {orders.filter(o => (o.estado || '').toLowerCase() === 'entregado').length}
                    </h5>
                    <p className="text-muted mb-0">Entregados</p>
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