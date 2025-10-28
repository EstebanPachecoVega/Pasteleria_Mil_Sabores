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

// =============================================
// FUNCIONES DE USUARIO
// =============================================

// Registrar nuevo usuario
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

// Buscar usuario por email
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

// Buscar usuario por ID
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

// Actualizar datos del usuario
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

// ================================================================
// FUNCIONES DE DATOS MAESTROS (REGIONES/COMUNAS/TIPOS DE VIVIENDA)
// ================================================================

// Obtener todas las regiones
export async function getRegions() {
    try {
        const regionsRef = collection(db, "region");
        const q = query(regionsRef, orderBy("orden"));
        const querySnapshot = await getDocs(q);
        const regions = [];

        querySnapshot.forEach((doc) => {
            regions.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return regions;
    } catch (error) {
        console.error("Error al obtener regiones: ", error);
        throw error;
    }
}

// Obtener región por ID
export async function getRegionById(regionId) {
    try {
        const regionRef = doc(db, "region", regionId.toString());
        const regionSnap = await getDoc(regionRef);

        if (regionSnap.exists()) {
            return { id: regionSnap.id, ...regionSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error al obtener región por ID: ", error);
        throw error;
    }
}

// Obtener nombre de región por ID
export async function getRegionName(regionId) {
    try {
        const regionData = await getRegionById(regionId);
        return regionData ? regionData.name : '';
    } catch (error) {
        console.error("Error al obtener nombre de región: ", error);
        return '';
    }
}

// Obtener comunas por región
export async function getCommunesByRegion(regionId) {
    try {
        const communesRef = collection(db, "comuna");
        const q = query(
            communesRef,
            where("regionId", "==", parseInt(regionId)),
            orderBy("name")
        );
        const querySnapshot = await getDocs(q);
        const communes = [];

        querySnapshot.forEach((doc) => {
            communes.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return communes;
    } catch (error) {
        console.error("Error al obtener comunas: ", error);
        throw error;
    }
}

// Obtener comuna por ID
export async function getCommuneById(communeId) {
    try {
        const communeRef = doc(db, "comuna", communeId.toString());
        const communeSnap = await getDoc(communeRef);

        if (communeSnap.exists()) {
            return { id: communeSnap.id, ...communeSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error al obtener comuna por ID: ", error);
        throw error;
    }
}

// Obtener nombre de comuna por ID
export async function getCommuneName(communeId) {
    try {
        const communeData = await getCommuneById(communeId);
        return communeData ? communeData.name : '';
    } catch (error) {
        console.error("Error al obtener nombre de comuna: ", error);
        return '';
    }
}

// Obtener tipos de vivienda
export async function getHousingTypes() {
    try {
        const housingRef = collection(db, "tipo_vivienda");
        const q = query(housingRef, orderBy("name"));
        const querySnapshot = await getDocs(q);
        const housingTypes = [];

        querySnapshot.forEach((doc) => {
            housingTypes.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return housingTypes;
    } catch (error) {
        console.error("Error al obtener tipos de vivienda: ", error);
        throw error;
    }
}

// =============================================
// FUNCIONES DE ÓRDENES
// =============================================

// Crear orden con ID personalizado
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
            id: orderData.orderId,
            ...orderData
        };
    } catch (error) {
        console.error("Error al crear orden: ", error);
        throw error;
    }
}

// Obtener órdenes por usuario
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

// Obtener orden por ID
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

// Obtener todas las órdenes
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