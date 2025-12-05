import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Container, Row, Alert, Button } from 'react-bootstrap';
import ProductCard from '../products/ProductCard';
import { buscarProductos } from '../../data/products';

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const loadSearchResults = async () => {
      const searchParams = new URLSearchParams(location.search);
      const query = searchParams.get('q');

      if (query) {
        setLoading(true);
        try {
          // Buscar productos de forma asíncrona
          const searchResults = await buscarProductos(query);
          setResults(searchResults);
        } catch (error) {
          console.error('Error en búsqueda:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setLoading(false);
      }
    };

    loadSearchResults();
  }, [location]);

  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q');

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Buscando...</span>
          </div>
          <p className="mt-3">Buscando "{query}"...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="text-center mb-5">
        <h1 style={{ fontFamily: 'Pacifico, cursive' }}>
          {query ? `Resultados para "${query}"` : 'Búsqueda'}
        </h1>

        {query && (
          <p className="lead">
            {results.length > 0
              ? `Encontramos ${results.length} producto(s)`
              : 'No encontramos productos que coincidan'
            }
          </p>
        )}
      </div>

      {results.length > 0 ? (
        <Row className="g-4 justify-content-start">
          {results.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Row>
      ) : query ? (
        <Alert variant="info" className="text-center">
          <h5>No se encontraron productos</h5>
          <p className="mb-3">Intenta con otros términos de búsqueda o explora nuestras categorías.</p>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <Link to="/productos" className="btn btn-primary">
              Ver Todos los Productos
            </Link>
            <Button variant="outline-secondary" onClick={() => window.history.back()}>
              Volver Atrás
            </Button>
          </div>
        </Alert>
      ) : (
        <Alert variant="warning" className="text-center">
          <h5>Ingresa un término de búsqueda</h5>
          <p>Utiliza el buscador en la barra de navegación para encontrar productos.</p>
        </Alert>
      )}
    </Container>
  );
};

export default SearchResults;