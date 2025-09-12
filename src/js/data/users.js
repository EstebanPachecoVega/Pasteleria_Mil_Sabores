// Datos de usuarios unificados con sistema de roles
export const users = [
    {
        id: 1,
        run: "12345678-9",
        email: "cliente_adulto@gmail.com",
        password: "password123",
        name: "Juan",
        lastName: "Pérez",
        age: 55,
        birthdate: "1968-05-15",
        phone: "+56912345678",
        userType: "customer", // Tipo de usuario: customer, student, admin
        customerType: "regular", // Subtipo: regular, premium, vip
        region: "13",
        commune: "Santiago",
        address: "Av. Principal 123",
        discountCode: "FELICES50",
        isDuocStudent: false,
        registrationDate: "2023-01-15T00:00:00.000Z",
        permissions: ["place_orders", "view_products"] // Permisos basados en roles
    },
    {
        id: 2,
        run: "18765432-1",
        email: "estudiante@duoc.cl",
        password: "password123",
        name: "María",
        lastName: "González",
        age: 22,
        birthdate: "2003-09-09",
        phone: "+56987654321",
        userType: "student", // Tipo específico para estudiantes
        customerType: "student", 
        region: "13",
        commune: "Santiago",
        address: "Calle Secundaria 456",
        discountCode: null,
        isDuocStudent: true,
        studentId: "ST2024001", // Campo específico para estudiantes
        registrationDate: "2023-02-20T00:00:00.000Z",
        permissions: ["place_orders", "view_products", "student_discount"]
    },
    {
        id: 3,
        run: "14523678-2",
        email: "pichupancha.admin@company.com",
        password: "admin2024",
        name: "Admin",
        lastName: "User",
        age: 22,
        birthdate: "2002-01-01",
        phone: "+56999999999",
        userType: "admin", // Tipo administrador
        customerType: null, // Los admin no son clientes
        region: "13",
        commune: "Santiago",
        address: "Calle Admin 101",
        discountCode: null,
        isDuocStudent: false,
        registrationDate: "2023-01-01T00:00:00.000Z",
        permissions: ["all"] // Permisos completos
    },
    {
        id: 4,
        run: "19876543-3",
        email: "cliente_joven@ejemplo.com",
        password: "password123",
        name: "Pedro",
        lastName: "López",
        age: 30,
        birthdate: "1993-03-08",
        phone: "+56955555555",
        userType: "customer",
        customerType: "premium",
        region: "13",
        commune: "Santiago",
        address: "Pasaje Tertuliano 789",
        discountCode: null,
        isDuocStudent: false,
        registrationDate: "2023-03-10T00:00:00.000Z",
        permissions: ["place_orders", "view_products", "premium_discount"]
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
    return user.password === password ? { ...user } : null;
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

// Función para obtener usuarios por tipo
export function getUsersByType(userType) {
    return users.filter(user => user.userType === userType);
}

// Función para verificar permisos de usuario
export function hasPermission(user, permission) {
    if (!user || !user.permissions) return false;
    return user.permissions.includes("all") || user.permissions.includes(permission);
}