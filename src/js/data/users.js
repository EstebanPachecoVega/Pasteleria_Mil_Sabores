// Datos de usuarios simulados
export const users = [
    {
        id: 1,
        email: "cliente_adulto@gmail.com",
        password: "password123", // En una app real, esto debería estar encriptado
        name: "Juan Pérez",
        age: 55, // Mayor de 50 años para el descuento
        birthdate: "1968-05-15",
        discountCode: "FELICES50", // Código de descuento permanente
        isDuocStudent: false
    },
    {
        id: 2,
        email: "estudiante@duoc.cl", // Correo institucional Duoc
        password: "password123",
        name: "María González",
        age: 22,
        birthdate: "2003-09-09", // Cumpleaños: ajustar para testing
        discountCode: null,
        isDuocStudent: true
    },
    {
        id: 3,
        email: "cliente_joven@ejemplo.com",
        password: "password123",
        name: "Pedro López",
        age: 30,
        birthdate: "1993-03-08",
        discountCode: null,
        isDuocStudent: false
    }
];

// Función para encontrar usuario por email
export function findUserByEmail(email) {
    return users.find(user => user.email === email);
}

// Función para verificar credenciales de login
export function validateLogin(email, password) {
    const user = findUserByEmail(email);
    if (!user) return null;
    return user.password === password ? user : null;
}

// Función para verificar si un usuario es mayor de 50 años
export function isUserOver50(user) {
    return user && user.age >= 50;
}

// Función para verificar si es estudiante Duoc
export function isDuocStudent(user) {
    return user && (user.isDuocStudent || (user.email && user.email.endsWith('@duoc.cl')));
}

// Función para verificar si es el cumpleaños del usuario
export function isUserBirthday(user) {
    if (!user || !user.birthdate) return false;
    
    const today = new Date();
    const birthdate = new Date(user.birthdate);
    
    return birthdate.getDate() === today.getDate() && 
           birthdate.getMonth() === today.getMonth();
}