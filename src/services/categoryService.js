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
  orderBy
} from 'firebase/firestore';

// Obtener todas las categorías
export const obtenerTodasCategorias = async () => {
  try {
    const q = query(
      collection(db, "categoria"),
      where("activa", "==", true),
      orderBy("orden")
    );

    const querySnapshot = await getDocs(q);

    const categorias = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return categorias;
  } catch (error) {
    console.error("Error obteniendo categorías:", error);
    throw error;
  }
};

// Obtener categoría por ID
export const obtenerCategoriaPorId = async (idCategoria) => {
  try {
    const docRef = doc(db, "categoria", idCategoria);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }

    return null;
  } catch (error) {
    console.error("Error obteniendo categoría:", error);
    throw error;
  }
};

// Obtener categoría por slug
export const obtenerCategoriaPorSlug = async (slug) => {
  try {
    const q = query(
      collection(db, "categoria"),
      where("slug", "==", slug),
      where("activa", "==", true)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }

    return null;
  } catch (error) {
    console.error("Error obteniendo categoría por slug:", error);
    throw error;
  }
};

// Crear nueva categoría
export const crearCategoria = async (datosCategoria) => {
  try {
    const docRef = await addDoc(collection(db, "categoria"), {
      ...datosCategoria,
      activa: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creando categoría:", error);
    throw error;
  }
};

// Actualizar categoría existente
export const actualizarCategoria = async (idCategoria, datosActualizados) => {
  try {
    const docRef = doc(db, "categoria", idCategoria);
    await updateDoc(docRef, {
      ...datosActualizados,
      updatedAt: new Date()
    });

    return true;
  } catch (error) {
    console.error("Error actualizando categoría:", error);
    throw error;
  }
};

// Eliminar categoría (marcar como inactiva)
export const eliminarCategoria = async (idCategoria) => {
  try {
    const docRef = doc(db, "categoria", idCategoria);
    await updateDoc(docRef, {
      activa: false,
      updatedAt: new Date()
    });

    return true;
  } catch (error) {
    console.error("Error eliminando categoría:", error);
    throw error;
  }
};