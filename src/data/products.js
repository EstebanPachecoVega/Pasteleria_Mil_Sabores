import {
    obtenerTodosProductos as obtenerTodosProductosDeFirebase,
    obtenerProductosPorCategoria as obtenerProductosPorCategoriaDeFirebase,
    obtenerProductosDestacados as obtenerProductosDestacadosDeFirebase,
    obtenerProductoPorId as obtenerProductoPorIdDeFirebase
} from '../services/productService';
import { obtenerCategoriaPorSlug } from '../services/categoryService';
import { normalizarTextoBusqueda, formatearCategoria } from '../utils/formatters';

// Normalizar texto para búsqueda
export const normalizarTexto = (texto) => normalizarTextoBusqueda(texto);

// Buscar productos por consulta
export const buscarProductos = async (consulta) => {
    if (!consulta || consulta.length < 2) return [];

    const consultaNormalizada = normalizarTextoBusqueda(consulta);
    const todosProductos = await obtenerTodosProductos();

    return todosProductos.filter(producto => {
        const nombreNormalizado = normalizarTextoBusqueda(producto.nombre || '');
        const descripcionNormalizada = normalizarTextoBusqueda(producto.descripcion || '');
        const categoriaNormalizada = normalizarTextoBusqueda(producto.categoriaNombre || producto.categoriaInfo?.nombre || '');

        return nombreNormalizado.includes(consultaNormalizada) ||
            descripcionNormalizada.includes(consultaNormalizada) ||
            categoriaNormalizada.includes(consultaNormalizada);
    });
};

// Obtener sugerencias de búsqueda
export const obtenerSugerenciasBusqueda = async (consulta, limite = 5) => {
    const resultados = await buscarProductos(consulta);

    const sugerenciasFormateadas = resultados.slice(0, limite).map(producto => ({
        ...producto,
        categoria: formatearCategoria(producto.categoriaNombre || '')
    }));

    return sugerenciasFormateadas;
};

// Obtener todos los productos
export const obtenerTodosProductos = async () => {
    try {
        const productosFirebase = await obtenerTodosProductosDeFirebase();
        console.log('📦 Productos obtenidos del servicio:', productosFirebase.length);
        return productosFirebase;
    } catch (error) {
        console.error("Error cargando productos:", error);
        return [];
    }
};

// Obtener productos por categoría 
export const obtenerProductosPorCategoria = async (slugCategoria) => {
    try {
        console.log(`🔍 Buscando productos para categoría slug: ${slugCategoria}`);
        const productosFirebase = await obtenerProductosPorCategoriaDeFirebase(slugCategoria);
        console.log(`✅ Productos encontrados para ${slugCategoria}:`, productosFirebase.length);
        return productosFirebase;
    } catch (error) {
        console.error("Error cargando productos por categoría:", error);
        return [];
    }
};

// Obtener productos destacados
export const obtenerProductosDestacados = async () => {
    try {
        console.log('🔍 Buscando productos destacados...');
        const productosDestacados = await obtenerProductosDestacadosDeFirebase();
        console.log('✅ Productos destacados encontrados:', productosDestacados.length);
        return productosDestacados;
    } catch (error) {
        console.error("Error cargando productos destacados:", error);
        return [];
    }
};

// Obtener producto por ID
export const obtenerProductoPorId = async (idProducto) => {
    try {
        const producto = await obtenerProductoPorIdDeFirebase(idProducto);

        if (producto) {
            return producto;
        } else {
            console.warn(`Producto con ID ${idProducto} no encontrado`);
            return null;
        }
    } catch (error) {
        console.error("Error cargando producto:", error);
        return null;
    }
};

// Obtener productos por categoría desde ruta (slug)
export const obtenerProductosPorCategoriaRuta = async (slugCategoria) => {
    try {
        console.log(`🛣️ Obteniendo productos para ruta categoría: ${slugCategoria}`);

        // Primero intentar obtener categoría
        const categoria = await obtenerCategoriaPorSlug(slugCategoria);
        console.log('📋 Categoría encontrada para ruta:', categoria?.nombre);

        // Luego obtener productos
        const productosFirebase = await obtenerProductosPorCategoriaDeFirebase(slugCategoria);
        console.log(`📦 Productos obtenidos para ruta ${slugCategoria}:`, productosFirebase.length);

        return productosFirebase;
    } catch (error) {
        console.error("Error cargando productos por categoría (ruta):", error);
        return [];
    }
};

// Función auxiliar para obtener stock de producto (usada en Checkout)
export const getProductStock = async (productId) => {
    try {
        const producto = await obtenerProductoPorIdDeFirebase(productId);
        return producto?.stock || 0;
    } catch (error) {
        console.error(`Error obteniendo stock para ${productId}:`, error);
        return 0;
    }
};