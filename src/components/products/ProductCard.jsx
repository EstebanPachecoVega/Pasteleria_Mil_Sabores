import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters';

const ProductCard = ({ product, onAddToCart }) => {
  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));

    if (onAddToCart) onAddToCart(product);
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4 d-flex">
      <Link
        to={`/producto/${product.id}`}
        className="text-decoration-none product-card-link w-100"
        style={{ color: 'inherit' }}
      >
        <div className="card h-100 shadow-sm product-card d-flex flex-column">
          {/* Contenedor de imagen con tamaño fijo */}
          <div className="product-image-container" style={{ height: '200px', overflow: 'hidden' }}>
            <img
              src={product.image}
              className="card-img-top product-image"
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center'
              }}
            />
          </div>

          <div className="card-body d-flex flex-column flex-grow-1">
            <h5 className="product-title flex-grow-0">{product.name}</h5>
            <div className="mt-auto">
              <p className="product-price mb-2">${formatPrice(product.price)}</p>
              <div className="d-flex gap-2">
                <button
                  className="btn add-cart-btn flex-grow-1 add-to-cart"
                  onClick={handleAddToCart}
                >
                  Agregar al Carrito
                </button>
                <button
                  className="btn view-details-btn"
                  onClick={handleViewDetails}
                >
                  <i className="bi bi-eye"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;