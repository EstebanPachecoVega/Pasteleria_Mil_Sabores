import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  addUser,
  findUserByEmail,
  findUserById,
  updateUser
} from '../services/firestoreService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al iniciar la app desde localStorage
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("currentUser");
    if (usuarioGuardado) {
      const userData = JSON.parse(usuarioGuardado);
      if (userData.id) {
        findUserById(userData.id)
          .then(updatedUser => {
            if (updatedUser) {
              setCurrentUser(updatedUser);
              localStorage.setItem("currentUser", JSON.stringify(updatedUser));
            } else {
              setCurrentUser(userData);
            }
          })
          .catch(() => {
            setCurrentUser(userData);
          });
      } else {
        setCurrentUser(userData);
      }
    }
    setLoading(false);
  }, []);

  // Función para login
  const login = async (email, password) => {
    try {
      // Buscar usuario en Firebase
      const user = await findUserByEmail(email);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña
      if (user.password !== password) {
        throw new Error('Contraseña incorrecta');
      }

      // Usuario con rol seguro
      const appUser = {
        id: user.id,
        name: user.name,
        rol: user.rol || 'cliente',
        email: user.email,
        password: user.password,
        birthDate: user.birthDate,
        primerNombre: user.primerNombre,
        segundoNombre: user.segundoNombre,
        primerApellido: user.primerApellido,
        segundoApellido: user.segundoApellido,
        discountCode: user.discountCode || '',
        run: user.run,
        telefono: user.telefono || '',
        region: user.region || '',
        comuna: user.comuna || '',
        nombreCalle: user.nombreCalle || '',
        numeroCalle: user.numeroCalle || '',
        tipoVivienda: user.tipoVivienda || '',
        codigoPostal: user.codigoPostal || '',
        direccionCompleta: user.direccionCompleta || ''
      };

      setCurrentUser(appUser);
      localStorage.setItem("currentUser", JSON.stringify(appUser));
      return appUser;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  // Función para registro
  const register = async (userData) => {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await findUserByEmail(userData.email);

      if (existingUser) {
        throw new Error('El email ya está registrado');
      }

      // Datos para Firebase con rol seguro
      const firebaseUserData = {
        // Datos personales
        run: userData.run,
        name: userData.name,
        rol: 'cliente',
        email: userData.email,
        password: userData.password,
        birthDate: userData.birthDate,

        // Nombres separados
        primerNombre: userData.primerNombre,
        segundoNombre: userData.segundoNombre,
        primerApellido: userData.primerApellido,
        segundoApellido: userData.segundoApellido,

        // Contacto y ubicación
        telefono: userData.telefono || '',
        discountCode: userData.discountCode || '',
        region: userData.region || '',
        comuna: userData.comuna || '',
        nombreCalle: userData.nombreCalle || '',
        numeroCalle: userData.numeroCalle || '',
        tipoVivienda: userData.tipoVivienda || '',
        codigoPostal: userData.codigoPostal || '',
        direccionCompleta: userData.direccionCompleta || '',

        // Metadatos
        createdAt: new Date(),
      };

      // Guardar en Firebase
      const newUser = await addUser(firebaseUserData);

      // Usuario para la app
      const appUser = {
        id: newUser.id,
        ...userData,
        rol: 'cliente'
      };

      setCurrentUser(appUser);
      localStorage.setItem("currentUser", JSON.stringify(appUser));
      return appUser;

    } catch (error) {
      throw new Error(error.message);
    }
  };

  // Función para actualizar perfil
  const updateProfile = async (profileData) => {
    if (!currentUser) {
      throw new Error('No hay usuario logueado');
    }

    try {
      console.log('🔄 AuthContext - Actualizando perfil con:', profileData);
      // Actualizar en Firebase
      const updateData = {
        ...profileData,
        updatedAt: new Date()
      };

      await updateUser(currentUser.id, updateData);

      // Actualizar en el estado local
      const newUserData = {
        ...currentUser,
        ...profileData
      };

      setCurrentUser(newUserData);
      localStorage.setItem("currentUser", JSON.stringify(newUserData));
      console.log('✅ AuthContext - Perfil actualizado exitosamente');
      return newUserData;

    } catch (error) {
      throw new Error('Error al actualizar perfil: ' + error.message);
    }
  };

  // Función para logout
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  // Funciones helper para roles
  const isAdmin = () => {
    return currentUser?.rol === 'admin';
  };

  const isClient = () => {
    return currentUser?.rol === 'cliente';
  };

  const hasRole = (role) => {
    return currentUser?.rol === role;
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    updateProfile,
    isAdmin,
    isClient,
    hasRole,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}