// src/components/pages/Productos.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Spinner, Alert } from 'react-bootstrap';
import ProductCard from '../products/ProductCard';
import { getAllProducts } from '../../data/products'; // ✅ Usar la función que consulta Firebase

const Productos = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                console.log('🔄 Productos - Cargando productos desde Firebase...');
                
                // ✅ Usar la misma función que consulta Firebase y filtra productos activos
                const allProducts = await getAllProducts();
                
                console.log('✅ Productos - Productos cargados:', allProducts.length);
                setProducts(allProducts);
            } catch (err) {
                console.error('❌ Productos - Error cargando productos:', err);
                setError('Error al cargar los productos');
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    // Mostrar spinner mientras carga
    if (loading) {
        return (
            <Container className="my-5 text-center">
                <Spinner animation="border" role="status" className="me-2" />
                <span>Cargando productos...</span>
            </Container>
        );
    }

    // Mostrar error si hay
    if (error) {
        return (
            <Container className="my-5">
                <Alert variant="danger" className="text-center">
                    <h5>Error al cargar los productos</h5>
                    <p>{error}</p>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <div className="text-center mb-4">
                <h1>Nuestros Productos</h1>
                <p>Descubre toda nuestra deliciosa variedad de pastelería artesanal</p>
                <small>
                    Mostrando {products.length} productos disponibles
                </small>
            </div>

            <Row className="g-4">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </Row>
        </Container>
    );
};

export default Productos;