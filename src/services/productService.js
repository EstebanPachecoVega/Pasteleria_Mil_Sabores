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
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { obtenerCategoriaPorId, obtenerCategoriaPorSlug } from './categoryService';

export const obtenerTodosProductos = async () => {
    try {
        const consulta = query(
            collection(db, "producto"),
            where("activo", "==", true),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(consulta);
        
        const productosPromesas = snapshot.docs.map(async (documento) => {
            const productoData = documento.data();
            const producto = {
                id: documento.id,
                nombre: productoData.nombre || '',
                descripcion: productoData.descripcion || '',
                precio: productoData.precio || 0,
                stock: productoData.stock || 0,
                categoriaId: productoData.categoriaId || '',
                image: productoData.image || '',
                images: productoData.images || [],
                destacado: productoData.destacado || false,
                activo: productoData.activo !== false,
                slug: productoData.slug || '',
                createdAt: productoData.createdAt,
                updatedAt: productoData.updatedAt
            };

            if (producto.categoriaId) {
                try {
                    const categoria = await obtenerCategoriaPorId(producto.categoriaId);
                    if (categoria) {
                        producto.categoriaInfo = categoria;
                        producto.categoriaNombre = categoria.nombre;
                        producto.categoriaSlug = categoria.slug;
                    }
                } catch (error) {
                    console.warn(`No se pudo obtener categoría para producto ${producto.id}:`, error);
                }
            }

            return producto;
        });

        return await Promise.all(productosPromesas);
    } catch (error) {
        console.error("Error obteniendo productos:", error);
        throw error;
    }
};

export const obtenerProductosPorCategoria = async (slugCategoria) => {
    try {
        const categoria = await obtenerCategoriaPorSlug(slugCategoria);

        if (!categoria) {
            return [];
        }

        const consulta = query(
            collection(db, "producto"),
            where("categoriaId", "==", categoria.id),
            where("activo", "==", true),
            orderBy("nombre")
        );

        const snapshot = await getDocs(consulta);

        return snapshot.docs.map(documento => {
            const productoData = documento.data();
            return {
                id: documento.id,
                nombre: productoData.nombre || '',
                descripcion: productoData.descripcion || '',
                precio: productoData.precio || 0,
                stock: productoData.stock || 0,
                categoriaId: productoData.categoriaId || '',
                image: productoData.image || '',
                images: productoData.images || [],
                destacado: productoData.destacado || false,
                activo: productoData.activo !== false,
                slug: productoData.slug || '',
                createdAt: productoData.createdAt,
                updatedAt: productoData.updatedAt,
                categoriaInfo: categoria,
                categoriaNombre: categoria.nombre,
                categoriaSlug: categoria.slug
            };
        });
    } catch (error) {
        console.error("Error obteniendo productos por categoría:", error);
        throw error;
    }
};

export const obtenerProductosDestacados = async () => {
    try {
        const consulta = query(
            collection(db, "producto"),
            where("destacado", "==", true),
            where("activo", "==", true),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(consulta);
        const productosPromesas = snapshot.docs.map(async (documento) => {
            const productoData = documento.data();
            const producto = {
                id: documento.id,
                nombre: productoData.nombre || '',
                descripcion: productoData.descripcion || '',
                precio: productoData.precio || 0,
                stock: productoData.stock || 0,
                categoriaId: productoData.categoriaId || '',
                image: productoData.image || '',
                images: productoData.images || [],
                destacado: productoData.destacado || false,
                activo: productoData.activo !== false,
                slug: productoData.slug || '',
                createdAt: productoData.createdAt,
                updatedAt: productoData.updatedAt
            };

            if (producto.categoriaId) {
                try {
                    const categoria = await obtenerCategoriaPorId(producto.categoriaId);
                    if (categoria) {
                        producto.categoriaInfo = categoria;
                        producto.categoriaNombre = categoria.nombre;
                        producto.categoriaSlug = categoria.slug;
                    }
                } catch (error) {
                    console.warn(`No se pudo obtener categoría para producto ${producto.id}:`, error);
                }
            }

            return producto;
        });

        return await Promise.all(productosPromesas);
    } catch (error) {
        console.error("Error obteniendo productos destacados:", error);
        throw error;
    }
};

export const obtenerProductoPorId = async (idProducto) => {
    try {
        const productoRef = doc(db, "producto", idProducto);
        const productoSnap = await getDoc(productoRef);

        if (productoSnap.exists()) {
            const productoData = productoSnap.data();
            const producto = {
                id: productoSnap.id,
                nombre: productoData.nombre || '',
                descripcion: productoData.descripcion || '',
                precio: productoData.precio || 0,
                stock: productoData.stock || 0,
                categoriaId: productoData.categoriaId || '',
                image: productoData.image || '',
                images: productoData.images || [],
                destacado: productoData.destacado || false,
                activo: productoData.activo !== false,
                slug: productoData.slug || '',
                createdAt: productoData.createdAt,
                updatedAt: productoData.updatedAt
            };

            if (producto.categoriaId) {
                try {
                    const categoria = await obtenerCategoriaPorId(producto.categoriaId);
                    if (categoria) {
                        producto.categoriaInfo = categoria;
                        producto.categoriaNombre = categoria.nombre;
                        producto.categoriaSlug = categoria.slug;
                    }
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

export const crearProducto = async (datosProducto) => {
    try {
        const productoNormalizado = {
            nombre: datosProducto.nombre?.trim(),
            descripcion: datosProducto.descripcion?.trim() || '',
            categoriaId: datosProducto.categoriaId,
            precio: Number(datosProducto.precio) || 0,
            stock: Number(datosProducto.stock) || 0,
            image: datosProducto.image || '/images/productos/default.png',
            images: datosProducto.images || [],
            destacado: datosProducto.destacado || false,
            novedad: datosProducto.novedad || false,
            activo: datosProducto.activo !== false,
            slug: datosProducto.slug || datosProducto.nombre?.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9\s]/g, '')
                .trim()
                .replace(/\s+/g, '-'),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, "producto"), productoNormalizado);
        return docRef.id;
    } catch (error) {
        console.error("Error creando producto:", error);
        throw error;
    }
};

export const actualizarProducto = async (idProducto, datosActualizados) => {
    try {
        const productoRef = doc(db, "producto", idProducto);
        const datosNormalizados = {
            ...datosActualizados,
            precio: Number(datosActualizados.precio) || 0,
            stock: Number(datosActualizados.stock) || 0,
            updatedAt: serverTimestamp()
        };

        await updateDoc(productoRef, datosNormalizados);
        return true;
    } catch (error) {
        console.error("Error actualizando producto:", error);
        throw error;
    }
};

export const eliminarProducto = async (idProducto) => {
    try {
        const productoRef = doc(db, "producto", idProducto);
        await updateDoc(productoRef, {
            activo: false,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error eliminando producto:", error);
        throw error;
    }
};

export const actualizarStockProducto = async (idProducto, nuevoStock) => {
    try {
        const productoRef = doc(db, "producto", idProducto);
        await updateDoc(productoRef, {
            stock: Number(nuevoStock) || 0,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error actualizando stock:", error);
        throw error;
    }
};

export const descontarStockProducto = async (idProducto, cantidad) => {
    try {
        const productoRef = doc(db, "producto", idProducto);

        await runTransaction(db, async (transaccion) => {
            const documento = await transaccion.get(productoRef);
            if (!documento.exists()) {
                throw new Error("Producto no existe");
            }

            const producto = documento.data();
            const stockActual = producto.stock || 0;
            const cantidadDescontar = Number(cantidad) || 0;

            if (stockActual < cantidadDescontar) {
                throw new Error(`Stock insuficiente. Disponible: ${stockActual}`);
            }

            transaccion.update(productoRef, {
                stock: stockActual - cantidadDescontar,
                updatedAt: serverTimestamp()
            });
        });

        return true;
    } catch (error) {
        console.error("Error descontando stock:", error);
        throw error;
    }
};