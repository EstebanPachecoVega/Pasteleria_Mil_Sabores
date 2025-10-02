import { AdminBase } from './adminBase.js';
import { products } from '../../data/products.js';

export class AdminInventory extends AdminBase {
    initPageSpecific() {
        console.log('Inventario admin inicializado');
        this.cargarProductos();
        this.setupEventListeners();
    }

    cargarProductos() {
        // Tu lógica actual de cargar productos
        console.log('Cargando productos:', products);
        // Implementa aquí tu función cargarProductos()
    }

    setupEventListeners() {
        // Event listeners específicos de inventario
    }
}