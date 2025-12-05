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
        console.log('🔄 FeaturedProducts - Iniciando carga de productos destacados...');
        
        const productos = await obtenerProductosDestacados();
        console.log('✅ FeaturedProducts - Productos recibidos:', productos);
        console.log('✅ FeaturedProducts - Cantidad de productos:', productos.length);
        
        if (productos.length > 0) {
          console.log('✅ Primer producto recibido:', productos[0]);
          console.log('✅ Primer producto tiene categoría?', productos[0].categoriaNombre || productos[0].categoriaInfo?.nombre);
        }
        
        // Validar productos antes de guardarlos
        const productosValidos = productos.filter(producto => 
          producto && producto.id && (producto.nombre || producto.name)
        );
        
        if (productosValidos.length !== productos.length) {
          console.warn('⚠️ FeaturedProducts - Algunos productos no tienen datos completos');
        }
        
        console.log('✅ FeaturedProducts - Productos válidos:', productosValidos.length);
        setProductosDestacados(productosValidos);
      } catch (err) {
        console.error('❌ FeaturedProducts - Error cargando productos destacados:', err);
        setError('Error al cargar los productos destacados: ' + err.message);
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

  console.log('🎨 FeaturedProducts - Productos para renderizar:', productosParaRender.length);

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
          <p className="small">Revisa la consola del navegador para más detalles.</p>
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
          <p>Puede que no haya productos marcados como "destacado" en la base de datos.</p>
          <p className="small">Verifica que los productos tengan el campo "destacado: true"</p>
        </Alert>
      </section>
    );
  }

  return (
    <section className="container my-5">
      <h1 className="text-center mb-4">Productos Destacados</h1>
      <div className="text-center mb-4">
        <small className="text-muted">
          Mostrando {productosParaRender.length} producto(s) destacado(s)
        </small>
      </div>
      <Row className="g-4 justify-content-start">
        {productosParaRender.map(producto => {
          console.log('🎨 Renderizando producto:', producto.nombre);
          return (
            <ProductCard 
              key={producto.id} 
              product={producto}
            />
          );
        })}
      </Row>
    </section>
  );
};

export default FeaturedProducts;