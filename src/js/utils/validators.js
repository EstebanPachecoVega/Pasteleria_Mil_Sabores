// Validación de RUN chileno
export function validateRun(run) {
    if (!run) return false;
    
    const cleanRun = run.replace(/[\.\-\s]/g, '').toUpperCase();
    if (!/^\d{7,8}[0-9K]$/.test(cleanRun)) return false;
    
    const runBody = cleanRun.slice(0, -1);
    const providedDv = cleanRun.slice(-1);
    
    let sum = 0;
    let multiplier = 2;
    
    for (let i = runBody.length - 1; i >= 0; i--) {
        sum += parseInt(runBody[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    
    const remainder = sum % 11;
    const calculatedDv = 11 - remainder;
    
    let expectedDv;
    if (calculatedDv === 11) expectedDv = '0';
    else if (calculatedDv === 10) expectedDv = 'K';
    else expectedDv = calculatedDv.toString();
    
    return expectedDv === providedDv;
}

// Validación de email con dominios específicos
export function validateEmail(email) {
    if (!email) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    
    const allowedDomains = ['duoc.cl', 'profesor.duoc.cl', 'gmail.com'];
    const domain = email.split('@')[1];
    return allowedDomains.includes(domain);
}

// Validación de teléfono chileno
export function validatePhone(phone) {
    if (!phone) return false;
    const cleanPhone = phone.replace(/[\s\(\)\-]/g, '');
    return /^(\+?56)?(\d{9})$/.test(cleanPhone);
}

// Validación de contraseña
export function validatePassword(password) {
    return password && password.length >= 4 && password.length <= 10;
}

// Validación de texto con longitud máxima
export function validateText(text, maxLength) {
    return text && text.length > 0 && text.length <= maxLength;
}

// Validación de fecha
export function validateDate(dateString) {
    if (!dateString) return true;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

// Calcular edad desde fecha de nacimiento
export function calculateAge(birthdate) {
    if (!birthdate) return 0;
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}