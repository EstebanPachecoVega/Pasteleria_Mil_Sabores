// src/services/firestoreService.js
import { db } from "../config/firebase";
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc } from "firebase/firestore";

export async function addUser(user) {
    try {
        const docRef = await addDoc(collection(db, "usuario"), {
            ...user,
            createdAt: new Date(),
        });
        console.log("Usuario registrado con ID: ", docRef.id);
        return { id: docRef.id, ...user };
    } catch (error) {
        console.error("Error al registrar usuario: ", error);
        throw error;
    }
}

// Función para buscar usuario por email
export async function findUserByEmail(email) {
    try {
        const q = query(collection(db, "usuario"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        return null;
    } catch (error) {
        console.error("Error al buscar usuario por email: ", error);
        throw error;
    }
}

// Función para buscar usuario por ID
export async function findUserById(userId) {
    try {
        const docRef = doc(db, "usuario", userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error al buscar usuario por ID: ", error);
        throw error;
    }
}

// Función para actualizar usuario
export async function updateUser(userId, userData) {
    try {
        const docRef = doc(db, "usuario", userId);
        await updateDoc(docRef, {
            ...userData,
            updatedAt: new Date()
        });
        return { id: userId, ...userData };
    } catch (error) {
        console.error("Error al actualizar usuario: ", error);
        throw error;
    }
}