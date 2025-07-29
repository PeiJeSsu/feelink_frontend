import { useState } from "react";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../config/firebase";

export const useAuthForm = (isRegistering = false) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // 重置表單
    const resetForm = () => {
        setEmail("");
        setPassword("");
        setShowPassword(false);
        setError("");
    };

    // 切換顯示/隱藏密碼
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // 電子郵件登入/註冊
    const handleEmailAuth = async () => {
        if (!email || !password) {
            setError("請填寫所有欄位");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            if (isRegistering) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            resetForm();
        } catch (error) {
            console.error("認證錯誤:", error);

            switch (error.code) {
                case "auth/invalid-credential":
                    setError("登入失敗，請檢查您的電子郵件和密碼");
                    break;
                case "auth/email-already-in-use":
                    setError("此電子郵件已被註冊");
                    break;
                case "auth/invalid-email":
                    setError("電子郵件格式不正確");
                    break;
                case "auth/weak-password":
                    setError("密碼強度不足，請使用至少 6 個字符");
                    break;
                default:
                    setError("登入失敗，請稍後再試");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Google 登入
    const handleGoogleAuth = async () => {
        setIsLoading(true);
        setError("");

        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            resetForm();
        } catch (error) {
            console.error("Google 登入錯誤:", error);

            switch (error.code) {
                case "auth/popup-closed-by-user":
                    setError("登入視窗已關閉");
                    break;
                default:
                    setError("Google 登入失敗，請稍後再試");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
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
        resetForm,
    };
};
