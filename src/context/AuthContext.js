// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { findUserByEmail, createUser, getSpecialDiscounts, userTypes } from '../data/users';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Cargar usuario al iniciar la app
    useEffect(() => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    // Login
    const login = async (email, password) => {
        const user = findUserByEmail(email);

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        if (user.password !== password) {
            throw new Error('Contraseña incorrecta');
        }

        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    };

    // Registro
    const register = async (userData) => { // ← userData está definido como parámetro
        const existingUser = findUserByEmail(userData.email);

        if (existingUser) {
            throw new Error('El email ya está registrado');
        }

        // ✅ CORREGIDO: getSpecialDiscounts está importado
        const specialDiscounts = getSpecialDiscounts(userData);

        const newUser = createUser({
            ...userData,
            birthDate: userData.birthDate || null,
            discountCode: userData.discountCode || '',
            registrationDate: new Date().toISOString(),
            // ✅ CORREGIDO: userTypes está importado
            type: userData.discountCode === 'FELICES50' ? userTypes.PREMIUM : userTypes.REGULAR
        });

        setCurrentUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        return newUser;
    };

    // Logout
    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
    };

    // Actualizar usuario
    const updateProfile = async (profileData) => {
        if (!currentUser) {
            throw new Error('No hay usuario logueado');
        }

        const updatedUser = {
            ...currentUser,
            ...profileData,
            // Recalcular descuentos si se actualiza la fecha de nacimiento
            updatedAt: new Date().toISOString()
        };

        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        // Actualizar también en la base de datos de usuarios
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === updatedUser.id);
        if (userIndex !== -1) {
            users[userIndex] = updatedUser;
            localStorage.setItem('users', JSON.stringify(users));
        }

        return updatedUser;
    };

    const value = {
        currentUser,
        login,
        register,
        logout,
        updateUser: updateProfile, // ← MODIFICADO: ahora usa updateProfile
        updateProfile, // ← NUEVO: función específica para perfil
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};