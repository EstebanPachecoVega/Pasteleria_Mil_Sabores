// src/components/products/ProductDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Breadcrumb, Badge, InputGroup } from 'react-bootstrap';
import { getProductById } from '../../data/products';
import { formatPrice } from '../../utils/formatters';

const ProductDetails = () => {
  const { productId } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de producto con timeout para demostración
    const loadProduct = () => {
      setLoading(true);
      const foundProduct = getProductById(productId);

      setTimeout(() => {
        setProduct(foundProduct);
        setLoading(false);
      }, 500); // Pequeño delay para simular carga
    };

    loadProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ ...product, quantity: quantity });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));

    // Opcional: Mostrar mensaje de éxito
    alert(`${quantity} ${product.name} agregado(s) al carrito!`);
  };

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
      {/* Migas de pan */}
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

      <Row className="my-4">
        {/* Imagen del producto */}
        <Col lg={6} md={12} className="mb-4">
          <div className="main-image-container text-center">
            <img
              src={product.image}
              alt={product.name}
              className="img-fluid rounded shadow-sm"
              style={{
                maxHeight: '500px',
                width: 'auto',
                objectFit: 'cover'
              }}
            />
          </div>
        </Col>

        {/* Información del producto */}
        <Col lg={6} md={12}>
          <div className="product-info">
            <h1 className="product-title-detail mb-3">
              {product.name}
            </h1>

            <div className="mb-3">
              <Badge className="category-badge-detail me-2">
                {product.category}
              </Badge>
              <Badge className="stock-badge-detail">
                Disponible
              </Badge>
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
                <Col md={4} sm={6} className="mb-3">
                  <label htmlFor="quantity-input" className="form-label fw-bold">
                    Cantidad:
                  </label>
                  <InputGroup>
                    <Button
                      className="decrease-quantity-detail"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    >
                      <i className="bi bi-dash"></i>
                    </Button>
                    <input
                      id="quantity-input"
                      type="number"
                      className="form-control text-center input-number"
                      value={quantity}
                      min="1"
                      max="10"
                      onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    />
                    <Button
                      className="increase-quantity-detail"
                      onClick={() => setQuantity(q => Math.min(10, q + 1))}
                    >
                      <i className="bi bi-plus"></i>
                    </Button>
                  </InputGroup>
                </Col>

                <Col md={8} sm={6} className="mt-3">
                  <Button
                    className="btn btn-add-to-cart w-100"
                    size="lg"
                    type="button"
                    onClick={handleAddToCart}
                  >
                    <i className="bi bi-cart-plus me-2"></i>
                    Añadir al Carrito ({quantity})
                  </Button>
                </Col>
              </Row>
            </div>

            {/* Información adicional */}
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

      {/* Botón para volver */}
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