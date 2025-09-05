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

async function loadCategoryProducts() {
  const currentPage = window.location.pathname.split('/').pop();
  const category = pageToCategoryMap[currentPage];

  // Si estamos en index.html, currentPage será '' o 'index.html'
  if (currentPage === '' || currentPage === 'index.html') {
    await loadAllProducts();
  } else if (category && document.getElementById('products-container')) {
    await loadProductsByCategory(category);
  }
}

async function loadAllProducts() {
  if (!document.getElementById('products-container')) return;

  try {
    // Usar la instancia global ya inicializada
    await productRenderer.loadTemplate();

    const allProducts = [];
    for (const key in pageToCategoryMap) {
      const products = getProductsByCategory(pageToCategoryMap[key]);
      allProducts.push(...products);
    }

    productRenderer.renderProducts(allProducts.slice(0, 16), 'products-container');
    console.log('Productos destacados cargados ✅');
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
