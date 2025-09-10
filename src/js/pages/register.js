import { AuthManager } from '../components/AuthManager.js';
import { getAllRegions, getCommunesByRegion } from '../../data/regions.js';
import { validateRun, validateEmail, validatePassword, validateText, validatePhone } from '../utils/validators.js';

// Inicializar el gestor de autenticación
const authManager = new AuthManager();

document.addEventListener('DOMContentLoaded', function() {
    // Si ya está autenticado, redirigira al home
    if (authManager.isLoggedIn()) {
        window.location.href = '/index.html';
        return;
    }

    // Cargar regiones
    loadRegions();

    // Configurar event listeners
    setupEventListeners();
});

function loadRegions() {
    const regionSelect = document.getElementById('registerRegion');
    if (!regionSelect) return;

    const regions = getAllRegions();
    regionSelect.innerHTML = '<option value="">Selecciona una región</option>' +
        regions.map(region => 
            `<option value="${region.id}">${region.name}</option>`
        ).join('');

    // Cargar comunas cuando cambie la región
    regionSelect.addEventListener('change', (e) => {
        loadCommunes(parseInt(e.target.value));
    });
}

function loadCommunes(regionId) {
    const communeSelect = document.getElementById('registerCommune');
    if (!communeSelect) return;

    const communes = getCommunesByRegion(regionId);
    communeSelect.innerHTML = '<option value="">Selecciona una comuna</option>' +
        communes.map(commune => 
            `<option value="${commune}">${commune}</option>`
        ).join('');

    communeSelect.disabled = !regionId;
}

function setupEventListeners() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    // Validación en tiempo real
    form.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('blur', () => validateField(input));
    });

    // Envío del formulario
    form.addEventListener('submit', handleRegister);
}

function validateField(input) {
    const value = input.value.trim();
    let isValid = true;
    let message = '';

    switch (input.id) {
        case 'registerRun':
            isValid = validateRun(value);
            message = 'Por favor ingresa un RUN válido';
            break;
        case 'registerName':
            isValid = validateText(value, 50);
            message = 'El nombre debe tener máximo 50 caracteres';
            break;
        case 'registerLastName':
            isValid = validateText(value, 100);
            message = 'Los apellidos deben tener máximo 100 caracteres';
            break;
        case 'registerEmail':
            isValid = validateEmail(value);
            message = 'Por favor ingresa un correo válido (@duoc.cl, @profesor.duoc.cl o @gmail.com)';
            break;
        case 'registerPhone':
            isValid = validatePhone(value);
            message = 'Por favor ingresa un teléfono válido';
            break;
        case 'registerPassword':
            isValid = validatePassword(value);
            message = 'La contraseña debe tener entre 4 y 10 caracteres';
            break;
        case 'registerAddress':
            isValid = validateText(value, 300);
            message = 'La dirección debe tener máximo 300 caracteres';
            break;
        case 'registerRegion':
        case 'registerCommune':
            isValid = value !== '';
            message = 'Este campo es requerido';
            break;
        default:
            isValid = true;
    }

    setValidationState(input, isValid, message);
    return isValid;
}

function setValidationState(input, isValid, message = '') {
    if (isValid) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    } else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        
        // Mostrar mensaje de error
        const feedback = input.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = message;
        }
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const form = e.target;
    let isValid = true;
    
    // Validar todos los campos
    form.querySelectorAll('input, select, textarea').forEach(input => {
        if (input.required && !validateField(input)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showAlert('Por favor corrige los errores en el formulario', 'danger');
        return;
    }
    
    // Obtener datos del formulario
    const userData = {
        run: document.getElementById('registerRun').value.trim(),
        name: document.getElementById('registerName').value.trim(),
        lastName: document.getElementById('registerLastName').value.trim(),
        email: document.getElementById('registerEmail').value.trim(),
        password: document.getElementById('registerPassword').value,
        phone: document.getElementById('registerPhone').value.trim(),
        birthdate: document.getElementById('registerBirthdate').value || null,
        region: document.getElementById('registerRegion').value,
        commune: document.getElementById('registerCommune').value,
        address: document.getElementById('registerAddress').value.trim(),
        discountCode: document.getElementById('registerDiscountCode').value.trim() || null
    };
    
    try {
        const result = authManager.register(userData);
        
        if (result.success) {
            showAlert('¡Cuenta creada exitosamente! Serás redirigido en breve.', 'success');
            
            // Iniciar sesión automáticamente
            authManager.login(userData.email, userData.password);
            
            // Redirigir después de un breve delay
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 2000);
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        showAlert('Error al crear la cuenta. Por favor intenta nuevamente.', 'danger');
    }
}

function showAlert(message, type) {
    // Eliminar alertas existentes
    document.querySelectorAll('.alert').forEach(alert => alert.remove());
    
    // Crear alerta Bootstrap
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insertar al principio del card body
    const cardBody = document.querySelector('.card-body');
    cardBody.insertBefore(alertDiv, cardBody.firstChild);
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }
    }, 5000);
}