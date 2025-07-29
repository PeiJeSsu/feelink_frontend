import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AppLoader from '../auth/AppLoader';
import PropTypes from 'prop-types';

const PublicRoute = ({ children }) => {
    const { user, initializing } = useAuth();
    
    if (initializing) {
        return <AppLoader />;
    }
    
    return user ? <Navigate to="/canvas" replace /> : children;
};

PublicRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default PublicRoute;
