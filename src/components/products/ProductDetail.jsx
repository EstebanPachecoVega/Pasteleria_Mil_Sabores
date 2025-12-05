import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Breadcrumb, Badge, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { obtenerProductoPorId } from '../../data/products';
import { formatPrice, formatearCategoria } from '../../utils/formatters';

const ProductDetails = () => {
  const { productId } = useParams();
  const [cantidad, setCantidad] = useState(1);
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [cantidadCarrito, setCantidadCarrito] = useState(0);
  const [error, setError] = useState(null);

  const cantidadMaxima = 100;
  const disponibleParaAgregar = cantidadMaxima - cantidadCarrito;
  const limiteAlcanzado = cantidadCarrito >= cantidadMaxima;
  
  const nombreProducto = producto?.nombre || producto?.name || 'Sin nombre';
  const precioProducto = producto?.precio || producto?.price || 0;
  const stockProducto = producto?.stock || producto?.stock || 0;
  const descripcionProducto = producto?.descripcion || producto?.description || 'Sin descripción';
  const categoriaProducto = formatearCategoria(producto?.categoriaNombre || producto?.categoriaInfo?.nombre || producto?.categoria || 'Sin categoría');
  const activoProducto = producto?.activo !== false && producto?.active !== false;
  const destacadoProducto = producto?.destacado || producto?.featured || false;
  
  const sinStock = stockProducto === 0 || !activoProducto;

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        setCargando(true);
        setError(null);
        
        const productoEncontrado = await obtenerProductoPorId(productId);
        
        setProducto(productoEncontrado);
      } catch (err) {
        console.error('Error cargando producto:', err);
        setError('Error al cargar el producto');
      } finally {
        setCargando(false);
      }
    };

    cargarProducto();
  }, [productId]);

  useEffect(() => {
    const actualizarCantidadCarrito = () => {
      const carrito = JSON.parse(localStorage.getItem('cart')) || [];
      const itemCarrito = carrito.find(item => item.id === productId);
      setCantidadCarrito(itemCarrito ? itemCarrito.cantidad : 0);
    };

    actualizarCantidadCarrito();
    window.addEventListener('cartUpdated', actualizarCantidadCarrito);

    return () => {
      window.removeEventListener('cartUpdated', actualizarCantidadCarrito);
    };
  }, [productId]);

  const manejarAgregarCarrito = () => {
    if (!producto || limiteAlcanzado || sinStock) {
      return;
    }

    const carrito = JSON.parse(localStorage.getItem('cart')) || [];
    const itemExistente = carrito.find(item => item.id === producto.id);

    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + cantidad;
      itemExistente.cantidad = Math.min(nuevaCantidad, cantidadMaxima);
    } else {
      carrito.push({ 
        ...producto, 
        cantidad: cantidad,
        nombre: nombreProducto,
        precio: precioProducto,
        stock: stockProducto,
        destacado: destacadoProducto
      });
    }

    localStorage.setItem('cart', JSON.stringify(carrito));
    window.dispatchEvent(new Event('cartUpdated'));

    setMostrarAlerta(true);
    setTimeout(() => setMostrarAlerta(false), 3000);
  };

  const imagenesProducto = React.useMemo(() => {
    if (!producto) {
      return [];
    }
    
    if (producto.images && Array.isArray(producto.images) && producto.images.length > 0) {
      return producto.images;
    }
    
    const imagenPrincipal = producto.image || producto.imagen;
    if (imagenPrincipal) {
      return [imagenPrincipal];
    }
    
    return [];
  }, [producto]);

  if (cargando) {
    return (
      <Container fluid className="py-5">
        <Row>
          <Col className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
            <p className="mt-3">Cargando producto...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error || !producto) {
    return (
      <Container fluid className="py-5">
        <Row>
          <Col className="text-center">
            <h2>Producto no encontrado</h2>
            <p>{error || 'El producto que buscas no existe o ha sido removido.'}</p>
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
            <Breadcrumb.Item active>{nombreProducto}</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      {mostrarAlerta && (
        <Alert variant="success" className="text-center">
          <i className="bi bi-check-circle-fill me-2"></i>
          ¡{cantidad} {nombreProducto} agregado(s) al carrito!
          {cantidad > disponibleParaAgregar && (
            <div className="small mt-1">Se ha alcanzado el límite máximo de 100 unidades</div>
          )}
        </Alert>
      )}

      <Row className="my-4">
        <Col lg={6} md={12} className="mb-4">
          <div className="product-gallery">
            <div className="main-image-container text-center mb-3">
              <img
                src={imagenesProducto[imagenSeleccionada]}
                alt={nombreProducto}
                className="main-image img-fluid rounded shadow-sm"
                style={{
                  filter: sinStock ? 'grayscale(70%)' : 'none'
                }}
                onError={(e) => {
                  e.target.src = '/images/placeholder.jpg';
                }}
              />
            </div>

            {imagenesProducto.length > 1 && (
              <div className="thumbnails-container">
                <div className="thumbnails-row">
                  {imagenesProducto.slice(0, 4).map((image, index) => (
                    <div
                      key={index}
                      className={`thumbnail-item ${imagenSeleccionada === index ? 'active' : ''}`}
                      onClick={() => setImagenSeleccionada(index)}
                    >
                      <img
                        src={image}
                        alt={`${nombreProducto} ${index + 1}`}
                        className="thumbnail-image"
                        onError={(e) => {
                          e.target.src = '/images/placeholder.jpg';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Col>

        <Col lg={6} md={12}>
          <div className="product-info">
            <h1 className="product-title-detail mb-3">
              {nombreProducto}
            </h1>

            <div className="mb-3">
              <Badge className="category-badge-detail me-2">
                {categoriaProducto}
              </Badge>
              {sinStock ? (
                <Badge bg="danger" className="stock-badge-detail me-2">
                  NO DISPONIBLE
                </Badge>
              ) : (
                <Badge bg="success" className="stock-badge-detail me-2">
                  Disponible
                </Badge>
              )}
              {destacadoProducto && (
                <Badge bg="warning" className="stock-badge-detail">
                  <i className="bi bi-star-fill me-1"></i>
                  Destacado
                </Badge>
              )}
            </div>

            <div className="price-section mb-3">
              <h1 className="product-price-detail fw-bold mb-2">
                ${formatPrice(precioProducto)}
              </h1>
              <p>Precio por unidad</p>
            </div>

            <div className="description-section mb-3">
              <h4 className="mb-3">Descripción</h4>
              <p className="product-description-detail">{descripcionProducto}</p>
            </div>

            <div className="purchase-section">
              <Row className="align-items-center">
                <Col md={4} sm={12} className="mb-3">
                  <div className="quantity-section d-flex flex-column align-items-center align-items-md-start">
                    <label htmlFor="quantity-input" className="form-label fw-bold mb-2">
                      Cantidad:
                    </label>
                    <InputGroup className="justify-content-center justify-content-md-start">
                      <Button
                        className="decrease-quantity-detail"
                        onClick={() => setCantidad(q => Math.max(1, q - 1))}
                        disabled={cantidad <= 1 || sinStock}
                      >
                        <i className="bi bi-dash"></i>
                      </Button>
                      <input
                        id="quantity-input"
                        type="number"
                        className="form-control text-center input-number"
                        style={{ width: '70px' }}
                        value={cantidad}
                        min="1"
                        max={sinStock ? 0 : disponibleParaAgregar}
                        onChange={(e) => {
                          if (sinStock) {
                            return;
                          }
                          const valor = parseInt(e.target.value) || 1;
                          setCantidad(Math.max(1, Math.min(disponibleParaAgregar, valor)));
                        }}
                        disabled={sinStock}
                      />
                      <Button
                        className="increase-quantity-detail"
                        onClick={() => {
                          if (sinStock) {
                            return;
                          }
                          setCantidad(q => Math.min(disponibleParaAgregar, q + 1))
                        }}
                        disabled={cantidad >= disponibleParaAgregar || sinStock}
                      >
                        <i className="bi bi-plus"></i>
                      </Button>
                    </InputGroup>
                    <div className="form-text text-center text-md-start mt-1 w-100">
                      {sinStock ? 'Producto no disponible' : 'Máximo 100 unidades por producto'}
                    </div>
                  </div>
                </Col>

                <Col md={8} sm={12} className="mb-3">
                  <div className="add-to-cart-section d-flex flex-column align-items-center align-items-md-start">
                    <Button
                      className="btn btn-add-to-cart"
                      size="lg"
                      type="button"
                      onClick={manejarAgregarCarrito}
                      disabled={limiteAlcanzado || cantidad > disponibleParaAgregar || sinStock}
                      style={{ 
                        minWidth: '200px',
                        backgroundColor: sinStock ? '#6c757d' : '',
                        borderColor: sinStock ? '#6c757d' : ''
                      }}
                    >
                      <i className="bi bi-cart-plus me-2"></i>
                      {sinStock ? 'PRODUCTO AGOTADO' : 
                       limiteAlcanzado ? 'Límite alcanzado (100)' : `Añadir al Carrito (${cantidad})`}
                    </Button>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col sm={12}>
                  <div className="cart-messages mt-2 text-center text-md-start">
                    {sinStock && (
                      <div className="text-danger">
                        <small>Este producto no está disponible actualmente.</small>
                        {stockProducto === 0 && <div>Stock: 0 unidades</div>}
                        {!activoProducto && <div>Producto desactivado</div>}
                      </div>
                    )}
                    {!sinStock && limiteAlcanzado && (
                      <div className="text-danger">
                        <small>Has alcanzado el límite máximo de 100 unidades de este producto en el carrito.</small>
                      </div>
                    )}
                    {!sinStock && !limiteAlcanzado && disponibleParaAgregar < cantidadMaxima && (
                      <div className="text-muted">
                        <small>Actualmente tienes {cantidadCarrito} en el carrito. Puedes agregar hasta {disponibleParaAgregar} más.</small>
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