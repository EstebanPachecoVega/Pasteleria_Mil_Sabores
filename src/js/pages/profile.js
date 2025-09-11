import { AuthManager } from '../components/AuthManager.js';
import { UserManager } from '../components/UserManager.js';
import { getAllRegions, getCommunesByRegion } from '../../data/regions.js';
import { validateText, validatePhone, validateDate } from '../utils/validators.js';

// Inicializar managers
const authManager = new AuthManager();
const userManager = new UserManager();

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!authManager.isLoggedIn()) {
        window.location.href = '/src/pages/login.html';
        return;
    }

    // Cargar datos del perfil
    loadProfileData();
    
    // Cargar regiones
    loadRegions();
    
    // Configurar event listeners
    setupEventListeners();
});

function loadProfileData() {
    const user = authManager.getCurrentUser();
    if (!user) return;

    // Enmascarar RUN (formato: 12.345.678-*)
    const runParts = user.run.replace(/[\.\-]/g, '');
    const maskedRun = runParts.length >= 8 
        ? `${runParts.slice(0, 2)}.${runParts.slice(2, 5)}.${runParts.slice(5, 8)}-*` 
        : user.run;
    
    // Enmascarar email (formato: us****@dominio.com)
    const [emailUser, emailDomain] = user.email.split('@');
    const maskedEmail = emailUser.length > 2 
        ? `${emailUser.slice(0, 2)}****@${emailDomain}`
        : `****@${emailDomain}`;

    // Llenar campos de información
    document.getElementById('profile-run').value = maskedRun;
    document.getElementById('profile-email').value = maskedEmail;
    document.getElementById('profile-name').value = user.name || '';
    document.getElementById('profile-lastname').value = user.lastName || '';
    document.getElementById('profile-phone').value = user.phone || '';
    document.getElementById('profile-birthdate').value = user.birthdate || '';
    document.getElementById('profile-address').value = user.address || '';

    // Cargar región y comuna si existen
    if (user.region) {
        document.getElementById('profile-region').value = user.region;
        loadCommunes(parseInt(user.region));
        setTimeout(() => {
            document.getElementById('profile-commune').value = user.commune || '';
        }, 100);
    }

    // Cargar beneficios
    loadBenefits(user);
}

function loadRegions() {
    const regionSelect = document.getElementById('profile-region');
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
    const communeSelect = document.getElementById('profile-commune');
    if (!communeSelect) return;

    const communes = getCommunesByRegion(regionId);
    communeSelect.innerHTML = '<option value="">Selecciona una comuna</option>' +
        communes.map(commune => 
            `<option value="${commune}">${commune}</option>`
        ).join('');

    communeSelect.disabled = !regionId;
}

function loadBenefits(user) {
    const benefitsContainer = document.getElementById('benefits-container');
    if (!benefitsContainer) return;

    const benefits = [];
    const eligibility = authManager.getDiscountEligibility();

    // Descuento por edad
    if (eligibility.isOver50) {
        benefits.push({
            icon: 'bi-coin',
            title: 'Descuento por edad',
            description: '50% de descuento para mayores de 50 años'
        });
    }

    // Descuento permanente
    if (eligibility.hasPermanentDiscount) {
        benefits.push({
            icon: 'bi-tag',
            title: 'Descuento permanente',
            description: '10% de descuento en todos tus pedidos'
        });
    }

    // Beneficio cumpleaños
    if (eligibility.isDuocStudent && eligibility.isBirthday) {
        benefits.push({
            icon: 'bi-gift',
            title: 'Torta de cumpleaños',
            description: 'Torta gratis en tu cumpleaños (válido hoy)'
        });
    } else if (eligibility.isDuocStudent) {
        benefits.push({
            icon: 'bi-gift',
            title: 'Beneficio estudiante',
            description: 'Eres estudiante Duoc - torta gratis en tu cumpleaños'
        });
    }

    // Renderizar beneficios
    benefitsContainer.innerHTML = benefits.length > 0 
        ? benefits.map(benefit => `
            <div class="col-md-6">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body text-center">
                        <i class="bi ${benefit.icon} display-4 text-primary mb-3"></i>
                        <h5 class="card-title">${benefit.title}</h5>
                        <p class="card-text">${benefit.description}</p>
                    </div>
                </div>
            </div>
        `).join('')
        : '<div class="col-12 text-center"><p class="text-muted">No tienes beneficios activos en este momento.</p></div>';
}

