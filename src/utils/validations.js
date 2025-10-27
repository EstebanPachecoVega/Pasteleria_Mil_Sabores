// src/utils/validations.js

// Función para calcular el dígito verificador esperado
export const calcularDigitoVerificador = (runBody) => {
    let factor = 2;
    let sum = 0;
    
    // Recorrer el cuerpo del RUN de derecha a izquierda
    for (let i = runBody.length - 1; i >= 0; i--) {
        sum += parseInt(runBody.charAt(i), 10) * factor;
        factor = factor === 7 ? 2 : factor + 1;
    }
    
    const expectedVerifier = 11 - (sum % 11);
    
    if (expectedVerifier === 11) {
        return '0';
    } else if (expectedVerifier === 10) {
        return 'K';
    } else {
        return expectedVerifier.toString();
    }
};

// Función para validar RUN chileno completo (con dígito verificador)
export const validateRun = (run) => {
    if (!run || run.trim() === '') return false;
    
    // Limpiar el RUN: eliminar espacios y convertir a mayúsculas
    const cleanRun = run.replace(/\s/g, '').toUpperCase();
    
    // Validar formato: 7-8 dígitos + 1 dígito verificador (0-9 o K)
    if (!/^\d{7,8}[0-9K]$/i.test(cleanRun)) {
        return false;
    }
    
    const runBody = cleanRun.slice(0, -1);
    const verifier = cleanRun.slice(-1).toUpperCase();
    
    const expectedVerifier = calcularDigitoVerificador(runBody);
    
    return expectedVerifier === verifier;
};

// Función para formatear RUN - permite números y K, sin guión
export const formatRun = (input) => {
    // Limpiar el input: eliminar todo excepto números y K, convertir a mayúsculas
    const cleanInput = input.replace(/[^\dkK]/gi, '').toUpperCase();
    
    if (cleanInput.length === 0) return '';
    
    // Limitar a 9 caracteres máximo (7-8 dígitos + 1 dígito verificador)
    const limitedInput = cleanInput.slice(0, 9);
    
    return limitedInput;
};

// Función para obtener el RUN con formato para el backend
export const getRunFormateado = (run) => {
    if (!validateRun(run)) return run;
    
    const cleanRun = run.replace(/\s/g, '').toUpperCase();
    const runBody = cleanRun.slice(0, -1);
    const verifier = cleanRun.slice(-1);
    
    return `${runBody}-${verifier}`;
};

// Función para validar si es mayor de edad
export const isAdult = (birthDate) => {
    if (!birthDate) return true;
    
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        return age - 1 >= 18;
    }
    
    return age >= 18;
};

// Función para validar contraseña
export const validatePassword = (password) => {
    if (password.length < 4 || password.length > 10) {
        return 'La contraseña debe tener entre 4 y 10 caracteres';
    }
    if (!/(?=.*[a-z])/.test(password)) {
        return 'La contraseña debe contener al menos una minúscula';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
        return 'La contraseña debe contener al menos una mayúscula';
    }
    if (!/(?=.*\d)/.test(password)) {
        return 'La contraseña debe contener al menos un número';
    }
    return null;
};

// Función para validar email con dominios específicos
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Email no válido';
    }
    
    // Dominios permitidos
    const allowedDomains = ['duoc.cl', 'profesor.duoc.cl', 'gmail.com'];
    const domain = email.split('@')[1];
    
    if (!allowedDomains.includes(domain)) {
        return 'El dominio del email no está permitido. Use @duoc.cl, @profesor.duoc.cl o @gmail.com';
    }
    
    return null;
};

// Función para validar teléfono chileno
export const validatePhone = (phone) => {
    if (!phone) return null;
    
    // Limpiar espacios y caracteres especiales
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    
    // Validar formato chileno y longitud máxima
    const phoneRegex = /^(\+?56)?(0?9)[98765432]\d{7}$/;
    
    if (cleanPhone.length > 15) {
        return 'El teléfono no puede exceder los 15 caracteres';
    }
    
    if (!phoneRegex.test(cleanPhone)) {
        return 'Teléfono chileno no válido. Ej: +56912345678 o 912345678';
    }
    
    return null;
};

// Función para formatear teléfono mientras se escribe
export const formatPhone = (input) => {
    // Limpiar el input: eliminar todo excepto números y +
    const cleanInput = input.replace(/[^\d+]/g, '');
    
    if (cleanInput.length === 0) return '';
    
    // Limitar a 15 caracteres máximo
    const limitedInput = cleanInput.slice(0, 15);
    
    return limitedInput;
};

// Función para validar campos de texto (solo letras y espacios)
export const validateText = (text, fieldName) => {
    if (!text || text.trim() === '') {
        return `${fieldName} es obligatorio`;
    }
    
    const textRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!textRegex.test(text)) {
        return `${fieldName} solo puede contener letras y espacios`;
    }
    
    if (text.length > 25) {
        return `${fieldName} no puede exceder los 25 caracteres`;
    }
    
    return null;
};