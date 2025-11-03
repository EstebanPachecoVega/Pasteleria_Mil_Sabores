import React, { useState, useEffect } from 'react';
import { Container, Row, Spinner, Alert } from 'react-bootstrap';
import ProductCard from '../products/ProductCard';
import { getFeaturedProducts } from '../../data/products'; // ✅ Usar función de Firebase

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        console.log('🔄 FeaturedProducts - Cargando productos destacados...');
        
        // ✅ Usar Firebase en lugar de datos locales
        const products = await getFeaturedProducts();
        
        console.log('✅ FeaturedProducts - Productos destacados cargados:', products.length);
        setFeaturedProducts(products);
      } catch (err) {
        console.error('❌ FeaturedProducts - Error cargando productos destacados:', err);
        setError('Error al cargar los productos destacados');
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  // Mostrar spinner mientras carga
  if (loading) {
    return (
      <section className="container my-5">
        <h1 className="text-center mb-4">Productos Destacados</h1>
        <div className="text-center">
          <Spinner animation="border" role="status" className="me-2" />
          <span>Cargando productos destacados...</span>
        </div>
      </section>
    );
  }

  // Mostrar error si hay
  if (error) {
    return (
      <section className="container my-5">
        <h1 className="text-center mb-4">Productos Destacados</h1>
        <Alert variant="warning" className="text-center">
          <h5>No se pudieron cargar los productos destacados</h5>
          <p>{error}</p>
        </Alert>
      </section>
    );
  }

  // Mostrar mensaje si no hay productos destacados
  if (featuredProducts.length === 0) {
    return (
      <section className="container my-5">
        <h1 className="text-center mb-4">Productos Destacados</h1>
        <Alert variant="info" className="text-center">
          <h5>Próximamente tendremos productos destacados</h5>
          <p>Estamos preparando nuevas delicias para ti.</p>
        </Alert>
      </section>
    );
  }

  return (
    <section className="container my-5">
      <h1 className="text-center mb-4">Productos Destacados</h1>
      <Row className="g-4 justify-content-start">
        {featuredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Row>
    </section>
  );
};

export default FeaturedProducts;