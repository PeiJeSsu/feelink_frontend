import AuthForm from '../components/auth/AuthForm';
import { useAuthForm } from "../hooks/useAuthForm";

const RegisterPage = () => {
    const {
        email,
        password,
        showPassword,
        isLoading,
        error,
        setEmail,
        setPassword,
        togglePasswordVisibility,
        handleEmailAuth,
        handleGoogleAuth,
    } = useAuthForm(true); 

    return (
        <AuthForm
            isLogin={false}
            email={email}
            password={password}
            showPassword={showPassword}
            isLoading={isLoading}
            error={error}
            onEmailChange={(e) => setEmail(e.target.value)}
            onPasswordChange={(e) => setPassword(e.target.value)}
            onTogglePassword={togglePasswordVisibility}
            onEmailAuth={handleEmailAuth}
            onGoogleAuth={handleGoogleAuth}
        />
    );
};

export default RegisterPage;
