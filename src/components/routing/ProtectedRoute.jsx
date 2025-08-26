import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import AppLoader from "../auth/AppLoader";
import PropTypes from "prop-types";

const ProtectedRoute = ({ children }) => {
    const { user, initializing } = useAuth();
    const location = useLocation();
    if (initializing) {
        return <AppLoader />;
    }

    if (!user) return <Navigate to="/login" replace />;

    const personality = localStorage.getItem("selectedPersonality");

    if (location.pathname === "/personality") return children;

    if (!personality) return <Navigate to="/personality" replace />;
    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ProtectedRoute;