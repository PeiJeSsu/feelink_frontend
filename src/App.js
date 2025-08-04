import CssBaseline from "@mui/material/CssBaseline";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import PublicRoute from "./components/routing/PublicRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CanvasPage from "./pages/CanvasPage";
import PersonalitySelectPage from "./pages/PersonalitySelectPage";

function App() {
    return (
        <div>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <LoginPage />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <PublicRoute>
                                    <RegisterPage />
                                </PublicRoute>
                            }
                        />
                        <Route path="/personality"
                            element={
                            <ProtectedRoute>
                                <PersonalitySelectPage />
                            </ProtectedRoute>
                        } />
                        <Route
                            path="/canvas"
                            element={
                                <ProtectedRoute>
                                    <CanvasPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/"
                            element={<Navigate to="/personality" replace />}
                        />
                        <Route
                            path="*"
                            element={<Navigate to="/login" replace />}
                        />
                    </Routes>
                </Router>
            </AuthProvider>
        </div>
    );
}

export default App;
