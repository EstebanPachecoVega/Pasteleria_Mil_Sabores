// UserManager.js - Gestión de usuarios con sistema de roles unificado
import { 
  validateRun, 
  validateEmail, 
  validatePassword, 
  validateText, 
  validateDate, 
  calculateAge, 
  validatePhone 
} from '../utils/validators.js';
import { users as sampleUsers, validateLogin as validateSampleLogin } from '/src/js/data/users.js';

export class UserManager {
    constructor() {
        // Cargar usuarios de data/users.js como base si no hay en localStorage
        const storedUsers = JSON.parse(localStorage.getItem('users'));
        
        if (!storedUsers || storedUsers.length === 0) {
            this.users = [...sampleUsers];
            this.saveUsers();
        } else {
            this.users = storedUsers;
        }
        
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    }

    // Iniciar sesión con verificación mejorada
    login(email, password) {
        // Buscar en usuarios locales
        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            return this.setCurrentUser(user);
        }
        
        // Si no encuentra, intentar con la función de validación de data/users.js
        const validatedUser = validateSampleLogin(email, password);
        if (validatedUser) {
            // Agregar usuario a la lista si no existe
            if (!this.users.find(u => u.email === email)) {
                this.users.push(validatedUser);
                this.saveUsers();
            }
            
            return this.setCurrentUser(validatedUser);
        }
        
        return { success: false, message: 'Credenciales no válidas' };
    }

    // Establecer usuario actual
    setCurrentUser(user) {
        this.currentUser = { ...user };
        delete this.currentUser.password;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        return { success: true, user: this.currentUser };
    }

    // Crear nuevo usuario con asignación de tipo
    register(userData) {
        // Validaciones
        if (!this.validateUserData(userData)) {
            return { success: false, message: 'Datos de usuario no válidos' };
        }

        // Verificar si el usuario ya existe
        if (this.users.find(u => u.email === userData.email)) {
            return { success: false, message: 'El correo electrónico ya está registrado' };
        }

        if (this.users.find(u => u.run === userData.run)) {
            return { success: false, message: 'El RUN ya está registrado' };
        }

        // Determinar tipo de usuario basado en el email
        const userType = userData.email.endsWith('@duoc.cl') || 
                         userData.email.endsWith('@profesor.duoc.cl') ? 'student' : 'customer';

        // Crear usuario
        const newUser = {
            id: Date.now().toString(),
            run: userData.run,
            name: userData.name,
            lastName: userData.lastName,
            email: userData.email,
            password: userData.password,
            phone: userData.phone,
            birthdate: userData.birthdate,
            age: userData.birthdate ? calculateAge(userData.birthdate) : 0,
            userType: userType,
            customerType: userType === 'student' ? 'student' : 'regular',
            region: userData.region,
            commune: userData.commune,
            address: userData.address,
            discountCode: userData.discountCode,
            isDuocStudent: userType === 'student',
            registrationDate: new Date().toISOString(),
            permissions: this.getDefaultPermissions(userType)
        };

        // Aplicar beneficios por registro
        if (userData.discountCode === 'FELICES50') {
            newUser.hasPermanentDiscount = true;
            newUser.permissions.push('permanent_discount');
        }

        this.users.push(newUser);
        this.saveUsers();

        return { 
            success: true, 
            message: 'Usuario registrado exitosamente',
            user: newUser
        };
    }

    // Obtener permisos por defecto según tipo de usuario
    getDefaultPermissions(userType) {
        const basePermissions = ["place_orders", "view_products"];
        
        switch(userType) {
            case 'student':
                return [...basePermissions, "student_discount"];
            case 'admin':
                return ["all"];
            default:
                return basePermissions;
        }
    }

    // Cerrar sesión
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    // Validar datos de usuario
    validateUserData(userData) {
        return (
            validateRun(userData.run) &&
            validateText(userData.name, 50) &&
            validateText(userData.lastName, 100) &&
            validateEmail(userData.email) &&
            validatePassword(userData.password) &&
            validatePhone(userData.phone) &&
            (!userData.birthdate || validateDate(userData.birthdate)) &&
            validateText(userData.address, 300)
        );
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.currentUser;
    }

    // Verificar sesión activa
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Actualizar perfil
    updateProfile(userId, updatedData) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        this.users[userIndex] = { ...this.users[userIndex], ...updatedData };
        this.saveUsers();

        // Actualizar usuario actual si es el mismo
        if (this.currentUser && this.currentUser.id === userId) {
            this.currentUser = { ...this.currentUser, ...updatedData };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }

        return { success: true, message: 'Perfil actualizado exitosamente' };
    }

    // Verificar si usuario tiene permiso
    hasPermission(permission) {
        if (!this.currentUser || !this.currentUser.permissions) return false;
        return this.currentUser.permissions.includes("all") || 
               this.currentUser.permissions.includes(permission);
    }

    // Obtener usuarios por tipo
    getUsersByType(userType) {
        return this.users.filter(user => user.userType === userType);
    }

    // Obtener tipo de usuario actual
    getUserType() {
        return this.currentUser?.userType || 'guest';
    }

    // Verificar si es administrador
    isAdmin() {
        return this.getUserType() === 'admin';
    }

    // Verificar si es estudiante
    isStudent() {
        return this.getUserType() === 'student';
    }

    // Verificar si es cliente regular
    isCustomer() {
        return this.getUserType() === 'customer';
    }

    // Guardar usuarios en localStorage
    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    // Obtener todos los usuarios (para administración)
    getAllUsers() {
        return this.users.map(user => {
            const userCopy = { ...user };
            delete userCopy.password;
            return userCopy;
        });
    }

    // Eliminar usuario (para administración)
    deleteUser(userId) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        // Si el usuario a eliminar es el usuario actual, cerrar sesión
        if (this.currentUser && this.currentUser.id === userId) {
            this.logout();
        }

        this.users.splice(userIndex, 1);
        this.saveUsers();

        return { success: true, message: 'Usuario eliminado exitosamente' };
    }

    // Buscar usuario por email
    findUserByEmail(email) {
        return this.users.find(user => user.email === email);
    }

    // Buscar usuario por ID
    findUserById(id) {
        return this.users.find(user => user.id === id);
    }

    // Verificar si es el cumpleaños del usuario actual
    isCurrentUserBirthday() {
        if (!this.currentUser || !this.currentUser.birthdate) return false;
        
        const today = new Date();
        const birthdate = new Date(this.currentUser.birthdate);
        
        return birthdate.getDate() === today.getDate() && 
               birthdate.getMonth() === today.getMonth();
    }

    // Verificar si usuario actual es mayor de 50 años
    isCurrentUserOver50() {
        return this.currentUser && this.currentUser.age >= 50;
    }

    // Verificar si usuario actual es estudiante Duoc
    isCurrentUserDuocStudent() {
        return this.currentUser && 
               (this.currentUser.isDuocStudent || 
                (this.currentUser.email && 
                 (this.currentUser.email.endsWith('@duoc.cl') || 
                  this.currentUser.email.endsWith('@profesor.duoc.cl'))));
    }

    // Obtener elegibilidad para descuentos del usuario actual
    getCurrentUserDiscountEligibility() {
        if (!this.currentUser) return {};
        
        return {
            isOver50: this.isCurrentUserOver50(),
            hasPermanentDiscount: this.currentUser.hasPermanentDiscount || this.currentUser.discountCode === 'FELICES50',
            isDuocStudent: this.isCurrentUserDuocStudent(),
            isBirthday: this.isCurrentUserBirthday(),
            userType: this.currentUser.userType
        };
    }
}