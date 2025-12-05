import React from 'react';
import { Row, Col, Button, Card, Spinner } from 'react-bootstrap';
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
  shippingConfig,
  hasRegionSelected,
  isShippingLoading
}) => {
  return (
    <div className="checkout-summary">
      <h4 className="mb-4">Resumen de tu Pedido</h4>

      {/* DESCUENTOS - SOLO SI HAY */}
      {discountAmount > 0 && (
        <Card className="mb-3 border-success">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-success">
                <i className="bi bi-tag-fill me-2"></i>
                <strong>Descuentos Aplicados</strong>
              </div>
              <div className="text-success fw-bold">-${formatPrice(discountAmount)}</div>
            </div>
            <div className="mt-2">
              {userDiscounts.seniorDiscount && (
                <div className="small text-success">
                  <i className="bi bi-coin me-1"></i> 50% descuento (Mayor de 50 años)
                </div>
              )}
              {userDiscounts.codeDiscount && (
                <div className="small text-success">
                  <i className="bi bi-tag me-1"></i> 10% descuento (Código FELICES50)
                </div>
              )}
              {userDiscounts.birthdayDiscount && (
                <div className="small text-success">
                  <i className="bi bi-gift me-1"></i> Torta gratis (Cumpleaños)
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      )}

      <div className="cart-items mb-4">
        {cartItems.map(item => (
          <Card key={item.id} className="mb-3">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={2}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="img-fluid rounded"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                </Col>
                <Col md={4}>
                  <h6 className="mb-1">{item.name}</h6>
                  <small className="text-muted">${formatPrice(item.price)} c/u</small>
                </Col>
                <Col md={3}>
                  <div className="d-flex align-items-center">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="mx-3 fw-bold">{item.quantity}</span>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </Col>
                <Col md={2} className="text-end">
                  <strong>${formatPrice(item.price * item.quantity)}</strong>
                </Col>
                <Col md={1}>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* RESUMEN */}
      <Card className="bg-light">
        <Card.Body>
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
              <span>{shippingCost === 0 ? 'GRATIS' : `$${formatPrice(shippingCost)}`}</span>
            </div>
          ) : null}

          <hr />
          <div className="d-flex justify-content-between fw-bold fs-5">
            <span>Total:</span>
            <span>${formatPrice(total)}</span>
          </div>
        </Card.Body>
      </Card>

      <div className="checkout-actions mt-4">
        <Row>
          <Col className="text-end">
            <Button
              className="checkout-btn-primary"
              onClick={onNextStep}
              disabled={cartItems.length === 0}
              size="lg"
            >
              {cartItems.length === 0 ? 'Carrito Vacío' : 'Continuar con Envío'}
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CheckoutSummary;