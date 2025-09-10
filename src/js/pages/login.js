import { AuthManager } from '../components/AuthManager.js';

// Inicializar el gestor de autenticación
const authManager = new AuthManager();

document.addEventListener('DOMContentLoaded', function() {
    // Si ya está autenticado, redirigir al home
    if (authManager.isLoggedIn()) {
        window.location.href = '/index.html';
        return;
    }

    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', handleLogin);
    }

    // Cargar email recordado si existe
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        document.getElementById('loginEmail').value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
    }
});

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Validación básica
    let isValid = true;
    
    if (!email) {
        document.getElementById('loginEmail').classList.add('is-invalid');
        isValid = false;
    } else {
        document.getElementById('loginEmail').classList.remove('is-invalid');
    }
    
    if (!password) {
        document.getElementById('loginPassword').classList.add('is-invalid');
        isValid = false;
    } else {
        document.getElementById('loginPassword').classList.remove('is-invalid');
    }
    
    if (!isValid) {
        showAlert('Por favor completa todos los campos', 'danger');
        return;
    }

    // Intentar iniciar sesión
    const result = authManager.login(email, password);
    
    if (result.success) {
        showAlert('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
        
        // Guardar email si se eligió "Recordarme"
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
        
        // Redirigir después de un breve delay
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);
    } else {
        showAlert(result.message, 'danger');
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
}