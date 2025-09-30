// src/components/pages/CategoryProducts.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Alert, Breadcrumb } from 'react-bootstrap';
import ProductCard from '../products/ProductCard';
import { getProductsByCategoryRoute } from '../../data/products';

const CategoryProducts = () => {
  const { category } = useParams();
  const categoryProducts = getProductsByCategoryRoute(category);

  // Mapeo de URLs a nombres legibles
  const categoryNames = {
    individuales: 'Postres Individuales',
    cuadradas: 'Tortas Cuadradas',
    circulares: 'Tortas Circulares',
    especiales: 'Tortas Especiales',
    sin_azucar: 'Productos Sin Azúcar',
    sin_gluten: 'Productos Sin Gluten',
    veganos: 'Productos Veganos',
    tradicional: 'Pastelería Tradicional'
  };

  const categoryName = categoryNames[category] || 'Categoría';

  return (
    <Container className="py-4">
      {/* Migas de pan */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Inicio</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/productos' }}>Productos</Breadcrumb.Item>
        <Breadcrumb.Item active>{categoryName}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header de la categoría */}
      <div className="text-center mb-5">
        <h1 style={{ fontFamily: 'Pacifico, cursive' }}>{categoryName}</h1>
        <p className="lead">
          {categoryProducts.length > 0 
            ? `${categoryProducts.length} producto(s) disponibles`
            : 'No hay productos en esta categoría'
          }
        </p>
      </div>

      {/* Lista de productos */}
      {categoryProducts.length > 0 ? (
        <Row className="g-4 justify-content-start">
          {categoryProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Row>
      ) : (
        <Alert variant="info" className="text-center">
          <h5>No hay productos en esta categoría</h5>
          <p className="mb-3">Pronto agregaremos más productos a esta sección.</p>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <Link to="/productos" className="btn btn-primary">
              Ver Todos los Productos
            </Link>
            <Link to="/" className="btn btn-outline-secondary">
              Volver al Inicio
            </Link>
          </div>
        </Alert>
      )}
    </Container>
  );
};

export default CategoryProducts;