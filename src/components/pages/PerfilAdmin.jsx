// PerfilAdmin.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";

const PerfilAdmin = () => {
  const { currentUser } = useAuth();

  return (
    <div className="container mt-4">
      <h2>Perfil Administrador</h2>
      <p>Bienvenido, {currentUser?.nombre || "Administrador"}!</p>
    </div>
  );
};

export default PerfilAdmin;