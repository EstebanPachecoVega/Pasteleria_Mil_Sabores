// productService.js - VERSIÓN CORREGIDA
import { db } from '../config/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  orderBy
} from 'firebase/firestore';
import { obtenerCategoriaPorId, obtenerCategoriaPorSlug } from './categoryService';

// Obtener todos los productos CON CATEGORÍA COMPLETA
export const obtenerTodosProductos = async () => {
  try {
    const q = query(
      collection(db, "producto"),
      where("activo", "==", true),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const productos = [];

    // Usar Promise.all para obtener categorías en paralelo
    const productosPromises = querySnapshot.docs.map(async (docSnap) => {
      const producto = {
        id: docSnap.id,
        ...docSnap.data()
      };

      // Obtener información de la categoría
      if (producto.categoriaId) {
        try {
          const categoria = await obtenerCategoriaPorId(producto.categoriaId);
          producto.categoriaInfo = categoria;
          producto.categoriaNombre = categoria?.nombre || '';
          producto.categoriaSlug = categoria?.slug || '';
        } catch (error) {
          console.warn(`No se pudo obtener categoría para producto ${producto.id}:`, error);
        }
      }

      return producto;
    });

    return await Promise.all(productosPromises);
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    throw error;
  }
};

// Obtener productos por categoría (slug) - VERSIÓN CORREGIDA
export const obtenerProductosPorCategoria = async (slugCategoria) => {
  try {
    console.log('🔍 Buscando categoría con slug:', slugCategoria);

    // Obtener categoría por slug
    const categoria = await obtenerCategoriaPorSlug(slugCategoria);
    console.log('📋 Categoría encontrada:', categoria);

    if (!categoria) {
      console.warn(`❌ No se encontró categoría con slug: ${slugCategoria}`);
      return [];
    }

    // Buscar productos con ese categoriaId
    const q = query(
      collection(db, "producto"),
      where("categoriaId", "==", categoria.id),
      where("activo", "==", true),
      orderBy("nombre")
    );

    const querySnapshot = await getDocs(q);
    console.log(`📦 Productos encontrados para categoría ${categoria.nombre}:`, querySnapshot.size);

    const productos = querySnapshot.docs.map(doc => {
      const producto = {
        id: doc.id,
        ...doc.data(),
        categoriaInfo: categoria,
        categoriaNombre: categoria.nombre,
        categoriaSlug: categoria.slug
      };
      console.log('✅ Producto procesado:', producto.nombre);
      return producto;
    });

    return productos;
  } catch (error) {
    console.error("❌ Error obteniendo productos por categoría:", error);
    throw error;
  }
};

// Obtener productos destacados CON CATEGORÍA
export const obtenerProductosDestacados = async () => {
  try {
    const q = query(
      collection(db, "producto"),
      where("destacado", "==", true),
      where("activo", "==", true),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const productosPromises = querySnapshot.docs.map(async (docSnap) => {
      const producto = {
        id: docSnap.id,
        ...docSnap.data()
      };

      // Obtener información de la categoría
      if (producto.categoriaId) {
        try {
          const categoria = await obtenerCategoriaPorId(producto.categoriaId);
          producto.categoriaInfo = categoria;
          producto.categoriaNombre = categoria?.nombre || '';
          producto.categoriaSlug = categoria?.slug || '';
        } catch (error) {
          console.warn(`No se pudo obtener categoría para producto destacado ${producto.id}:`, error);
        }
      }

      return producto;
    });

    return await Promise.all(productosPromises);
  } catch (error) {
    console.error("Error obteniendo productos destacados:", error);
    throw error;
  }
};

// Obtener producto por ID CON CATEGORÍA
export const obtenerProductoPorId = async (idProducto) => {
  try {
    const docRef = doc(db, "producto", idProducto);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const producto = { id: docSnap.id, ...docSnap.data() };

      // Obtener información de la categoría
      if (producto.categoriaId) {
        try {
          const categoria = await obtenerCategoriaPorId(producto.categoriaId);
          producto.categoriaInfo = categoria;
          producto.categoriaNombre = categoria?.nombre || '';
          producto.categoriaSlug = categoria?.slug || '';
        } catch (error) {
          console.warn(`No se pudo obtener categoría para producto ${producto.id}:`, error);
        }
      }

      return producto;
    }

    return null;
  } catch (error) {
    console.error("Error obteniendo producto:", error);
    throw error;
  }
};

// Crear nuevo producto
export const crearProducto = async (datosProducto) => {
  try {
    const docRef = await addDoc(collection(db, "producto"), {
      ...datosProducto,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creando producto:", error);
    throw error;
  }
};

// Actualizar producto existente
export const actualizarProducto = async (idProducto, datosActualizados) => {
  try {
    const docRef = doc(db, "producto", idProducto);
    await updateDoc(docRef, {
      ...datosActualizados,
      updatedAt: new Date()
    });

    return true;
  } catch (error) {
    console.error("Error actualizando producto:", error);
    throw error;
  }
};

// Eliminar producto (marcar como inactivo)
export const eliminarProducto = async (idProducto) => {
  try {
    const docRef = doc(db, "producto", idProducto);
    await updateDoc(docRef, {
      activo: false,
      updatedAt: new Date()
    });

    return true;
  } catch (error) {
    console.error("Error eliminando producto:", error);
    throw error;
  }
};

// Actualizar stock de producto
export const actualizarStockProducto = async (idProducto, nuevoStock) => {
  try {
    const docRef = doc(db, "producto", idProducto);
    await updateDoc(docRef, {
      stock: nuevoStock,
      updatedAt: new Date()
    });

    return true;
  } catch (error) {
    console.error("Error actualizando stock:", error);
    throw error;
  }
};

// Descontar stock de producto
export const descontarStockProducto = async (idProducto, cantidad) => {
  try {
    const docRef = doc(db, "producto", idProducto);

    await runTransaction(db, async (transaccion) => {
      const documento = await transaccion.get(docRef);
      if (!documento.exists()) {
        throw new Error("Producto no existe");
      }

      const producto = documento.data();
      if (producto.stock < cantidad) {
        throw new Error(`Stock insuficiente. Disponible: ${producto.stock}`);
      }

      transaccion.update(docRef, {
        stock: producto.stock - cantidad,
        updatedAt: new Date()
      });
    });

    return true;
  } catch (error) {
    console.error("Error descontando stock:", error);
    throw error;
  }
};