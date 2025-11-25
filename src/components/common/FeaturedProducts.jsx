import React, { useState, useEffect } from 'react';
import { Container, Row, Spinner, Alert } from 'react-bootstrap';
import ProductCard from '../products/ProductCard';
import { obtenerProductosDestacados } from '../../data/products';

const FeaturedProducts = () => {
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarProductosDestacados = async () => {
      try {
        setCargando(true);
        console.log('🔄 FeaturedProducts - Cargando productos destacados...');
        
        const productos = await obtenerProductosDestacados();
        console.log('✅ FeaturedProducts - Productos destacados cargados:', productos);
        
        // Validar productos antes de guardarlos
        const productosValidos = productos.filter(producto => 
          producto && producto.id && (producto.nombre || producto.name)
        );
        
        if (productosValidos.length !== productos.length) {
          console.warn('⚠️ Algunos productos no tienen datos completos');
        }
        
        setProductosDestacados(productosValidos);
      } catch (err) {
        console.error('❌ FeaturedProducts - Error cargando productos destacados:', err);
        setError('Error al cargar los productos destacados');
      } finally {
        setCargando(false);
      }
    };

    cargarProductosDestacados();
  }, []);

  // Filtrar productos válidos para renderizar
  const productosParaRender = productosDestacados.filter(producto => 
    producto && producto.id && (producto.nombre || producto.name)
  );

  if (cargando) {
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

  if (productosParaRender.length === 0) {
    return (
      <section className="container my-5">
        <h1 className="text-center mb-4">Productos Destacados</h1>
        <Alert variant="info" className="text-center">
          <h5>No hay productos destacados disponibles</h5>
          <p>Próximamente tendremos nuevas delicias para ti.</p>
        </Alert>
      </section>
    );
  }

  return (
    <section className="container my-5">
      <h1 className="text-center mb-4">Productos Destacados</h1>
      <Row className="g-4 justify-content-start">
        {productosParaRender.map(producto => (
          <ProductCard 
            key={producto.id} 
            product={producto} // ✅ Pasar como 'product' (no 'producto')
          />
        ))}
      </Row>
    </section>
  );
};

export default FeaturedProducts;