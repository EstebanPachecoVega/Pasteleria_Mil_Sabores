// Validadores reutilizables
export const Validators = {
    // Validar RUN chileno
    validateRun: (run) => {
        if (!run) return false;
        
        // Eliminar puntos y guión, convertir a mayúsculas
        const cleanRun = run.replace(/[\.\-]/g, '').toUpperCase();
        
        // Validar formato básico
        if (!/^\d{7,8}[0-9K]$/.test(cleanRun)) return false;
        
        // Validar dígito verificador
        const runBody = cleanRun.slice(0, -1);
        const expectedDv = cleanRun.slice(-1);
        
        // Calcular dígito verificador
        let sum = 0;
        let multiplier = 2;
        
        for (let i = runBody.length - 1; i >= 0; i--) {
            sum += parseInt(runBody[i]) * multiplier;
            multiplier = multiplier === 7 ? 2 : multiplier + 1;
        }
        
        const calculatedDv = 11 - (sum % 11);
        let dv;
        
        if (calculatedDv === 11) dv = '0';
        else if (calculatedDv === 10) dv = 'K';
        else dv = calculatedDv.toString();
        
        return dv === expectedDv;
    },

    // Validar email con dominios específicos
    validateEmail: (email) => {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return false;
        
        const allowedDomains = ['duoc.cl', 'profesor.duoc.cl', 'gmail.com'];
        const domain = email.split('@')[1];
        return allowedDomains.includes(domain);
    },

    // Validar contraseña
    validatePassword: (password) => {
        return password && password.length >= 4 && password.length <= 10;
    },

    // Validar texto con longitud máxima
    validateText: (text, maxLength) => {
        return text && text.length > 0 && text.length <= maxLength;
    },

    // Validar fecha
    validateDate: (date) => {
        if (!date) return true; // Fecha opcional
        const dateObj = new Date(date);
        return !isNaN(dateObj.getTime());
    },

    // Calcular edad desde fecha de nacimiento
    calculateAge: (birthdate) => {
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
};