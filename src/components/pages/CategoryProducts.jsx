// src/components/pages/CategoryProducts.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Alert, Breadcrumb, Spinner } from 'react-bootstrap';
import ProductCard from '../products/ProductCard';
import { getProductsByCategoryRoute } from '../../data/products';

const CategoryProducts = () => {
  const { category } = useParams();
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('🔍 CategoryProducts - category from URL:', category);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        console.log('🔄 CategoryProducts - Cargando productos...');
        
        const products = await getProductsByCategoryRoute(category);
        
        console.log('📦 CategoryProducts - productos obtenidos:', products);
        console.log('📦 CategoryProducts - cantidad de productos:', products.length);
        
        setCategoryProducts(products);
      } catch (err) {
        console.error('❌ CategoryProducts - Error cargando productos:', err);
        setError('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [category]);

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

  // Mostrar spinner mientras carga
  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status" className="me-2" />
        <span>Cargando productos...</span>
      </Container>
    );
  }

  // Mostrar error si hay
  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger" className="text-center">
          <h5>Error al cargar los productos</h5>
          <p>{error}</p>
          <Link to="/productos" className="btn btn-primary">
            Volver a Productos
          </Link>
        </Alert>
      </Container>
    );
  }

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