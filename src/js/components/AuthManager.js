// AuthManager.js - Gestión de autenticación con control de roles y permisos
import { UserManager } from './UserManager.js';

export class AuthManager {
    constructor() {
        this.userManager = new UserManager();
        this.init();
    }

    init() {
        // Verificar si hay una sesión activa al inicializar
        if (this.isLoggedIn()) {
            this.updateUIForLoggedInUser();
        } else {
            this.updateUIForLoggedOutUser();
        }

        // Escuchar eventos de cambio de estado de autenticación
        window.addEventListener('authStateChanged', () => {
            if (this.isLoggedIn()) {
                this.updateUIForLoggedInUser();
            } else {
                this.updateUIForLoggedOutUser();
            }
        });

        // Escuchar eventos de actualización del carrito
        window.addEventListener('cartUpdated', () => {
            this.updateCartCount();
        });
    }

    // Registrar nuevo usuario
    register(userData) {
        const result = this.userManager.register(userData);
        
        if (result.success) {
            // Disparar evento de cambio de estado de autenticación
            window.dispatchEvent(new CustomEvent('authStateChanged'));
        }
        
        return result;
    }

    // Iniciar sesión
    login(email, password) {
        const result = this.userManager.login(email, password);
        
        if (result.success) {
            window.dispatchEvent(new CustomEvent('authStateChanged'));
            window.dispatchEvent(new CustomEvent('userLoggedIn', { 
                detail: { user: result.user } 
            }));
        }
        
        return result;
    }

    // Cerrar sesión
    logout() {
        this.userManager.logout();
        window.dispatchEvent(new CustomEvent('authStateChanged'));
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
    }

    // Verificar autenticación
    isLoggedIn() {
        return this.userManager.isLoggedIn();
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.userManager.getCurrentUser();
    }

    // Verificar permisos
    hasPermission(permission) {
        return this.userManager.hasPermission(permission);
    }

    // Obtener tipo de usuario
    getUserType() {
        return this.userManager.getUserType();
    }

    // Verificar si es administrador
    isAdmin() {
        return this.userManager.isAdmin();
    }

    // Verificar si es estudiante
    isStudent() {
        return this.userManager.isStudent();
    }

    // Verificar si es cliente regular
    isCustomer() {
        return this.userManager.isCustomer();
    }

    // Verificar elegibilidad para descuentos
    getDiscountEligibility() {
        return this.userManager.getCurrentUserDiscountEligibility();
    }

    // Obtener todos los usuarios (para administración)
    getAllUsers() {
        return this.userManager.getAllUsers();
    }

    // Eliminar usuario (para administración)
    deleteUser(userId) {
        return this.userManager.deleteUser(userId);
    }

