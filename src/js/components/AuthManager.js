import { UserManager } from './UserManager.js';

export class AuthManager {
    constructor() {
        this.userManager = new UserManager();
    }

    // Registrar nuevo usuario
    register(userData) {
        return this.userManager.register(userData);
    }

    // Iniciar sesión
    login(email, password) {
        return this.userManager.login(email, password);
    }

    // Cerrar sesión
    logout() {
        this.userManager.logout();
        document.dispatchEvent(new CustomEvent('authStateChanged'));
    }

    // Verificar autenticación
    isLoggedIn() {
        return this.userManager.isLoggedIn();
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.userManager.getCurrentUser();
    }

    // Verificar elegibilidad para descuentos
    getDiscountEligibility() {
        const user = this.getCurrentUser();
        if (!user) return {};
        
        const today = new Date();
        const birthdate = new Date(user.birthdate);
        const isBirthday = birthdate.getDate() === today.getDate() && 
                          birthdate.getMonth() === today.getMonth();
        
        return {
            isOver50: user.age >= 50,
            hasPermanentDiscount: user.hasPermanentDiscount || user.discountCode === 'FELICES50',
            isDuocStudent: user.isDuocStudent,
            isBirthday: isBirthday
        };
    }
}