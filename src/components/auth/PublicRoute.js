import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../layout/Spinner';

const PublicRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <Spinner />;
    }

    return currentUser ? <Navigate to="/" replace /> : children;
};

export default PublicRoute;