// context/CartContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { obtenerProductoPorId } from '../services/productService';

const CartContext = createContext();

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext debe usarse dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [productStocks, setProductStocks] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Cargar carrito desde localStorage
  useEffect(() => {
    const loadCart = async () => {
      try {
        console.log('🔄 CartContext: Cargando carrito desde localStorage...');
        const cartData = localStorage.getItem('cart');
        console.log('🔄 CartContext: Datos crudos:', cartData);
        
        const items = cartData ? JSON.parse(cartData) : [];
        console.log('🔄 CartContext: Items parseados:', items);
        
        setCartItems(items);
        await loadProductStocks(items);
      } catch (error) {
        console.error('❌ CartContext: Error cargando carrito:', error);
        setCartItems([]);
      } finally {
        console.log('🔄 CartContext: Carga completada, isLoading = false');
        setIsLoading(false);
      }
    };

    loadCart();
    
    // Sincronizar entre pestañas
    const handleStorageChange = (e) => {
      if (e.key === 'cart') {
        console.log('🔄 CartContext: localStorage actualizado desde otra pestaña');
        const cartData = localStorage.getItem('cart');
        const items = cartData ? JSON.parse(cartData) : [];
        setCartItems(items);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadProductStocks = async (items) => {
    if (items.length === 0) {
      console.log('🔄 CartContext: No hay items para cargar stocks');
      return;
    }
    
    console.log('🔄 CartContext: Cargando stocks para', items.length, 'productos');
    
    const stockPromises = items.map(async (item) => {
      try {
        const producto = await obtenerProductoPorId(item.id);
        return { id: item.id, stock: producto?.stock || 0 };
      } catch (error) {
        console.error(`❌ CartContext: Error cargando stock para ${item.id}:`, error);
        return { id: item.id, stock: 0 };
      }
    });

    try {
      const stocks = await Promise.all(stockPromises);
      const stockMap = {};
      stocks.forEach(s => {
        stockMap[s.id] = s.stock;
      });
      setProductStocks(stockMap);
      console.log('🔄 CartContext: Stocks cargados:', stockMap);
    } catch (error) {
      console.error('❌ CartContext: Error cargando stocks:', error);
    }
  };

  const saveCartToStorage = useCallback((items) => {
    try {
      console.log('💾 CartContext: Guardando carrito en localStorage:', items.length, 'items');
      localStorage.setItem('cart', JSON.stringify(items));
      setCartItems(items);
      loadProductStocks(items);
      return true;
    } catch (error) {
      console.error('❌ CartContext: Error guardando carrito:', error);
      return false;
    }
  }, []);

  const addToCart = useCallback(async (product, quantity = 1) => {
    console.log('🔄 CartContext: Agregando producto:', product?.id, 'cantidad:', quantity);
    
    if (!product || !product.id) {
      console.error('❌ CartContext: Producto inválido:', product);
      return false;
    }

    try {
      const productoActual = await obtenerProductoPorId(product.id);
      const stockDisponible = productoActual?.stock || 0;
      
      const currentItems = [...cartItems];
      const existingItemIndex = currentItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        const existingItem = currentItems[existingItemIndex];
        const nuevaCantidad = existingItem.quantity + quantity;
        
        if (stockDisponible > 0 && nuevaCantidad > stockDisponible) {
          alert(`Stock insuficiente. Solo quedan ${stockDisponible} unidades disponibles.`);
          return false;
        }
        
        if (nuevaCantidad > 100) {
          alert('No puedes agregar más de 100 unidades del mismo producto.');
          return false;
        }
        
        currentItems[existingItemIndex] = {
          ...existingItem,
          quantity: nuevaCantidad,
          cantidad: nuevaCantidad
        };
      } else {
        if (stockDisponible === 0) {
          alert('Producto sin stock disponible.');
          return false;
        }
        
        if (quantity > 100) {
          alert('No puedes agregar más de 100 unidades del mismo producto.');
          return false;
        }
        
        if (quantity > stockDisponible) {
          alert(`Stock insuficiente. Solo quedan ${stockDisponible} unidades disponibles.`);
          return false;
        }
        
        currentItems.push({
          ...product,
          id: product.id,
          quantity: quantity,
          cantidad: quantity,
          precio: product.precio || product.price || 0,
          nombre: product.nombre || product.name || 'Producto sin nombre',
          image: product.image || product.imagen || '/images/placeholder.jpg'
        });
      }
      
      return saveCartToStorage(currentItems);
    } catch (error) {
      console.error('❌ CartContext: Error al agregar al carrito:', error);
      alert('Error al agregar el producto al carrito.');
      return false;
    }
  }, [cartItems, saveCartToStorage]);

  const updateCartQuantity = useCallback(async (productId, newQuantity) => {
    console.log('🔄 CartContext: Actualizando cantidad para', productId, 'a', newQuantity);
    
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    try {
      const producto = await obtenerProductoPorId(productId);
      const maxStock = producto?.stock || 0;
      
      if (maxStock > 0 && newQuantity > maxStock) {
        alert(`Stock insuficiente. Solo quedan ${maxStock} unidades disponibles.`);
        return;
      }
      
      if (newQuantity > 100) {
        alert('No puedes agregar más de 100 unidades del mismo producto.');
        return;
      }

      const currentItems = [...cartItems];
      const itemIndex = currentItems.findIndex(item => item.id === productId);
      if (itemIndex >= 0) {
        currentItems[itemIndex] = {
          ...currentItems[itemIndex],
          quantity: newQuantity,
          cantidad: newQuantity
        };
        
        saveCartToStorage(currentItems);
      }
    } catch (error) {
      console.error('❌ CartContext: Error actualizando cantidad:', error);
      alert('Error al actualizar la cantidad.');
    }
  }, [cartItems, saveCartToStorage]);

  const removeFromCart = useCallback((productId) => {
    console.log('🔄 CartContext: Eliminando producto:', productId);
    
    const currentItems = [...cartItems];
    const updatedItems = currentItems.filter(item => item.id !== productId);
    saveCartToStorage(updatedItems);
  }, [cartItems, saveCartToStorage]);

  const clearCart = useCallback(() => {
    console.log('🔄 CartContext: Limpiando carrito');
    saveCartToStorage([]);
  }, [saveCartToStorage]);

  const cartCount = cartItems.reduce((total, item) => total + (item.quantity || item.cantidad || 1), 0);
  
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.precio || item.price || 0;
    const quantity = item.quantity || item.cantidad || 1;
    return sum + (price * quantity);
  }, 0);

  const getProductStock = useCallback((productId) => {
    return productStocks[productId] || 0;
  }, [productStocks]);

  const value = {
    cartItems,
    cartCount,
    subtotal,
    productStocks,
    isLoading,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getProductStock
  };

  console.log('🔄 CartContext: Proporcionando valor:', { 
    cartItems: cartItems.length,
    cartCount,
    isLoading 
  });

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};