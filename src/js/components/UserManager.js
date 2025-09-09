import { Validators } from '../utils/validators.js';

export class UserManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    }

    // Registrar nuevo usuario
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

        // Crear nuevo usuario
        const newUser = {
            id: Date.now().toString(),
            run: userData.run,
            name: userData.name,
            lastName: userData.lastName,
            email: userData.email,
            password: userData.password, 
            birthdate: userData.birthdate,
            age: userData.birthdate ? Validators.calculateAge(userData.birthdate) : 0,
            userType: 'cliente', // Por defecto es cliente
            region: userData.region,
            commune: userData.commune,
            address: userData.address,
            discountCode: userData.discountCode,
            isDuocStudent: userData.email.endsWith('@duoc.cl') || userData.email.endsWith('@profesor.duoc.cl'),
            registrationDate: new Date().toISOString()
        };

        // Aplicar reglas de descuento especiales
        if (userData.discountCode === 'FELICES50') {
            newUser.hasPermanentDiscount = true;
        }

        // Guardar usuario
        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));

        // Iniciar sesión automáticamente
        this.login(userData.email, userData.password);

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
            delete this.currentUser.password; // No guarda la contraseña en la sesión
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
            Validators.validateRun(userData.run) &&
            Validators.validateText(userData.name, 50) &&
            Validators.validateText(userData.lastName, 100) &&
            Validators.validateEmail(userData.email) &&
            Validators.validatePassword(userData.password) &&
            (!userData.birthdate || Validators.validateDate(userData.birthdate)) &&
            Validators.validateText(userData.address, 300)
        );
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.currentUser;
    }

    // Verificar si hay una sesión activa
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Actualizar perfil de usuario
    updateProfile(updatedData) {
        if (!this.isLoggedIn()) {
            return { success: false, message: 'No hay una sesión activa' };
        }

        // Validar datos actualizados
        if (!this.validateUserData({ ...this.currentUser, ...updatedData })) {
            return { success: false, message: 'Datos de usuario no válidos' };
        }

        // Actualizar usuario en la base de datos
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        this.users[userIndex] = { ...this.users[userIndex], ...updatedData };
        localStorage.setItem('users', JSON.stringify(this.users));

        // Actualizar usuario actual
        this.currentUser = { ...this.currentUser, ...updatedData };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        return { success: true, message: 'Perfil actualizado exitosamente' };
    }

    // Verificar elegibilidad para descuentos
    getDiscountEligibility() {
        if (!this.currentUser) return {};
        
        const today = new Date();
        const birthdate = new Date(this.currentUser.birthdate);
        const isBirthday = birthdate.getDate() === today.getDate() && 
                          birthdate.getMonth() === today.getMonth();
        
        return {
            isOver50: this.currentUser.age >= 50,
            hasPermanentDiscount: this.currentUser.hasPermanentDiscount || this.currentUser.discountCode === 'FELICES50',
            isDuocStudent: this.currentUser.isDuocStudent,
            isBirthday: isBirthday
        };
    }
}