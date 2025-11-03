import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../layout/Spinner';

const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  
  console.log('🛡️ AdminRoute - loading:', loading, 'currentUser:', currentUser, 'isAdmin:', isAdmin());
  
  if (loading) {
    console.log('🛡️ AdminRoute - Mostrando spinner');
    return <Spinner />;
  }
  
  if (!currentUser) {
    console.log('🛡️ AdminRoute - No hay usuario, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin()) {
    console.log('🛡️ AdminRoute - Usuario no es admin, redirigiendo a home');
    return <Navigate to="/" replace />;
  }
  
  console.log('🛡️ AdminRoute - Usuario es admin, renderizando children');
  return children;
};

export default AdminRoute;