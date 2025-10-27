import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../layout/Spinner';

const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <Spinner />;
  }
  
  return currentUser && isAdmin() ? children : <Navigate to="/" replace />;
};

export default AdminRoute;