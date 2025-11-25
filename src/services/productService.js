// src/services/productService.js
import { db } from '../config/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where,
  doc,
  getDoc,
  updateDoc,
  runTransaction
} from 'firebase/firestore';

// Obtener todos los productos desde Firebase
export const obtenerTodosProductos = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "producto"));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error obteniendo productos de Firebase:", error);
    throw error;
  }
};

// Obtener productos por categoría desde Firebase
export const obtenerProductosPorCategoria = async (claveCategoria) => {
  try {
    const q = query(
      collection(db, "producto"), 
      where("categoria", "==", claveCategoria)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error obteniendo productos por categoría de Firebase:", error);
    throw error;
  }
};

// Obtener un producto por ID desde Firebase
export const obtenerProductoPorId = async (idProducto) => {
  try {
    console.log('📡 productService - obtenerProductoPorId - ID:', idProducto);
    const docRef = doc(db, "producto", idProducto);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const producto = { id: docSnap.id, ...docSnap.data() };
      console.log('✅ productService - obtenerProductoPorId - producto encontrado:', producto);
      return producto;
    }
    console.log('❌ productService - obtenerProductoPorId - producto no encontrado');
    return null;
  } catch (error) {
    console.error("❌ productService - Error obteniendo producto:", error);
    throw error;
  }
};

// Obtener productos destacados desde Firebase
export const obtenerProductosDestacados = async () => {
  try {
    const q = query(
      collection(db, "producto"), 
      where("destacado", "==", true),
      where("activo", "==", true)
    );
    
    const querySnapshot = await getDocs(q);
    const productosDestacados = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('✅ productService - Productos destacados encontrados:', productosDestacados.length);
    return productosDestacados;
  } catch (error) {
    console.error("❌ Error obteniendo productos destacados:", error);
    throw error;
  }
};

// Actualizar stock de un producto
export const actualizarStockProducto = async (idProducto, nuevoStock) => {
  try {
    const referenciaProducto = doc(db, "producto", idProducto);
    await updateDoc(referenciaProducto, {
      stock: nuevoStock,
      actualizadoEl: new Date()
    });
    return true;
  } catch (error) {
    console.error("Error actualizando stock:", error);
    throw error;
  }
};

// Descontar stock de manera segura (evita condiciones de carrera)
export const descontarStockProducto = async (idProducto, cantidadADescontar) => {
  try {
    const referenciaProducto = doc(db, "producto", idProducto);
    
    await runTransaction(db, async (transaccion) => {
      const documentoProducto = await transaccion.get(referenciaProducto);
      if (!documentoProducto.exists()) {
        throw new Error("Producto no existe");
      }
      
      const stockActual = documentoProducto.data().stock;
      if (stockActual < cantidadADescontar) {
        throw new Error(`Stock insuficiente. Solo quedan ${stockActual} unidades`);
      }
      
      transaccion.update(referenciaProducto, {
        stock: stockActual - cantidadADescontar,
        actualizadoEl: new Date()
      });
    });
    
    return true;
  } catch (error) {
    console.error("Error descontando stock:", error);
    throw error;
  }
};

// 🔄 MANTENER COMPATIBILIDAD CON CÓDIGO EXISTENTE (alias en inglés)
export const getAllProducts = obtenerTodosProductos;
export const getProductsByCategory = obtenerProductosPorCategoria;
export const getProductById = obtenerProductoPorId;
export const getFeaturedProducts = obtenerProductosDestacados;
export const updateProductStock = actualizarStockProducto;
export const decreaseProductStock = descontarStockProducto;