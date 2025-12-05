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
    orderBy
} from 'firebase/firestore';

export const obtenerTodasCategorias = async () => {
    try {
        const consulta = query(
            collection(db, "categoria"),
            where("activa", "==", true),
            orderBy("orden")
        );

        const snapshot = await getDocs(consulta);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error obteniendo categorías:", error);
        throw error;
    }
};

export const obtenerCategoriaPorId = async (idCategoria) => {
    try {
        const categoriaRef = doc(db, "categoria", idCategoria);
        const categoriaSnap = await getDoc(categoriaRef);

        if (categoriaSnap.exists()) {
            return { id: categoriaSnap.id, ...categoriaSnap.data() };
        }

        return null;
    } catch (error) {
        console.error("Error obteniendo categoría:", error);
        throw error;
    }
};

export const obtenerCategoriaPorSlug = async (slug) => {
    try {
        const consulta = query(
            collection(db, "categoria"),
            where("slug", "==", slug),
            where("activa", "==", true)
        );

        const snapshot = await getDocs(consulta);
        if (!snapshot.empty) {
            const documento = snapshot.docs[0];
            return { id: documento.id, ...documento.data() };
        }

        return null;
    } catch (error) {
        console.error("Error obteniendo categoría por slug:", error);
        throw error;
    }
};