    // Actualizar UI según estado de autenticación
    updateUIForLoggedInUser() {
        const user = this.getCurrentUser();
        
        // Actualizar navbar
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        const userName = document.getElementById('user-name');
        
        if (authButtons) authButtons.classList.add('d-none');
        if (userMenu) userMenu.classList.remove('d-none');
        if (userName && user) {
            userName.textContent = user.name;
            
            // Añadir badge de tipo de usuario si existe el elemento
            const userBadge = document.getElementById('user-badge');
            if (userBadge) {
                userBadge.innerHTML = this.getUserBadgeHTML(user.userType);
            }
        }
        
        // Actualizar contador del carrito
        this.updateCartCount();
        
        // Mostrar/ocultar elementos según permisos
        this.updateUIBasedOnPermissions();
        
        // Configurar logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = (e) => {
                e.preventDefault();
                this.logout();
                window.location.href = '/index.html';
            };
        }
    }

    updateUIForLoggedOutUser() {
        // Actualizar navbar
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        
        if (authButtons) authButtons.classList.remove('d-none');
        if (userMenu) userMenu.classList.add('d-none');
        
        // Ocultar elementos que requieren autenticación
        this.hideProtectedElements();
    }

    // Obtener HTML del badge según tipo de usuario
    getUserBadgeHTML(userType) {
        const badges = {
            'admin': '<span class="badge bg-danger ms-2">Admin</span>',
            'student': '<span class="dropdown-item-text badge bg-info">Estudiante</span>',
            'customer': '<span class="dropdown-item-text badge bg-secondary">Cliente</span>'
        };
        
        return badges[userType] || '';
    }

    // Actualizar UI basado en permisos
    updateUIBasedOnPermissions() {
        // Ejemplo: Mostrar enlace de admin solo para administradores
        const adminLinks = document.querySelectorAll('[data-requires="admin"]');
        adminLinks.forEach(element => {
            element.style.display = this.isAdmin() ? 'block' : 'none';
        });
        
        // Ejemplo: Mostrar descuento especial para estudiantes
        const studentElements = document.querySelectorAll('[data-requires="student"]');
        studentElements.forEach(element => {
            element.style.display = this.isStudent() ? 'block' : 'none';
        });
        
        // Elementos que requieren autenticación
        const authRequiredElements = document.querySelectorAll('[data-requires="auth"]');
        authRequiredElements.forEach(element => {
            element.style.display = this.isLoggedIn() ? 'block' : 'none';
        });
    }

    // Ocultar elementos protegidos
    hideProtectedElements() {
        const protectedElements = document.querySelectorAll('[data-requires="auth"], [data-requires="admin"], [data-requires="student"]');
        protectedElements.forEach(element => {
            element.style.display = 'none';
        });
    }

    // Actualizar contador del carrito
    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            try {
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
                cartCount.textContent = totalItems;
                cartCount.style.display = totalItems > 0 ? 'inline-block' : 'none';
            } catch (error) {
                console.error('Error updating cart count:', error);
                cartCount.style.display = 'none';
            }
        }
    }

    // Verificar acceso a rutas protegidas
    checkRouteAccess() {
        const currentPath = window.location.pathname;
        
        // Rutas que requieren autenticación
        const protectedRoutes = [
            '/src/pages/profile.html',
            '/src/pages/orders.html',
            '/src/pages/admin/'
        ];
        
        // Rutas que requieren ser administrador
        const adminRoutes = [
            '/src/pages/admin/'
        ];
        
        // Verificar si la ruta actual requiere autenticación
        const requiresAuth = protectedRoutes.some(route => currentPath.includes(route));
        const requiresAdmin = adminRoutes.some(route => currentPath.includes(route));
        
        if (requiresAuth && !this.isLoggedIn()) {
            // Redirigir a login si no está autenticado
            window.location.href = '/src/pages/login.html';
            return false;
        }
        
        if (requiresAdmin && !this.isAdmin()) {
            // Redirigir a home si no es administrador
            window.location.href = '/index.html';
            return false;
        }
        
        return true;
    }

    // Obtener información del usuario para mostrar en UI
    getUserInfo() {
        const user = this.getCurrentUser();
        if (!user) return null;
        
        return {
            name: user.name,
            email: user.email,
            userType: user.userType,
            discountEligibility: this.getDiscountEligibility(),
            joinDate: new Date(user.registrationDate).toLocaleDateString()
        };
    }

    // Verificar si el usuario puede aplicar un descuento específico
    canApplyDiscount(discountType) {
        const eligibility = this.getDiscountEligibility();
        
        const discountRules = {
            'birthday': eligibility.isBirthday,
            'senior': eligibility.isOver50,
            'student': eligibility.isDuocStudent,
            'permanent': eligibility.hasPermanentDiscount
        };
        
        return discountRules[discountType] || false;
    }

    // Método para forzar la actualización de la UI
    refreshUI() {
        if (this.isLoggedIn()) {
            this.updateUIForLoggedInUser();
        } else {
            this.updateUIForLoggedOutUser();
        }
    }
}

// Inicialización automática cuando se carga el script
document.addEventListener('DOMContentLoaded', function() {
    // Esta instancia global puede ser usada en otros scripts
    window.authManager = new AuthManager();
    
    // Verificar acceso a rutas protegidas
    window.authManager.checkRouteAccess();
    
    // Configurar event listeners para elementos dinámicos
    document.addEventListener('click', function(e) {
        // Manejar logout desde cualquier elemento con data-action="logout"
        if (e.target.closest('[data-action="logout"]')) {
            e.preventDefault();
            window.authManager.logout();
        }
    });
});