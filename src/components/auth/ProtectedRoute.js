import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../layout/Spinner';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  return currentUser ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;