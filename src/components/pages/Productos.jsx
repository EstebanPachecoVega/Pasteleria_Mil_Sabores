// src/components/pages/Productos.jsx
import React from 'react';
import { Container, Row } from 'react-bootstrap';
import ProductCard from '../products/ProductCard';
import { products } from '../../data/products';

const Productos = () => {
    // Obtener todos los productos de todas las categorías
    const allProducts = Object.values(products).flat();

    return (
        <Container className="my-5">
            <div className="text-center mb-4">
                <h1>Nuestros Productos</h1>
                <p>Descubre toda nuestra deliciosa variedad de pastelería artesanal</p>
                <small>
                    Mostrando {allProducts.length} productos disponibles
                </small>
            </div>

            <Row className="g-4">
                {allProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </Row>
        </Container>
    );
};

export default Productos;