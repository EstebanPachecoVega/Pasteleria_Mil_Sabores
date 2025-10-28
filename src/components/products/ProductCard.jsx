import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters';

const ProductCard = ({ product, onAddToCart }) => {
  const isOutOfStock = product.stock === 0;
  
  const handleAddToCart = (e) => {
    // ✅ SOLO AGREGAMOS ESTA VALIDACIÓN
    if (isOutOfStock) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

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
        <div 
          className="card h-100 shadow-sm product-card d-flex flex-column"
          style={{ 
            opacity: isOutOfStock ? 0.6 : 1,
            position: 'relative'
          }}
        >
          {/* ✅ SOLO AGREGAMOS ESTE BADGE */}
          {isOutOfStock && (
            <div 
              className="position-absolute top-0 start-0 m-2 bg-danger text-white px-2 py-1 rounded"
              style={{ 
                zIndex: 1,
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}
            >
              NO DISPONIBLE
            </div>
          )}

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
                objectPosition: 'center',
                // ✅ SOLO AGREGAMOS ESTE FILTRO
                filter: isOutOfStock ? 'grayscale(70%)' : 'none'
              }}
            />
          </div>

          <div className="card-body d-flex flex-column flex-grow-1">
            <h5 className="product-title flex-grow-0">{product.name}</h5>
            <div className="mt-auto">
              <p className="product-price mb-2">${formatPrice(product.price)}</p>
              <div className="d-flex gap-2">
                <button
                  className={`btn flex-grow-1 add-to-cart ${isOutOfStock ? 'btn-secondary' : 'add-cart-btn'}`}
                  onClick={handleAddToCart}
                  // ✅ SOLO AGREGAMOS ESTE DISABLED
                  disabled={isOutOfStock}
                >
                  {/* ✅ SOLO CAMBIAMOS EL TEXTO */}
                  {isOutOfStock ? 'SIN STOCK' : 'Agregar al Carrito'}
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