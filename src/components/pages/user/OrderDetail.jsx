import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Table, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getOrderById } from '../../../services/firestoreService';
import { formatPrice } from '../../../utils/formatters';

const OrderDetail = () => {
  const { orderId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        console.log('Cargando orden:', orderId);

        const orderData = await getOrderById(orderId);
        console.log('Datos de orden cargados:', orderData);

        if (orderData) {
          // Verificar que la orden pertenece al usuario actual
          if (currentUser && orderData.userId !== currentUser.id) {
            setError('No tienes permisos para ver esta orden');
            return;
          }
          setOrder(orderData);
        } else {
          setError('Orden no encontrada');
        }
      } catch (err) {
        console.error('Error al cargar la orden:', err);
        setError('Error al cargar la orden: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrder();
    }
  }, [orderId, currentUser]);

  // Datos de regiones y comunas
  const regions = [
    { id: 1, name: 'Región Metropolitana' },
    { id: 2, name: 'Región de Valparaíso' },
    { id: 3, name: 'Región del Biobío' },
  ];

  const communes = {
    1: [
      { id: 1, name: 'Santiago' },
      { id: 2, name: 'Providencia' },
      { id: 3, name: 'Las Condes' },
      { id: 4, name: 'Ñuñoa' },
      { id: 5, name: 'Maipú' },
      { id: 6, name: 'Puente Alto' },
    ],
    2: [
      { id: 7, name: 'Valparaíso' },
      { id: 8, name: 'Viña del Mar' },
      { id: 9, name: 'Quilpué' }
    ],
    3: [
      { id: 10, name: 'Concepción' },
      { id: 11, name: 'Talcahuano' },
      { id: 12, name: 'Chiguayante' }
    ]
  };

  // Función para obtener nombre de región
  const getRegionName = (regionId) => {
    if (!regionId) return '';
    const region = regions.find(r => r.id == regionId);
    return region ? region.name : '';
  };

  // Función para obtener nombre de comuna
  const getComunaName = (comunaId, regionId) => {
    if (!comunaId || !regionId) return '';
    const regionCommunes = communes[regionId] || [];
    const comuna = regionCommunes.find(c => c.id == comunaId);
    return comuna ? comuna.name : '';
  };

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

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmado':
        return 'Confirmado';
      case 'en_preparacion':
        return 'En Preparación';
      case 'en_camino':
        return 'En Camino';
      case 'entregado':
        return 'Entregado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cash':
        return 'Pago Contra Entrega';
      case 'transfer':
        return 'Transferencia Bancaria';
      case 'card':
        return 'Tarjeta de Crédito/Débito';
      default:
        return method;
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
            <Badge bg={getStatusVariant(order.status)} className="fs-6">
              {getStatusText(order.status)}
            </Badge>
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
                Productos ({order.items?.length || 0})
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
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
                  {order.items?.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="rounded"
                          style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'cover'
                          }}
                        />
                      </td>
                      <td>
                        <div>
                          <h6 className="mb-1">{item.name}</h6>
                          <small className="text-muted">ID: {item.id}</small>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="fw-bold">{item.quantity}</span>
                      </td>
                      <td className="text-end">
                        ${formatPrice(item.price)}
                      </td>
                      <td className="text-end fw-bold">
                        ${formatPrice(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Información de Envío */}
          {order.shippingInfo && (
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
                      <strong>Nombre:</strong> {order.shippingInfo.nombreCompleto}
                    </p>
                    <p className="mb-1">
                      <strong>Email:</strong> {order.shippingInfo.email}
                    </p>
                    <p className="mb-1">
                      <strong>Teléfono:</strong> {order.shippingInfo.telefono}
                    </p>
                  </Col>
                  <Col md={6}>
                    <h6 className="border-bottom pb-2">Dirección de Entrega</h6>
                    <p className="mb-1">
                      <strong>Dirección:</strong> {order.shippingInfo.direccionCompleta}
                    </p>
                    {order.shippingInfo.region && (
                      <p className="mb-1">
                        <strong>Región:</strong> {getRegionName(order.shippingInfo.region)}
                      </p>
                    )}
                    {order.shippingInfo.comuna && (
                      <p className="mb-1">
                        <strong>Comuna:</strong> {getComunaName(order.shippingInfo.comuna, order.shippingInfo.region)}
                      </p>
                    )}
                    {order.shippingInfo.codigoPostal && (
                      <p className="mb-1">
                        <strong>Código Postal:</strong> {order.shippingInfo.codigoPostal}
                      </p>
                    )}
                    {order.shippingInfo.notes && (
                      <div className="mt-2 p-2 bg-light rounded">
                        <strong>Notas de entrega:</strong><br />
                        {order.shippingInfo.notes}
                      </div>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
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
                {formatDate(order.date)}
              </div>

              <div className="mb-3">
                <strong>Método de Pago:</strong><br />
                {getPaymentMethodText(order.paymentMethod)}
              </div>

              <hr />

              <div className="order-summary">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>${formatPrice(order.subtotal || order.total + (order.discountAmount || 0))}</span>
                </div>

                {order.discountAmount > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Descuentos:</span>
                    <span>-${formatPrice(order.discountAmount)}</span>
                  </div>
                )}

                <div className="d-flex justify-content-between mb-2">
                  <span>Envío:</span>
                  <span>{order.shippingCost === 0 ? 'GRATIS' : `$${formatPrice(order.shippingCost)}`}</span>
                </div>

                <hr />

                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total:</span>
                  <span>${formatPrice(order.total)}</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Descuentos Aplicados */}
          {order.discounts && (order.discounts.seniorDiscount || order.discounts.codeDiscount) && (
            <Card className="border-success">
              <Card.Header className="bg-success bg-opacity-10">
                <h6 className="mb-0 text-success">
                  <i className="bi bi-tag me-2"></i>
                  Descuentos Aplicados
                </h6>
              </Card.Header>
              <Card.Body>
                {order.discounts.seniorDiscount && (
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-coin text-success me-2"></i>
                    <span>50% Descuento (Mayor de 50 años)</span>
                  </div>
                )}
                {order.discounts.codeDiscount && (
                  <div className="d-flex align-items-center">
                    <i className="bi bi-tag text-success me-2"></i>
                    <span>10% Descuento Adicional</span>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Acciones */}
          <Card>
            <Card.Body>
              <h6 className="mb-3">¿Necesitas ayuda?</h6>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" size="sm">
                  <i className="bi bi-question-circle me-2"></i>
                  Contactar Soporte
                </Button>
                <Button variant="outline-secondary" size="sm">
                  <i className="bi bi-printer me-2"></i>
                  Imprimir Comprobante
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