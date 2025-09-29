import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import AppLoader from "../auth/AppLoader";
import PropTypes from "prop-types";

const ProtectedRoute = ({ children }) => {
    const { user, initializing, hasPersonality, checkingPersonality } = useAuth();
    const location = useLocation();

    if (initializing) {
        return <AppLoader />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (checkingPersonality) {
        return <AppLoader />;
    }

    if (location.pathname === "/personality") {
        return children;
    }

    if (!hasPersonality) {
        console.log('使用者未設定人格，跳轉到 /personality');
        return <Navigate to="/personality" replace />;
    }

    console.log('使用者已設定人格，允許訪問:', location.pathname);
    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ProtectedRoute;