import React from 'react';
import ProductCard from '../products/ProductCard';
import { products } from '../../data/products';

const FeaturedProducts = () => {
  const featuredProducts = Object.values(products).flat().slice(0, 8);

  return (
    <section className="container my-5">
      <h1 className="text-center mb-4">Productos Destacados</h1>
      <div className="row g-4 justify-content-start">
        {featuredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;