// src/components/products/ProductDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Breadcrumb, Badge, InputGroup, Alert } from 'react-bootstrap';
import { getProductById } from '../../data/products';
import { formatPrice } from '../../utils/formatters';

const ProductDetails = () => {
  const { productId } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);

  const maxQuantity = 100;
  const availableToAdd = maxQuantity - cartQuantity;
  const isMaxInCart = cartQuantity >= maxQuantity;
  const isOutOfStock = product?.stock === 0;

  useEffect(() => {
    const loadProduct = () => {
      setLoading(true);
      const foundProduct = getProductById(productId);

      setTimeout(() => {
        setProduct(foundProduct);
        setLoading(false);
      }, 500);
    };

    loadProduct();
  }, [productId]);

  useEffect(() => {
    const updateCartQuantity = () => {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const cartItem = cart.find(item => item.id === productId);
      setCartQuantity(cartItem ? cartItem.quantity : 0);
    };

    updateCartQuantity();
    window.addEventListener('cartUpdated', updateCartQuantity);

    return () => {
      window.removeEventListener('cartUpdated', updateCartQuantity);
    };
  }, [productId]);

  const handleAddToCart = () => {
    if (!product || isMaxInCart || isOutOfStock) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      existingItem.quantity = Math.min(newQuantity, maxQuantity);
    } else {
      cart.push({ ...product, quantity: quantity });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));

    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const productImages = product?.images || (product ? [product.image] : []);

  if (loading) {
    return (
      <Container fluid className="py-5">
        <Row>
          <Col className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3">Cargando producto...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container fluid className="py-5">
        <Row>
          <Col className="text-center">
            <h2>Producto no encontrado</h2>
            <p>El producto que buscas no existe o ha sido removido.</p>
            <Link to="/productos" className="btn btn-primary">
              Volver a Productos
            </Link>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Row>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
              Inicio
            </Breadcrumb.Item>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/productos" }}>
              Productos
            </Breadcrumb.Item>
            <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      {showAlert && (
        <Alert variant="success" className="text-center">
          <i className="bi bi-check-circle-fill me-2"></i>
          ¡{quantity} {product.name} agregado(s) al carrito!
          {quantity > availableToAdd && (
            <div className="small mt-1">Se ha alcanzado el límite máximo de 100 unidades</div>
          )}
        </Alert>
      )}

      <Row className="my-4">
        <Col lg={6} md={12} className="mb-4">
          <div className="product-gallery">
            <div className="main-image-container text-center mb-3">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="main-image img-fluid rounded shadow-sm"
                style={{
                  filter: isOutOfStock ? 'grayscale(70%)' : 'none'
                }}
              />
            </div>

            <div className="thumbnails-container">
              <div className="thumbnails-row">
                {productImages.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className={`thumbnail-item ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="thumbnail-image"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Col>

        <Col lg={6} md={12}>
          <div className="product-info">
            <h1 className="product-title-detail mb-3">
              {product.name}
            </h1>

            <div className="mb-3">
              <Badge className="category-badge-detail me-2">
                {product.category}
              </Badge>
              {isOutOfStock ? (
                <Badge bg="danger" className="stock-badge-detail">
                  NO DISPONIBLE
                </Badge>
              ) : (
                <Badge bg="success" className="stock-badge-detail">
                  Disponible
                </Badge>
              )}
            </div>

            <div className="price-section mb-3">
              <h1 className="product-price-detail fw-bold mb-2">
                ${formatPrice(product.price)}
              </h1>
              <p>Precio por unidad</p>
            </div>

            <div className="description-section mb-3">
              <h4 className="mb-3">Descripción</h4>
              <p className="product-description-detail">{product.description}</p>
            </div>

            <div className="purchase-section">
              <Row className="align-items-center">
                {/* Columna del selector de cantidad */}
                <Col md={4} sm={12} className="mb-3">
                  <div className="quantity-section d-flex flex-column align-items-center align-items-md-start">
                    <label htmlFor="quantity-input" className="form-label fw-bold mb-2">
                      Cantidad:
                    </label>
                    <InputGroup className="justify-content-center justify-content-md-start">
                      <Button
                        className="decrease-quantity-detail"
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        disabled={quantity <= 1 || isOutOfStock}
                      >
                        <i className="bi bi-dash"></i>
                      </Button>
                      <input
                        id="quantity-input"
                        type="number"
                        className="form-control text-center input-number"
                        style={{ width: '70px' }}
                        value={quantity}
                        min="1"
                        max={isOutOfStock ? 0 : availableToAdd}
                        onChange={(e) => {
                          if (isOutOfStock) return;
                          const value = parseInt(e.target.value) || 1;
                          setQuantity(Math.max(1, Math.min(availableToAdd, value)));
                        }}
                        disabled={isOutOfStock}
                      />
                      <Button
                        className="increase-quantity-detail"
                        onClick={() => setQuantity(q => Math.min(availableToAdd, q + 1))}
                        disabled={quantity >= availableToAdd || isOutOfStock}
                      >
                        <i className="bi bi-plus"></i>
                      </Button>
                    </InputGroup>
                    <div className="form-text text-center text-md-start mt-1 w-100">
                      {isOutOfStock ? 'Producto no disponible' : 'Máximo 100 unidades por producto'}
                    </div>
                  </div>
                </Col>

                {/* Columna del botón agregar al carrito */}
                <Col md={8} sm={12} className="mb-3">
                  <div className="add-to-cart-section d-flex flex-column align-items-center align-items-md-start">
                    <Button
                      className="btn btn-add-to-cart"
                      size="lg"
                      type="button"
                      onClick={handleAddToCart}
                      disabled={isMaxInCart || quantity > availableToAdd || isOutOfStock}
                      style={{ minWidth: '200px' }}
                    >
                      <i className="bi bi-cart-plus me-2"></i>
                      {isOutOfStock ? 'PRODUCTO AGOTADO' : 
                       isMaxInCart ? 'Límite alcanzado (100)' : `Añadir al Carrito (${quantity})`}
                    </Button>
                  </div>
                </Col>
              </Row>

              {/* Mensajes debajo de ambas columnas */}
              <Row>
                <Col sm={12}>
                  <div className="cart-messages mt-2 text-center text-md-start">
                    {isOutOfStock && (
                      <div className="text-danger">
                        <small>Este producto no está disponible actualmente.</small>
                      </div>
                    )}
                    {!isOutOfStock && isMaxInCart && (
                      <div className="text-danger">
                        <small>Has alcanzado el límite máximo de 100 unidades de este producto en el carrito.</small>
                      </div>
                    )}
                    {!isOutOfStock && !isMaxInCart && availableToAdd < maxQuantity && (
                      <div className="text-muted">
                        <small>Actualmente tienes {cartQuantity} en el carrito. Puedes agregar hasta {availableToAdd} más.</small>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </div>

            <div className="product-features mt-3">
              <h5 className="mb-3">Características:</h5>
              <ul className="list-unstyled">
                <li><i className="bi bi-check text-success me-2"></i>Producto artesanal</li>
                <li><i className="bi bi-check text-success me-2"></i>Ingredientes de calidad</li>
                <li><i className="bi bi-check text-success me-2"></i>Entrega en todo Chile</li>
                <li><i className="bi bi-check text-success me-2"></i>Preparación fresca</li>
              </ul>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col className="text-center">
          <Link to="/productos" className="btn back-detail-btn">
            <i className="bi bi-arrow-left me-2"></i>
            Volver a todos los productos
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetails;