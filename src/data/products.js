import { 
    obtenerTodosProductos as obtenerTodosProductosDeFirebase, 
    obtenerProductosPorCategoria as obtenerProductosPorCategoriaDeFirebase,
    obtenerProductosDestacados as obtenerProductosDestacadosDeFirebase,
    obtenerProductoPorId as obtenerProductoPorIdDeFirebase
  } from '../services/productService'; 
  
  // Función para normalizar texto (sin tildes, minúsculas)
  export const normalizarTexto = (texto) => {
      return texto
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Eliminar tildes
          .trim();
  };
  
  // Función para buscar productos
  export const buscarProductos = async (consulta) => {
      if (!consulta || consulta.length < 2) return [];
  
      const consultaNormalizada = normalizarTexto(consulta);
      const todosProductos = await obtenerTodosProductos();
  
      return todosProductos.filter(producto => {
          const nombreNormalizado = normalizarTexto(producto.nombre || '');
          const descripcionNormalizada = normalizarTexto(producto.descripcion || '');
          const categoriaNormalizada = normalizarTexto(producto.categoria || '');
  
          return nombreNormalizado.includes(consultaNormalizada) ||
              descripcionNormalizada.includes(consultaNormalizada) ||
              categoriaNormalizada.includes(consultaNormalizada);
      });
  };
  
  // Función para obtener sugerencias de búsqueda
  export const obtenerSugerenciasBusqueda = async (consulta, limite = 5) => {
      const resultados = await buscarProductos(consulta);
      return resultados.slice(0, limite);
  };
  
  // 🔄 FUNCIONES ACTUALIZADAS PARA USAR SOLO FIREBASE
  
  // Función para obtener todos los productos (SOLO FIREBASE)
  export const obtenerTodosProductos = async () => {
      try {
          console.log('🔥 obtenerTodosProductos - buscando en Firebase');
          const productosFirebase = await obtenerTodosProductosDeFirebase();
          console.log('✅ obtenerTodosProductos - productos obtenidos de Firebase:', productosFirebase.length);
          return productosFirebase;
      } catch (error) {
          console.error("❌ obtenerTodosProductos - Error cargando productos de Firebase:", error);
          // Retorna array vacío en lugar de datos locales
          return [];
      }
  };
  
  // Función para obtener productos por categoría (SOLO FIREBASE)
  export const obtenerProductosPorCategoria = async (categoria) => {
      try {
          console.log('🔥 obtenerProductosPorCategoria - buscando en Firebase, categoría:', categoria);
          const productosFirebase = await obtenerProductosPorCategoriaDeFirebase(categoria);
          console.log('✅ obtenerProductosPorCategoria - productos obtenidos de Firebase:', productosFirebase.length);
          return productosFirebase;
      } catch (error) {
          console.error("❌ obtenerProductosPorCategoria - Error cargando productos de Firebase:", error);
          // Retorna array vacío en lugar de datos locales
          return [];
      }
  };
  
  // Función para obtener productos destacados (SOLO FIREBASE)
  export const obtenerProductosDestacados = async () => {
      try {
          console.log('🔥 obtenerProductosDestacados - buscando productos destacados en Firebase');
          const productosDestacados = await obtenerProductosDestacadosDeFirebase();
          console.log('✅ obtenerProductosDestacados - productos destacados obtenidos:', productosDestacados.length);
          return productosDestacados;
      } catch (error) {
          console.error("❌ obtenerProductosDestacados - Error cargando productos destacados:", error);
          // Retorna array vacío en lugar de datos locales
          return [];
      }
  };
  
  // Función para obtener producto por ID (SOLO FIREBASE)
  export const obtenerProductoPorId = async (idProducto) => {
    try {
      console.log('🔥 obtenerProductoPorId - buscando en Firebase, ID:', idProducto);
      const producto = await obtenerProductoPorIdDeFirebase(idProducto);
      
      if (producto) {
        console.log('✅ obtenerProductoPorId - producto encontrado en Firebase:', producto);
        console.log('📊 obtenerProductoPorId - stock:', producto.stock);
        console.log('📊 obtenerProductoPorId - activo:', producto.activo);
        return producto;
      } else {
        console.log('❌ obtenerProductoPorId - producto no encontrado en Firebase');
        return null;
      }
    } catch (error) {
      console.error("❌ obtenerProductoPorId - Error cargando producto de Firebase:", error);
      return null;
    }
  };
  
  // Función para rutas (SOLO FIREBASE)
  export const obtenerProductosPorCategoriaRuta = async (claveCategoria) => {
      try {
          console.log('🔥 obtenerProductosPorCategoriaRuta - buscando en Firebase, categoría:', claveCategoria);
          
          const productosFirebase = await obtenerProductosPorCategoriaDeFirebase(claveCategoria);
          
          console.log('✅ obtenerProductosPorCategoriaRuta - productos de Firebase:', productosFirebase.length);
          
          return productosFirebase;
      } catch (error) {
          console.error("❌ obtenerProductosPorCategoriaRuta - Error cargando productos de Firebase:", error);
          // Retorna array vacío en lugar de datos locales
          return [];
      }
  };
  
  // 🔄 MANTENER COMPATIBILIDAD CON CÓDIGO EXISTENTE (alias en inglés)
  export const getAllProducts = obtenerTodosProductos;
  export const getProductsByCategory = obtenerProductosPorCategoria;
  export const getFeaturedProducts = obtenerProductosDestacados;
  export const getProductById = obtenerProductoPorId;
  export const getProductsByCategoryRoute = obtenerProductosPorCategoriaRuta;
  export const searchProducts = buscarProductos;
  export const getSearchSuggestions = obtenerSugerenciasBusqueda;
  export const normalizeText = normalizarTexto;