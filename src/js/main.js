import { loadPartial } from './partials.js';
import { ProductRenderer } from './components/ProductRenderer.js';
import { getProductsByCategory } from './data/products.js';

// Inicialización de la página
(async function init() {
  try {
    await Promise.all([
      loadPartial('header-placeholder', '/src/partials/header.html'),
      loadPartial('navbar-placeholder', '/src/partials/navbar.html'),
      loadPartial('footer-placeholder', '/src/partials/footer.html')
    ]);
    console.log('Partials cargados ✅');
  } catch (err) {
    console.error('Error cargando partials:', err);
  }
})();


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

(async function init() {
  try {
    // Cargar partials comunes
    await Promise.all([
      loadPartial('header-placeholder', '/src/partials/header.html'),
      loadPartial('navbar-placeholder', '/src/partials/navbar.html'),
      loadPartial('footer-placeholder', '/src/partials/footer.html')
    ]);
    
    // Detectar y cargar productos si es una página de categoría
    await loadCategoryProducts();
    
    console.log('Inicialización completada ✅');
  } catch (err) {
    console.error('Error durante la inicialización:', err);
  }
})();

async function loadCategoryProducts() {
  // Obtener el nombre del archivo actual
  const currentPage = window.location.pathname.split('/').pop();
  
  // Verificar si esta página corresponde a una categoría de productos
  const category = pageToCategoryMap[currentPage];
  
  if (category && document.getElementById('products-container')) {
    try {
      const renderer = new ProductRenderer();
      await renderer.loadTemplate();
      
      const products = getProductsByCategory(category);
      renderer.renderProducts(products, 'products-container');
      
      console.log(`Productos de ${category} cargados ✅`);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  }
}