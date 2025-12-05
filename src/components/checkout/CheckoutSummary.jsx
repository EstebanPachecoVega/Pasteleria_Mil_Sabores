import React from 'react';
import { Row, Col, Button, Card, Spinner, Badge } from 'react-bootstrap';
import { formatPrice } from '../../utils/formatters';

const CheckoutSummary = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onNextStep,
  subtotal,
  shippingCost,
  total,
  discountAmount,
  userDiscounts = {},
  discountDetails = [],
  productStocks = {},
  shippingConfig,
  hasRegionSelected,
  isShippingLoading
}) => {
  console.log('🔍 CheckoutSummary: Recibidos', cartItems?.length, 'items');
  console.log('🔍 CheckoutSummary: Primer item:', cartItems[0]);

  const handleIncrement = (itemId, currentQuantity) => {
    const maxStock = productStocks[itemId] || 100;
    if (currentQuantity < maxStock) {
      onUpdateQuantity(itemId, currentQuantity + 1);
    } else {
      alert(`No hay suficiente stock. Máximo disponible: ${maxStock} unidades.`);
    }
  };

  const handleDecrement = (itemId, currentQuantity) => {
    if (currentQuantity > 1) {
      onUpdateQuantity(itemId, currentQuantity - 1);
    } else {
      onRemoveItem(itemId);
    }
  };

  const hasOverStock = cartItems?.some(item =>
    item.quantity > (productStocks[item.id] || 100)
  );

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="checkout-summary">
        <h4 className="mb-4">Resumen de tu Pedido</h4>
        <Card className="text-center py-4 py-md-5">
          <Card.Body>
            <i className="bi bi-cart-x text-muted" style={{ fontSize: '2.5rem' }}></i>
            <h5 className="mt-3">Tu carrito está vacío</h5>
            <p className="text-muted mb-0">Agrega productos para continuar con la compra.</p>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="checkout-summary">
      <h4 className="mb-4">Resumen de tu Pedido</h4>

      {/* DESCUENTOS */}
      {discountAmount > 0 && (
        <Card className="mb-3 border-success">
          <Card.Body className="p-2 p-md-3">
            <div className="d-flex align-items-center justify-content-between mb-1 mb-md-2">
              <div className="d-flex align-items-center">
                <i className="bi bi-tag-fill text-success fs-5 me-2"></i>
                <h6 className="mb-0 text-success d-none d-md-block">Descuentos Aplicados</h6>
                <small className="mb-0 text-success d-md-none">Descuentos</small>
              </div>
              <Badge bg="success" className="fs-6">
                -${formatPrice(discountAmount)}
              </Badge>
            </div>

            {discountDetails.length > 0 && (
              <div className="small text-success">
                <i className="bi bi-check-circle me-1"></i>
                {discountDetails[0]}
                {discountDetails.length > 1 && (
                  <span className="ms-1 d-none d-md-inline">+ {discountDetails.length - 1} más</span>
                )}
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      <div className="cart-items mb-4">
        {cartItems.map(item => {
          const maxStock = productStocks[item.id] || item.stock || 100;
          const stockAvailable = maxStock - item.quantity;
          const isOverStock = item.quantity > maxStock;
          const price = item.precio || item.price || 0;
          const nombre = item.nombre || item.name || 'Producto sin nombre';
          const imagen = item.image || item.imagen || '/images/placeholder.jpg';

          return (
            <Card key={item.id} className="mb-3">
              <Card.Body className="p-2 p-md-3">
                {/* MÓVIL - Layout apilado */}
                <div className="d-md-none">
                  <div className="d-flex align-items-start mb-3">
                    <div className="me-3 flex-shrink-0">
                      <img
                        src={imagen}
                        alt={nombre}
                        className="img-fluid rounded"
                        style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{nombre}</h6>
                      <div className="mb-2">
                        <small className="text-muted">${formatPrice(price)} c/u</small>
                      </div>
                      <div className="mb-3">
                        <small className={stockAvailable <= 5 ? 'text-warning' : 'text-muted'}>
                          Stock disponible: {maxStock} unidades
                        </small>
                        {isOverStock && (
                          <small className="text-danger d-block">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            Excede stock disponible
                          </small>
                        )}
                      </div>

                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="px-3 py-1"
                            onClick={() => handleDecrement(item.id, item.quantity)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </Button>
                          <span className="mx-3 fw-bold">{item.quantity}</span>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="px-3 py-1"
                            onClick={() => handleIncrement(item.id, item.quantity)}
                            disabled={item.quantity >= maxStock}
                          >
                            +
                          </Button>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold mb-1">${formatPrice(price * item.quantity)}</div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="px-2 py-1"
                            onClick={() => onRemoveItem(item.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </div>

                      {stockAvailable <= 5 && stockAvailable > 0 && (
                        <small className="text-warning d-block mt-2 text-center">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          Solo {stockAvailable} disponible(s)
                        </small>
                      )}
                    </div>
                  </div>
                </div>

                {/* DESKTOP - Layout en fila */}
                <Row className="d-none d-md-flex align-items-center">
                  <Col md={2}>
                    <img
                      src={imagen}
                      alt={nombre}
                      className="img-fluid rounded"
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                    />
                  </Col>
                  <Col md={4}>
                    <h6 className="mb-1">{nombre}</h6>
                    <div className="d-flex align-items-center">
                      <small className="text-muted me-2">${formatPrice(price)} c/u</small>
                    </div>
                    <div className="mt-1">
                      <small className={stockAvailable <= 5 ? 'text-warning' : 'text-muted'}>
                        Stock disponible: {maxStock} unidades
                      </small>
                      {isOverStock && (
                        <small className="text-danger d-block">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          Excede stock disponible
                        </small>
                      )}
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="d-flex flex-column align-items-center">
                      <div className="d-flex align-items-center justify-content-center mb-1">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="px-2 py-1"
                          onClick={() => handleDecrement(item.id, item.quantity)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </Button>
                        <span className="mx-2 fw-bold">{item.quantity}</span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="px-2 py-1"
                          onClick={() => handleIncrement(item.id, item.quantity)}
                          disabled={item.quantity >= maxStock}
                        >
                          +
                        </Button>
                      </div>
                      {stockAvailable <= 5 && stockAvailable > 0 && (
                        <small className="text-warning text-center">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          Solo {stockAvailable} disponible(s)
                        </small>
                      )}
                    </div>
                  </Col>
                  <Col md={2} className="text-end">
                    <div className="fw-bold">${formatPrice(price * item.quantity)}</div>
                  </Col>
                  <Col md={1} className="text-end">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="px-2 py-1"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          );
        })}
      </div>

      {/* RESUMEN */}
      <Card className="order-summary-card">
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between mb-2">
            <span>Subtotal:</span>
            <span>${formatPrice(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="d-flex justify-content-between mb-2 text-success">
              <span>Descuentos:</span>
              <span>-${formatPrice(discountAmount)}</span>
            </div>
          )}

          {isShippingLoading ? (
            <div className="d-flex justify-content-between mb-2">
              <span>Envío:</span>
              <span>
                <Spinner animation="border" size="sm" className="me-2" />
                Calculando...
              </span>
            </div>
          ) : hasRegionSelected ? (
            <div className="d-flex justify-content-between mb-2">
              <span>Envío:</span>
              <span className={shippingCost === 0 ? 'text-success fw-bold' : ''}>
                {shippingCost === 0 ? 'GRATIS' : `$${formatPrice(shippingCost)}`}
              </span>
            </div>
          ) : (
            <div className="d-flex justify-content-between mb-2 text-muted">
              <span>Envío:</span>
              <small>Se calculará al seleccionar región</small>
            </div>
          )}

          <hr />
          <div className="d-flex justify-content-between fw-bold fs-5">
            <span>Total:</span>
            <span>${formatPrice(total)}</span>
          </div>
        </Card.Body>
      </Card>

      <div className="checkout-actions mt-4">
        <Row className="g-3">
          <Col xs={12} md={6}>
            <Button
              className="continue-shopping-btn btn-outline-secondary w-100 py-2"
              variant="outline-secondary"
              onClick={() => window.history.back()}
              size="lg"
            >
              <i className="bi bi-arrow-left me-2"></i>
              Volver / Continuar Comprando
            </Button>
          </Col>

          <Col xs={12} md={6}>
            <Button
              className="proceed-payment-btn w-100 py-2"
              onClick={onNextStep}
              disabled={cartItems.length === 0 || hasOverStock}
              size="lg"
            >
              {hasOverStock ? 'Ajusta cantidades' : cartItems.length === 0 ? 'Carrito Vacío' : 'Continuar con Envío'}
              <i className="bi bi-truck ms-2"></i>
            </Button>
          </Col>
        </Row>

        {hasOverStock && (
          <div className="mt-3 text-center">
            <small className="text-warning">
              <i className="bi bi-exclamation-triangle me-1"></i>
              Algunos productos exceden el stock disponible
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutSummary;