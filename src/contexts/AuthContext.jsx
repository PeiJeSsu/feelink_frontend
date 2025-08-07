import { createContext, useEffect, useState, useMemo } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import PropTypes from "prop-types";
import { auth } from "../config/firebase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setInitializing(false);
        });

        return unsubscribe; 
    }, []);

    const logout = async () => {
        try {
            localStorage.removeItem('selectedPersonality');
            localStorage.removeItem('currentSessionId');
            await signOut(auth);
        } catch (error) {
            console.error("登出錯誤:", error);
            throw error;
        }
    };

    const value = useMemo(
        () => ({
            user,
            initializing,
            logout,
        }),
        [user, initializing]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
