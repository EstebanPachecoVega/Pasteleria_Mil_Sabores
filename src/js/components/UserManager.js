import { validateRun, validateEmail, validatePassword, validateText, validateDate, calculateAge, validatePhone } from '../utils/validators.js';

export class UserManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    }

    // Crear nuevo usuario
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
            userType: 'cliente',
            region: userData.region,
            commune: userData.commune,
            address: userData.address,
            discountCode: userData.discountCode,
            isDuocStudent: userData.email.endsWith('@duoc.cl') || userData.email.endsWith('@profesor.duoc.cl'),
            registrationDate: new Date().toISOString()
        };

        // Aplicar beneficios por registro
        if (userData.discountCode === 'FELICES50') {
            newUser.hasPermanentDiscount = true;
        }

        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));

        return { 
            success: true, 
            message: 'Usuario registrado exitosamente',
            user: newUser
        };
    }

    // Iniciar sesión
    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = { ...user };
            delete this.currentUser.password;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            return { success: true, user: this.currentUser };
        }
        
        return { success: false, message: 'Credenciales no válidas' };
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
        localStorage.setItem('users', JSON.stringify(this.users));

        // Actualizar usuario actual si es el mismo
        if (this.currentUser && this.currentUser.id === userId) {
            this.currentUser = { ...this.currentUser, ...updatedData };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }

        return { success: true, message: 'Perfil actualizado exitosamente' };
    }
}