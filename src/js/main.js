import { loadPartial } from './partials.js';
import { ProductRenderer } from './components/ProductRenderer.js';
import { getProductsByCategory } from './data/products.js';
import { CartManager } from './components/CartManager.js';

let cartManager;
let productRenderer;

// Mapeo de páginas a categorías
const pageToCategoryMap = {
  'individuales.html': 'individuales',
  'sin_azucar.html': 'sin_azucar',
  'sin_gluten.html': 'sin_gluten',
  'veganos.html': 'veganos',
  'circulares.html': 'circulares',
  'cuadradas.html': 'cuadradas',
  'especiales.html': 'especiales',
  'tradicional.html': 'tradicional'
};

// loadCategoryProducts (ajusta solo las rutas que uses)
async function loadCategoryProducts() {
  const currentPageRaw = window.location.pathname.split('/').pop();
  const currentPage = currentPageRaw === '' ? 'index.html' : currentPageRaw;
  const category = pageToCategoryMap[currentPage];

  if (currentPage === 'index.html') {
    // en index mostramos solo 6
    await loadAllProducts(8);
  } else if (currentPage === 'reposteria.html' || currentPage === 'productos.html' || currentPage === 'nuestros-productos.html') {
    // en estas páginas mostramos todos
    await loadAllProducts();
  } else if (category && document.getElementById('products-container')) {
    await loadProductsByCategory(category);
  }
}

// loadAllProducts parametrizable, con dedupe y cache simple
async function loadAllProducts(limit = null) {
  const container = document.getElementById('products-container');
  if (!container) return;

  try {
    await productRenderer.loadTemplate();

    // Cache simple en memoria (evita recalcular si se llama varias veces)
    if (!window.__allProductsCache) {
      const allProducts = [];
      for (const key in pageToCategoryMap) {
        const products = getProductsByCategory(pageToCategoryMap[key]) || [];
        allProducts.push(...products);
      }

      // Eliminar duplicados por id (ajusta la propiedad id según tu modelo)
      const uniqueMap = new Map();
      allProducts.forEach(p => {
        if (!p) return;
        const id = p.id ?? `${p.name}-${p.sku}`; // fallback si no tienes id
        if (!uniqueMap.has(id)) uniqueMap.set(id, p);
      });

      window.__allProductsCache = Array.from(uniqueMap.values());
    }

    const productsToUse = Array.isArray(window.__allProductsCache) ? window.__allProductsCache : [];

    // Si se pasó limit lo usamos; si no, mostramos todos
    const finalList = (typeof limit === 'number' && limit > 0)
      ? productsToUse.slice(0, limit)
      : productsToUse;

    productRenderer.renderProducts(finalList, 'products-container');
    console.log(`Productos cargados ✅ (page: ${window.location.pathname.split('/').pop() || 'index.html'}, count: ${finalList.length})`);
  } catch (error) {
    console.error('Error cargando todos los productos:', error);
  }
}


async function loadProductsByCategory(category) {
  try {
    await productRenderer.loadTemplate();
    const products = getProductsByCategory(category);
    productRenderer.renderProducts(products, 'products-container');
    console.log(`Productos de ${category} cargados ✅`);
  } catch (error) {
    console.error(`Error cargando productos de ${category}:`, error);
  }
}

(async function init() {
  try {
    // Cargar partials comunes una sola vez
    await Promise.all([
      loadPartial('header-placeholder', '/src/partials/header.html'),
      loadPartial('navbar-placeholder', '/src/partials/navbar.html'),
      loadPartial('footer-placeholder', '/src/partials/footer.html')
    ]);

    // Inicializar el CartManager y ProductRenderer una sola vez
    cartManager = new CartManager();
    productRenderer = new ProductRenderer();
    productRenderer.setCartManager(cartManager);

    // Pre-cargar template para evitar render sin plantilla
    await productRenderer.loadTemplate();

    // Cargar productos según la página
    await loadCategoryProducts();

    // Exportar global (si realmente lo necesitas)
    window.cartManager = cartManager;
    window.productRenderer = productRenderer;

    console.log('Inicialización completada ✅');
  } catch (err) {
    console.error('Error durante la inicialización:', err);
  }
})();
