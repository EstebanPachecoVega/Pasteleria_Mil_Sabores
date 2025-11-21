import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters';

const ProductCard = ({ product, onAddToCart }) => {
  const nombreProducto = product.nombre || product.name || 'Sin nombre';
  const precioProducto = product.precio || product.price || 0;
  const stockProducto = product.stock || product.stock || 0;
  const imagenProducto = product.image || product.imagen || '/images/placeholder.jpg';
  const categoriaProducto = product.categoria || product.category || 'Sin categoría';
  const activoProducto = product.activo !== false && product.active !== false;
  const destacadoProducto = product.destacado || product.featured || false;
  
  const sinStock = stockProducto === 0 || !activoProducto;
  
  const manejarAgregarCarrito = (e) => {
    if (sinStock) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    e.stopPropagation();
    e.preventDefault();

    const carrito = JSON.parse(localStorage.getItem('cart')) || [];
    const itemExistente = carrito.find(item => item.id === product.id);

    if (itemExistente) {
      itemExistente.cantidad += 1;
    } else {
      carrito.push({ 
        ...product, 
        cantidad: 1,
        nombre: nombreProducto,
        precio: precioProducto,
        stock: stockProducto,
        destacado: destacadoProducto
      });
    }

    localStorage.setItem('cart', JSON.stringify(carrito));
    window.dispatchEvent(new Event('cartUpdated'));

    if (onAddToCart) onAddToCart(product);
  };

  const manejarVerDetalles = (e) => {
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
            opacity: sinStock ? 0.6 : 1,
            position: 'relative'
          }}
        >
          {/* BADGE DE NO DISPONIBLE */}
          {sinStock && (
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

          {/* BADGE DE DESTACADO */}
          {destacadoProducto && !sinStock && (
            <div 
              className="position-absolute top-0 end-0 m-2 bg-warning text-dark px-2 py-1 rounded"
              style={{ 
                zIndex: 1,
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}
            >
              ⭐ DESTACADO
            </div>
          )}

          {/* Contenedor de imagen con tamaño fijo */}
          <div className="product-image-container" style={{ height: '200px', overflow: 'hidden' }}>
            <img
              src={imagenProducto}
              className="card-img-top product-image"
              alt={nombreProducto}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                filter: sinStock ? 'grayscale(70%)' : 'none'
              }}
              onError={(e) => {
                e.target.src = '/images/placeholder.jpg';
              }}
            />
          </div>

          <div className="card-body d-flex flex-column flex-grow-1">
            <h5 className="product-title flex-grow-0">{nombreProducto}</h5>
            <div className="mt-auto">
              <p className="product-price mb-2">${formatPrice(precioProducto)}</p>
              <div className="d-flex gap-2">
                <button
                  className={`btn flex-grow-1 add-to-cart ${sinStock ? 'btn-secondary' : 'add-cart-btn'}`}
                  onClick={manejarAgregarCarrito}
                  disabled={sinStock}
                >
                  {sinStock ? 'SIN STOCK' : 'Agregar al Carrito'}
                </button>
                <button
                  className="btn view-details-btn"
                  onClick={manejarVerDetalles}
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