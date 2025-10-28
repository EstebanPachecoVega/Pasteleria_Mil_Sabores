// src/services/firestoreService.js - VERSIÓN ACTUALIZADA
import { db } from "../config/firebase";
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    orderBy,
    serverTimestamp
} from "firebase/firestore";

// Funciones de usuario (existentes)
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

// Funciones para crear y obtener órdenes
export async function createOrder(orderData) {
    try {
        if (!orderData.orderId) {
            throw new Error('orderId es requerido para crear la orden');
        }

        const orderDocRef = doc(db, "order", orderData.orderId);

        await setDoc(orderDocRef, {
            ...orderData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: 'confirmado'
        });

        console.log("Orden creada con ID personalizado: ", orderData.orderId);
        return {
            id: orderData.orderId, // 🆕 DEVOLVER EL ID PERSONALIZADO
            ...orderData
        };
    } catch (error) {
        console.error("Error al crear orden: ", error);
        throw error;
    }
}

export async function getUserOrders(userId) {
    try {
        const ordersRef = collection(db, "order");
        const q = query(
            ordersRef,
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const orders = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            orders.push({
                id: data.orderId || doc.id,
                ...data,
                date: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                discounts: data.discountAmount || 0
            });
        });

        console.log(`Órdenes encontradas para usuario ${userId}:`, orders.length);
        return orders;
    } catch (error) {
        console.error("Error al obtener órdenes del usuario: ", error);
        throw error;
    }
}

export async function getOrderById(orderId) {
    try {
        const orderDocRef = doc(db, "order", orderId);
        const orderSnap = await getDoc(orderDocRef);

        if (orderSnap.exists()) {
            const data = orderSnap.data();
            return {
                id: orderSnap.id,
                ...data,
                date: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            };
        } else {
            console.log("No se encontró la orden con ID: ", orderId);
            return null;
        }
    } catch (error) {
        console.error("Error al obtener orden por ID: ", error);
        throw error;
    }
}

export async function getAllOrders() {
    try {
        const ordersRef = collection(db, "order");
        const q = query(ordersRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const orders = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            orders.push({
                id: data.orderId || doc.id,
                ...data,
                date: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            });
        });

        return orders;
    } catch (error) {
        console.error("Error al obtener todas las órdenes: ", error);
        throw error;
    }
}