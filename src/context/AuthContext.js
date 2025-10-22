// context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay usuario en localStorage al cargar la app
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      setCurrentUser(JSON.parse(usuarioGuardado));
    }
    setLoading(false);
  }, []);

  // Función para login (sin useNavigate aquí)
  const login = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem("usuario", JSON.stringify(userData));
    // NO redirigir aquí - se hará en el componente Login
  };

  // Función para logout (sin useNavigate aquí)
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("usuario");
    // NO redirigir aquí - se hará en el componente que llame logout
  };

  const value = {
    currentUser,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}