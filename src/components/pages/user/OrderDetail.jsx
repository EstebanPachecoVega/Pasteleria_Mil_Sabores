import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Table, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { formatPrice } from '../../../utils/formatters';

const OrderDetail = () => {
  const { orderId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setError('ID de orden no válido');
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Referencia al documento de la orden
    const orderRef = doc(db, "order", orderId);
    
    // Suscribirse a cambios en tiempo real
    const unsubscribe = onSnapshot(orderRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          const orderData = docSnap.data();
          console.log('✅ Orden actualizada en tiempo real:', orderData);
          
          // Verificar que la orden pertenece al usuario actual
          if (currentUser && orderData.userId !== currentUser.id) {
            setError('No tienes permisos para ver esta orden');
            setLoading(false);
            return;
          }
          
          // Normalizar datos para consistencia
          const normalizedOrder = {
            id: orderData.orderId || docSnap.id,
            ...orderData,
            // Priorizar estado desde Firebase
            status: orderData.estado || orderData.status || 'pendiente',
            estado: orderData.estado || orderData.status || 'pendiente',
            // Asegurar que date exista
            date: orderData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            // Asegurar campos numéricos
            discountAmount: orderData.discountAmount || 0,
            shippingCost: orderData.shippingCost || 0,
            subtotal: orderData.subtotal || 0,
            total: orderData.total || 0,
            // Asegurar que items exista
            items: orderData.items || [],
            // Asegurar que shippingInfo exista con estructura completa
            shippingInfo: orderData.shippingInfo || {}
          };
          
          setOrder(normalizedOrder);
          setError('');
        } else {
          setError('Orden no encontrada en Firebase');
        }
        setLoading(false);
      },
      (err) => {
        console.error('❌ Error en suscripción a orden:', err);
        setError('Error al cargar la orden: ' + err.message);
        setLoading(false);
        
        // Fallback a localStorage si hay error
        try {
          const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
          const localOrder = allOrders.find(o => o.id === orderId || o.orderId === orderId);
          if (localOrder && currentUser && localOrder.userId === currentUser.id) {
            setOrder(localOrder);
            setError('');
          }
        } catch (e) {
          console.error('Error con fallback:', e);
        }
      }
    );

    // Limpiar suscripción al desmontar
    return () => unsubscribe();
  }, [orderId, currentUser]);

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

  const getPaymentMethodText = (method) => {
    if (!method) return 'No especificado';
    
    switch (method.toLowerCase()) {
      case 'cash':
        return 'Pago Contra Entrega';
      case 'transfer':
        return 'Transferencia Bancaria';
      case 'card':
      case 'tarjeta':
        return 'Tarjeta de Crédito/Débito';
      default:
        return method;
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

  if (loading) {
    return (
      <Container className="my-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Cargando detalles del pedido...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-4">
        <Alert variant="danger">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        </Alert>
        <Button variant="primary" onClick={() => navigate('/mis-pedidos')}>
          Volver a Mis Pedidos
        </Button>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="my-4">
        <Alert variant="warning">
          No se encontró la orden solicitada
        </Alert>
        <Button variant="primary" onClick={() => navigate('/mis-pedidos')}>
          Volver a Mis Pedidos
        </Button>
      </Container>
    );
  }

  // Obtener información de envío normalizada
  const shippingInfo = order.shippingInfo || {};
  const items = order.items || [];
  const estadoActual = order.estado || order.status || 'pendiente';

  return (
    <Container className="my-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/mis-pedidos')}
                className="mb-3"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Volver a Mis Pedidos
              </Button>
              <h2>Detalle del Pedido</h2>
              <p className="text-muted">Revisa los detalles de tu pedido</p>
            </div>
            <div className="text-end">
              <Badge bg={getStatusVariant(estadoActual)} className="fs-6 px-3 py-2 mb-2">
                {getStatusText(estadoActual)}
              </Badge>
              <div>
                <small className="text-muted">
                  Última actualización: {formatDate(order.updatedAt)}
                </small>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Información de la Orden */}
        <Col lg={8}>
          {/* Productos */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-bag me-2"></i>
                Productos ({items.length})
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              {items.length > 0 ? (
                <Table responsive className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th width="60px"></th>
                      <th>Producto</th>
                      <th className="text-center">Cantidad</th>
                      <th className="text-end">Precio Unitario</th>
                      <th className="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <img
                            src={item.image || '/images/productos/default.png'}
                            alt={item.name || 'Producto'}
                            className="rounded"
                            style={{
                              width: '50px',
                              height: '50px',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              e.target.src = '/images/productos/default.png';
                            }}
                          />
                        </td>
                        <td>
                          <div>
                            <h6 className="mb-1">{item.name || 'Producto'}</h6>
                            {item.id && (
                              <small className="text-muted">ID: {item.id}</small>
                            )}
                            {item.categoryName && (
                              <div>
                                <Badge bg="info" className="mt-1">
                                  {item.categoryName}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="fw-bold">{item.quantity || 1}</span>
                        </td>
                        <td className="text-end">
                          ${formatPrice(item.price || 0)}
                        </td>
                        <td className="text-end fw-bold">
                          ${formatPrice((item.price || 0) * (item.quantity || 1))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-inbox fs-1 text-muted"></i>
                  <p className="mt-3">No hay productos en esta orden</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Información de Envío */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-truck me-2"></i>
                Información de Envío
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6 className="border-bottom pb-2">Datos de Contacto</h6>
                  <p className="mb-1">
                    <strong>Nombre:</strong> {shippingInfo.nombreCompleto || order.userName || 'No especificado'}
                  </p>
                  <p className="mb-1">
                    <strong>Email:</strong> {shippingInfo.email || order.userEmail || 'No especificado'}
                  </p>
                  <p className="mb-1">
                    <strong>Teléfono:</strong> {shippingInfo.telefono || 'No especificado'}
                  </p>
                </Col>
                <Col md={6}>
                  <h6 className="border-bottom pb-2">Dirección de Entrega</h6>
                  <p className="mb-1">
                    <strong>Dirección:</strong> {shippingInfo.direccionCompleta || 'No especificada'}
                  </p>
                  <p className="mb-1">
                    <strong>Comuna:</strong> {shippingInfo.comuna || 'No especificada'}
                  </p>
                  <p className="mb-1">
                    <strong>Región:</strong> {shippingInfo.region || 'No especificada'}
                  </p>
                  <p className="mb-1">
                    <strong>Tipo de vivienda:</strong> {shippingInfo.tipoVivienda || 'No especificado'}
                  </p>
                  {shippingInfo.codigoPostal && (
                    <p className="mb-1">
                      <strong>Código Postal:</strong> {shippingInfo.codigoPostal}
                    </p>
                  )}
                  {shippingInfo.notas && shippingInfo.notas.trim() !== '' && (
                    <div className="mt-2 p-2 bg-light rounded">
                      <strong>Notas de entrega:</strong><br />
                      {shippingInfo.notas}
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Resumen y Información Adicional */}
        <Col lg={4}>
          {/* Resumen de la Orden */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-receipt me-2"></i>
                Resumen de la Orden
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Número de Orden:</strong><br />
                <code className="fs-6">{order.id}</code>
              </div>

              <div className="mb-3">
                <strong>Fecha del Pedido:</strong><br />
                {formatDate(order.createdAt || order.date)}
              </div>

              <div className="mb-3">
                <strong>Método de Pago:</strong><br />
                {getPaymentMethodText(order.paymentMethod)}
              </div>

              <hr />

              <div className="order-summary">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>${formatPrice(order.subtotal || 0)}</span>
                </div>

                {order.discountAmount > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Descuentos:</span>
                    <span>-${formatPrice(order.discountAmount)}</span>
                  </div>
                )}

                <div className="d-flex justify-content-between mb-2">
                  <span>Envío:</span>
                  <span>
                    {(order.shippingCost === 0 || order.shippingCost === '0') ? 
                      <Badge bg="success" className="px-2 py-1">GRATIS</Badge> : 
                      `$${formatPrice(order.shippingCost)}`
                    }
                  </span>
                </div>

                <hr />

                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total:</span>
                  <span className="text-success">${formatPrice(order.total || 0)}</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Descuentos Aplicados */}
          {order.discounts && (
            <Card className="border-success mb-4">
              <Card.Header className="bg-success bg-opacity-10">
                <h6 className="mb-0 text-success">
                  <i className="bi bi-tag me-2"></i>
                  Descuentos Aplicados
                </h6>
              </Card.Header>
              <Card.Body>
                {(order.discounts.seniorDiscount || order.discounts.seniorDiscount === true) && (
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-coin text-success me-2"></i>
                    <span>50% Descuento (Mayor de 50 años)</span>
                  </div>
                )}
                {(order.discounts.codeDiscount || order.discounts.codeDiscount === true) && (
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-tag text-success me-2"></i>
                    <span>10% Descuento Adicional</span>
                  </div>
                )}
                {(order.discounts.birthdayDiscount || order.discounts.birthdayDiscount === true) && (
                  <div className="d-flex align-items-center">
                    <i className="bi bi-gift text-success me-2"></i>
                    <span>Descuento de Cumpleaños</span>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Historial de Estado */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Historial del Pedido
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="timeline">
                <div className={`timeline-item ${['pendiente', 'confirmado', 'en_preparacion', 'en_camino', 'entregado'].indexOf(estadoActual) >= 0 ? 'active' : ''}`}>
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <small>Pedido realizado</small>
                    <div>{formatDate(order.createdAt)}</div>
                  </div>
                </div>
                
                {estadoActual !== 'pendiente' && (
                  <div className={`timeline-item ${['confirmado', 'en_preparacion', 'en_camino', 'entregado'].indexOf(estadoActual) >= 0 ? 'active' : ''}`}>
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <small>Pedido confirmado</small>
                      {order.updatedAt && <div>{formatDate(order.updatedAt)}</div>}
                    </div>
                  </div>
                )}
                
                {['en_preparacion', 'en_camino', 'entregado'].includes(estadoActual) && (
                  <div className={`timeline-item ${['en_preparacion', 'en_camino', 'entregado'].indexOf(estadoActual) >= 0 ? 'active' : ''}`}>
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <small>En preparación</small>
                    </div>
                  </div>
                )}
                
                {['en_camino', 'entregado'].includes(estadoActual) && (
                  <div className={`timeline-item ${['en_camino', 'entregado'].indexOf(estadoActual) >= 0 ? 'active' : ''}`}>
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <small>En camino</small>
                    </div>
                  </div>
                )}
                
                {estadoActual === 'entregado' && (
                  <div className="timeline-item active">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <small>Entregado</small>
                    </div>
                  </div>
                )}
              </div>
              
              <style jsx>{`
                .timeline {
                  position: relative;
                  padding-left: 20px;
                }
                .timeline-item {
                  position: relative;
                  padding-bottom: 20px;
                }
                .timeline-item:last-child {
                  padding-bottom: 0;
                }
                .timeline-marker {
                  position: absolute;
                  left: -20px;
                  top: 0;
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  background-color: #dee2e6;
                  border: 2px solid white;
                }
                .timeline-item.active .timeline-marker {
                  background-color: #0d6efd;
                }
                .timeline-content {
                  margin-left: 10px;
                }
              `}</style>
            </Card.Body>
          </Card>

          {/* Acciones */}
          <Card>
            <Card.Body>
              <h6 className="mb-3">¿Necesitas ayuda?</h6>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" size="sm">
                  <i className="bi bi-question-circle me-2"></i>
                  Contactar Soporte
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => window.print()}
                >
                  <i className="bi bi-printer me-2"></i>
                  Imprimir Comprobante
                </Button>
                <Button 
                  variant="outline-info" 
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Actualizar Estado
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderDetail;