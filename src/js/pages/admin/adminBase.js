import { AuthManager } from '../../components/AuthManager.js';

export class AdminBase {
    constructor() {
        this.authManager = new AuthManager();
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.checkAdminAuth();
            this.setupLogout();
            this.loadUserInfo();
            this.initPageSpecific();
        });
    }

    checkAdminAuth() {
        if (!this.authManager.isLoggedIn() || !this.authManager.isAdmin()) {
            window.location.href = '../login.html';
            return false;
        }
        return true;
    }

    loadUserInfo() {
        const user = this.authManager.getCurrentUser();
        if (user) {
            const adminNameElement = document.getElementById('admin-name');
            if (adminNameElement) {
                adminNameElement.textContent = user.name;
            }
        }
    }

    setupLogout() {
        const logoutBtn = document.getElementById('admin-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.authManager.logout();
                window.location.href = '../index.html';
            });
        }
    }

    // Método para ser sobrescrito por páginas específicas
    initPageSpecific() {}
}