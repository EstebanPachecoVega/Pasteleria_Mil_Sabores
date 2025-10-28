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
export const getAllProducts = async () => {
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
export const getProductsByCategory = async (categoryKey) => {
  try {
    const q = query(
      collection(db, "producto"), 
      where("category", "==", categoryKey)
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
export const getProductById = async (productId) => {
  try {
    const docRef = doc(db, "producto", productId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error obteniendo producto:", error);
    throw error;
  }
};

// Actualizar stock de un producto
export const updateProductStock = async (productId, newStock) => {
  try {
    const productRef = doc(db, "producto", productId);
    await updateDoc(productRef, {
      stock: newStock,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error("Error actualizando stock:", error);
    throw error;
  }
};

// Descontar stock de manera segura (evita condiciones de carrera)
export const decreaseProductStock = async (productId, quantityToDecrease) => {
  try {
    const productRef = doc(db, "producto", productId);
    
    await runTransaction(db, async (transaction) => {
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists()) {
        throw new Error("Producto no existe");
      }
      
      const currentStock = productDoc.data().stock;
      if (currentStock < quantityToDecrease) {
        throw new Error(`Stock insuficiente. Solo quedan ${currentStock} unidades`);
      }
      
      transaction.update(productRef, {
        stock: currentStock - quantityToDecrease,
        updatedAt: new Date()
      });
    });
    
    return true;
  } catch (error) {
    console.error("Error descontando stock:", error);
    throw error;
  }
};