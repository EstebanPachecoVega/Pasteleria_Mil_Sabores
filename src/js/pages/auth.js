import { UserManager } from '../components/UserManager.js';
import { getAllRegions, getCommunesByRegion } from '../data/regions.js';
import { Validators } from '../utils/validators.js';

export class AuthController {
    constructor() {
        this.userManager = new UserManager();
        this.init();
    }

    init() {
        this.loadRegions();
        this.setupEventListeners();
        this.checkAuthentication();
    }

    loadRegions() {
        const regionSelect = document.getElementById('registerRegion');
        if (!regionSelect) return;

        const regions = getAllRegions();
        regionSelect.innerHTML = '<option value="">Selecciona una región</option>' +
            regions.map(region => 
                `<option value="${region.id}">${region.name}</option>`
            ).join('');

        // Cargar comunas cuando cambie la región
        regionSelect.addEventListener('change', (e) => {
            this.loadCommunes(parseInt(e.target.value));
        });
    }

    loadCommunes(regionId) {
        const communeSelect = document.getElementById('registerCommune');
        if (!communeSelect) return;

        const communes = getCommunesByRegion(regionId);
        communeSelect.innerHTML = '<option value="">Selecciona una comuna</option>' +
            communes.map(commune => 
                `<option value="${commune}">${commune}</option>`
            ).join('');

        communeSelect.disabled = !regionId;
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form
        document.getElementById('registerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Validación en tiempo real
        document.getElementById('registerRun')?.addEventListener('blur', (e) => {
            this.validateRun(e.target);
        });

        document.getElementById('registerEmail')?.addEventListener('blur', (e) => {
            this.validateEmail(e.target);
        });
    }

    validateRun(input) {
        const isValid = Validators.validateRun(input.value);
        this.setValidationState(input, isValid, 'Por favor ingresa un RUN válido');
        return isValid;
    }

    validateEmail(input) {
        const isValid = Validators.validateEmail(input.value);
        this.setValidationState(input, isValid, 'Por favor ingresa un correo válido (@duoc.cl, @profesor.duoc.cl o @gmail.com)');
        return isValid;
    }

    setValidationState(input, isValid, message) {
        if (isValid) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        } else {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
            input.nextElementSibling.textContent = message;
        }
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const result = this.userManager.login(email, password);
        
        if (result.success) {
            // Cerrar modal y actualizar UI
            bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
            this.updateAuthUI();
            this.showToast('Sesión iniciada correctamente', 'success');
        } else {
            this.showToast(result.message, 'error');
        }
    }

    async handleRegister() {
        // Validar todos los campos
        const runInput = document.getElementById('registerRun');
        const emailInput = document.getElementById('registerEmail');
        
        const isRunValid = this.validateRun(runInput);
        const isEmailValid = this.validateEmail(emailInput);
        
        if (!isRunValid || !isEmailValid) {
            this.showToast('Por favor corrige los errores en el formulario', 'error');
            return;
        }

        const userData = {
            run: runInput.value,
            name: document.getElementById('registerName').value,
            lastName: document.getElementById('registerLastName').value,
            email: emailInput.value,
            password: document.getElementById('registerPassword').value,
            birthdate: document.getElementById('registerBirthdate').value || null,
            region: document.getElementById('registerRegion').value,
            commune: document.getElementById('registerCommune').value,
            address: document.getElementById('registerAddress').value,
            discountCode: document.getElementById('registerDiscountCode').value || null
        };

        const result = this.userManager.register(userData);
        
        if (result.success) {
            // Cerrar modal y actualizar UI
            bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
            this.updateAuthUI();
            this.showToast('Cuenta creada exitosamente', 'success');
            
            // Aplicar descuentos automáticamente si corresponde
            this.applyAutomaticDiscounts(result.user);
        } else {
            this.showToast(result.message, 'error');
        }
    }

    applyAutomaticDiscounts(user) {
        const discounts = this.userManager.getDiscountEligibility();
        let message = '';
        
        if (discounts.isOver50) {
            message += '¡Felicidades! Tienes 50% de descuento por ser mayor de 50 años. ';
        }
        
        if (discounts.hasPermanentDiscount) {
            message += '¡Felicidades! Tienes 10% de descuento permanente con código FELICES50. ';
        }
        
        if (discounts.isDuocStudent && discounts.isBirthday) {
            message += '¡Feliz cumpleaños! Como estudiante Duoc, tienes tortas gratis hoy. ';
        }
        
        if (message) {
            this.showToast(message, 'success', 10000);
        }
    }

    checkAuthentication() {
        if (this.userManager.isLoggedIn()) {
            this.updateAuthUI();
        }
    }

    updateAuthUI() {
        const user = this.userManager.getCurrentUser();
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        
        if (user) {
            // Mostrar menú de usuario
            if (authButtons) authButtons.classList.add('d-none');
            if (userMenu) {
                userMenu.classList.remove('d-none');
                document.getElementById('user-name').textContent = user.name;
                
                // Mostrar opciones según tipo de usuario
                this.updateUserMenu(user.userType);
            }
        } else {
            // Mostrar botones de autenticación
            if (authButtons) authButtons.classList.remove('d-none');
            if (userMenu) userMenu.classList.add('d-none');
        }
    }

    updateUserMenu(userType) {
        // Ocultar todos los elementos administrativos por defecto
        document.querySelectorAll('.admin-only, .vendor-only').forEach(el => {
            el.classList.add('d-none');
        });
        
        // Mostrar elementos según el tipo de usuario
        if (userType === 'administrador') {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.classList.remove('d-none');
            });
        } else if (userType === 'vendedor') {
            document.querySelectorAll('.vendor-only').forEach(el => {
                el.classList.remove('d-none');
            });
        }
    }

    showToast(message, type = 'info', duration = 5000) {
        // Implementar un sistema de notificaciones toast
        console.log(`${type.toUpperCase()}: ${message}`);
        // Aquí podrías integrar una librería de toasts o implementar la tuya
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new AuthController();
});