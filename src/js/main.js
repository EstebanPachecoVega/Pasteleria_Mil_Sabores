
import { loadPartial } from './partials.js';

(async function init() {
  try {
    await Promise.all([
      loadPartial('header-placeholder', 'partials/header.html'),
      loadPartial('navbar-placeholder', 'partials/navbar.html'),
      loadPartial('footer-placeholder', 'partials/footer.html')
    ]);
    console.log('Partials cargados ✅');
  } catch (err) {
    console.error('Error cargando partials:', err);
  }
})();

