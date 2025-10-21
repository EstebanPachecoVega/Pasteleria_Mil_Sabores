// validations.js - Funciones de validación adaptadas del código de tu profesora

// Validación del correo (EXACTA a tu profesora)
export const validarCorreo = (correo) => {
    const regex = /^[\w.+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
    return regex.test(correo);
};

// Validación del run (EXACTA a tu profesora)
export const validarRun = (run) => {
    const regex = /^[0-9]{8}[0-9K]$/;
    return regex.test(run);
};

// Validación de edad mínima 18 años (EXACTA a tu profesora)
export const esMayorEdad = (fecha) => {
    const hoy = new Date();
    const fechaNacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }
    return edad >= 18;
};

// Función adicional para formatear RUN (opcional - para mejor UX)
export const formatearRun = (run) => {
    if (!run) return '';
    
    // Limpiar: solo números y K, convertir a mayúsculas
    const runLimpio = run.replace(/[^\dkK]/gi, '').toUpperCase();
    
    // Si tiene 8 o más caracteres, formatear con guión
    if (runLimpio.length >= 8) {
        const cuerpo = runLimpio.slice(0, 8);
        const digitoVerificador = runLimpio.slice(8, 9) || '';
        return digitoVerificador ? `${cuerpo}-${digitoVerificador}` : cuerpo;
    }
    
    return runLimpio;
};

// Función adicional para validar RUN con formato (con guión)
export const validarRunConFormato = (run) => {
    if (!run) return false;
    
    // Aceptar tanto con guión como sin guión
    const runLimpio = run.replace('-', '').toUpperCase();
    return validarRun(runLimpio);
};

// Función para obtener mensajes de error específicos
export const obtenerMensajeError = (campo, valor) => {
    switch (campo) {
        case 'run':
            if (!valor) return 'El RUN es obligatorio';
            if (!validarRun(valor)) return 'RUN incorrecto. Debe tener 8 dígitos + número o K verificador';
            return '';
            
        case 'correo':
            if (!valor) return 'El correo es obligatorio';
            if (!validarCorreo(valor)) return 'El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com';
            return '';
            
        case 'birthDate':
            if (!valor) return 'La fecha de nacimiento es obligatoria';
            if (!esMayorEdad(valor)) return 'Debe ser mayor de 18 años para registrarse';
            return '';
            
        default:
            return '';
    }
};