function setupEventListeners() {
    const editToggleBtn = document.getElementById('edit-toggle-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const profileForm = document.getElementById('profile-form');
    const editableFields = profileForm.querySelectorAll('input:not([readonly]), select, textarea');

    // Alternar modo edición
    editToggleBtn.addEventListener('click', () => {
        const isEditing = editToggleBtn.textContent.includes('Cancelar');
        
        if (!isEditing) {
            enableEditing();
            editToggleBtn.innerHTML = '<i class="bi bi-x-circle me-1"></i>Cancelar';
            editToggleBtn.classList.remove('btn-outline-primary');
            editToggleBtn.classList.add('btn-outline-danger');
        } else {
            disableEditing();
            resetForm();
            editToggleBtn.innerHTML = '<i class="bi bi-pencil me-1"></i>Editar';
            editToggleBtn.classList.remove('btn-outline-danger');
            editToggleBtn.classList.add('btn-outline-primary');
        }
    });

    // Cancelar edición
    cancelEditBtn.addEventListener('click', () => {
        disableEditing();
        resetForm();
        editToggleBtn.innerHTML = '<i class="bi bi-pencil me-1"></i>Editar';
        editToggleBtn.classList.remove('btn-outline-danger');
        editToggleBtn.classList.add('btn-outline-primary');
    });

    // Enviar formulario
    profileForm.addEventListener('submit', handleProfileUpdate);

    // Validación en tiempo real
    editableFields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
    });
}

function enableEditing() {
    const editableFields = document.querySelectorAll('#profile-name, #profile-lastname, #profile-phone, #profile-birthdate, #profile-region, #profile-commune, #profile-address');
    const actionsSection = document.getElementById('profile-actions');

    editableFields.forEach(field => {
        field.readOnly = false;
        field.disabled = false;
    });

    actionsSection.classList.remove('d-none');
}

function disableEditing() {
    const editableFields = document.querySelectorAll('#profile-name, #profile-lastname, #profile-phone, #profile-birthdate, #profile-region, #profile-commune, #profile-address');
    const actionsSection = document.getElementById('profile-actions');

    editableFields.forEach(field => {
        field.readOnly = true;
        field.disabled = field.id.includes('region') || field.id.includes('commune');
    });

    actionsSection.classList.add('d-none');
}

function resetForm() {
    // Recargar datos originales
    loadProfileData();
    
    // Limpiar estados de validación
    const fields = document.querySelectorAll('.is-invalid, .is-valid');
    fields.forEach(field => {
        field.classList.remove('is-invalid');
        field.classList.remove('is-valid');
    });
}

function validateField(field) {
    let isValid = true;
    let message = '';

    switch (field.id) {
        case 'profile-name':
            isValid = validateText(field.value, 50);
            message = 'El nombre debe tener máximo 50 caracteres';
            break;
        case 'profile-lastname':
            isValid = validateText(field.value, 100);
            message = 'Los apellidos deben tener máximo 100 caracteres';
            break;
        case 'profile-phone':
            isValid = validatePhone(field.value);
            message = 'Por favor ingresa un teléfono válido';
            break;
        case 'profile-address':
            isValid = validateText(field.value, 300);
            message = 'La dirección debe tener máximo 300 caracteres';
            break;
        case 'profile-region':
        case 'profile-commune':
            isValid = field.value !== '';
            message = 'Este campo es requerido';
            break;
    }

    setValidationState(field, isValid, message);
    return isValid;
}

function setValidationState(field, isValid, message = '') {
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
        
        const feedback = field.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = message;
        }
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    let isValid = true;
    const fieldsToValidate = document.querySelectorAll('#profile-name, #profile-lastname, #profile-phone, #profile-address, #profile-region, #profile-commune');
    
    fieldsToValidate.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showAlert('Por favor corrige los errores en el formulario', 'danger');
        return;
    }
    
    const user = authManager.getCurrentUser();
    if (!user) return;
    
    const updatedData = {
        name: document.getElementById('profile-name').value.trim(),
        lastName: document.getElementById('profile-lastname').value.trim(),
        phone: document.getElementById('profile-phone').value.trim(),
        birthdate: document.getElementById('profile-birthdate').value || null,
        region: document.getElementById('profile-region').value,
        commune: document.getElementById('profile-commune').value,
        address: document.getElementById('profile-address').value.trim()
    };
    
    try {
        const result = userManager.updateProfile(user.id, updatedData);
        
        if (result.success) {
            showAlert('Perfil actualizado exitosamente', 'success');
            disableEditing();
            document.getElementById('edit-toggle-btn').innerHTML = '<i class="bi bi-pencil me-1"></i>Editar';
            document.getElementById('edit-toggle-btn').classList.remove('btn-outline-danger');
            document.getElementById('edit-toggle-btn').classList.add('btn-outline-primary');
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        showAlert('Error al actualizar el perfil. Por favor intenta nuevamente.', 'danger');
    }
}

function showAlert(message, type) {
    const alertDiv = document.getElementById('profile-alert');
    if (!alertDiv) return;
    
    alertDiv.textContent = message;
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.classList.add('d-none'), 150);
        }
    }, 5000);
}