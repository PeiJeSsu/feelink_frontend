import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AppLoader from '../auth/AppLoader';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children }) => {
    const { user, initializing } = useAuth();
    
    if (initializing) {
        return <AppLoader />;
    }
    
    return user ? children : <Navigate to="/login" replace />;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
