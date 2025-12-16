import { db } from "../config/firebase";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    getDoc,
    setDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from "firebase/firestore";

export class CrudService {

    static async obtenerOrdenes() {
        try {
            const ordenesRef = collection(db, "order");
            const consulta = query(ordenesRef, orderBy("createdAt", "desc"));
            const snapshot = await getDocs(consulta);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error obteniendo órdenes:", error);
            return [];
        }
    }

    static async obtenerOrdenPorId(id) {
        try {
            const ordenRef = doc(db, "order", id);
            const ordenSnap = await getDoc(ordenRef);
            if (ordenSnap.exists()) {
                return { id: ordenSnap.id, ...ordenSnap.data() };
            }
            return null;
        } catch (error) {
            console.error("Error obteniendo orden:", error);
            return null;
        }
    }

    static async actualizarEstadoOrden(id, nuevoEstado) {
        try {
            const ordenRef = doc(db, "order", id);
            await updateDoc(ordenRef, {
                estado: nuevoEstado,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("Error actualizando orden:", error);
            return false;
        }
    }

    static async obtenerProductos() {
        try {
            const productosRef = collection(db, "producto");
            const consulta = query(
                productosRef,
                where("activo", "==", true),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(consulta);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error obteniendo productos:", error);
            return [];
        }
    }

    static async obtenerProductoPorId(id) {
        try {
            const productoRef = doc(db, "producto", id);
            const productSnap = await getDoc(productoRef);
            if (productSnap.exists()) {
                const data = productSnap.data();
                return {
                    id: productSnap.id,
                    ...data
                };
            }
            return null;
        } catch (error) {
            console.error("Error obteniendo producto:", error);
            return null;
        }
    }

    static async crearProducto(producto) {
        try {
            const productoNormalizado = {
                nombre: producto.nombre?.trim(),
                descripcion: producto.descripcion?.trim() || '',
                categoriaId: producto.categoriaId,
                precio: Number(producto.precio) || 0,
                stock: Number(producto.stock) || 0,
                image: producto.image || '/images/productos/default.png',
                images: producto.images || [],
                destacado: producto.destacado || false,
                novedad: producto.novedad || false,
                activo: producto.activo !== false,
                slug: producto.slug || producto.nombre?.toLowerCase()
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
            return null;
        }
    }

    static async actualizarProducto(id, datos) {
        try {
            const productoRef = doc(db, "producto", id);
            const datosActualizados = {
                ...datos,
                precio: Number(datos.precio) || 0,
                stock: Number(datos.stock) || 0,
                updatedAt: serverTimestamp()
            };

            await updateDoc(productoRef, datosActualizados);
            return true;
        } catch (error) {
            console.error("Error actualizando producto:", error);
            return false;
        }
    }

    static async eliminarProducto(id) {
        try {
            const productoRef = doc(db, "producto", id);
            await updateDoc(productoRef, {
                activo: false,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("Error eliminando producto:", error);
            return false;
        }
    }

    static async obtenerCategorias() {
        try {
            const categoriasRef = collection(db, "categoria");
            const consulta = query(
                categoriasRef,
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
            return [];
        }
    }

    static async crearCategoria(categoria) {
        try {
            const nombre = categoria.nombre?.trim();
            if (!nombre) {
                throw new Error('El nombre de la categoría es requerido');
            }

            // Crear ID personalizado: cat_nombre (en minúsculas, con _)
            const categoriaId = 'cat_' + nombre
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9\s]/g, '')
                .trim()
                .replace(/\s+/g, '_');

            // Crear slug para URLs: nombre (en minúsculas, con -)
            const slug = nombre
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9\s]/g, '')
                .trim()
                .replace(/\s+/g, '-');

            const categoriaNormalizada = {
                nombre: nombre,
                descripcion: categoria.descripcion?.trim() || '',
                orden: Number(categoria.orden) || 0,
                slug: slug,
                activa: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            // Verificar si la categoría ya existe
            const categoriaRef = doc(db, "categoria", categoriaId);
            const categoriaSnap = await getDoc(categoriaRef);

            if (categoriaSnap.exists()) {
                // Si existe, actualizamos
                await updateDoc(categoriaRef, categoriaNormalizada);
                console.log(`✅ Categoría actualizada: ${categoriaId} (${nombre})`);
            } else {
                // Si no existe, creamos con ID personalizado
                await setDoc(categoriaRef, categoriaNormalizada);
                console.log(`✅ Categoría creada: ${categoriaId} (${nombre})`);
            }

            return categoriaId;
        } catch (error) {
            console.error("Error creando/actualizando categoría:", error);
            throw error;
        }
    }

    static async actualizarCategoria(id, datos) {
        try {
            const categoriaRef = doc(db, "categoria", id);
            await updateDoc(categoriaRef, {
                ...datos,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("Error actualizando categoría:", error);
            return false;
        }
    }

    static async eliminarCategoria(id) {
        try {
            const categoriaRef = doc(db, "categoria", id);
            await updateDoc(categoriaRef, {
                activa: false,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("Error eliminando categoría:", error);
            return false;
        }
    }

    static async eliminarCategoriaPermanente(id) {
        try {
            await deleteDoc(doc(db, "categoria", id));
            return true;
        } catch (error) {
            console.error("Error eliminando categoría permanentemente:", error);
            return false;
        }
    }

    static async obtenerUsuarios() {
        try {
            const usuariosRef = collection(db, "usuario");
            const snapshot = await getDocs(usuariosRef);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error obteniendo usuarios:", error);
            return [];
        }
    }

    static async crearUsuario(usuario) {
        try {
            const usuarioNormalizado = {
                name: usuario.name?.trim(),
                email: usuario.email?.trim().toLowerCase(),
                password: usuario.password || '123456', // Contraseña por defecto
                rol: usuario.rol || 'cliente',
                run: usuario.run || '',
                telefono: usuario.telefono || '',
                region: usuario.region || '',
                comuna: usuario.comuna || '',
                direccionCompleta: usuario.direccionCompleta || '',
                primerNombre: usuario.primerNombre || usuario.name?.split(' ')[0] || '',
                primerApellido: usuario.primerApellido || usuario.name?.split(' ').slice(-1)[0] || '',
                segundoNombre: usuario.segundoNombre || '',
                segundoApellido: usuario.segundoApellido || '',
                birthDate: usuario.birthDate || null,
                discountCode: usuario.discountCode || '',
                tipoVivienda: usuario.tipoVivienda || '',
                codigoPostal: usuario.codigoPostal || '',
                activo: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, "usuario"), usuarioNormalizado);
            return docRef.id;
        } catch (error) {
            console.error("Error creando usuario:", error);
            return null;
        }
    }

    static async actualizarUsuario(id, datos) {
        try {
            const usuarioRef = doc(db, "usuario", id);
            await updateDoc(usuarioRef, {
                ...datos,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("Error actualizando usuario:", error);
            return false;
        }
    }

    static async eliminarUsuario(id) {
        try {
            const usuarioRef = doc(db, "usuario", id);
            await updateDoc(usuarioRef, {
                activo: false,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("Error eliminando usuario:", error);
            return false;
        }
    }

    static async obtenerProductosPorCategoriaId(categoriaId) {
        try {
            const productosRef = collection(db, "producto");
            const consulta = query(
                productosRef,
                where("categoriaId", "==", categoriaId),
                where("activo", "==", true),
                orderBy("nombre")
            );
            const snapshot = await getDocs(consulta);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error obteniendo productos por categoría:", error);
            return [];
        }
    }
}