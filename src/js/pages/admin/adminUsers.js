import { AdminBase } from './adminBase.js';
import { users } from '../../data/users.js';

export class AdminUsers extends AdminBase {
    initPageSpecific() {
        console.log('Usuarios admin inicializado');
        this.cargarUsuarios();
        this.setupEventListeners();
    }

    cargarUsuarios() {
        // Tu lógica actual de cargar usuarios
        console.log('Cargando usuarios:', users);
        // Implementa aquí tu función cargarUsuarios()
    }

    setupEventListeners() {
        // Event listeners específicos de usuarios
    }
}