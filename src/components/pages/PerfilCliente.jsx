// PerfilCliente.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";

const PerfilCliente = () => {
  const { currentUser } = useAuth();

  return (
    <div className="container mt-4">
      <h2>Perfil Cliente</h2>
      <p>Bienvenido, {currentUser?.nombre || "Cliente"}!</p>
    </div>
  );
};

export default PerfilCliente;