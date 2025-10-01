import { useState } from "react";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { apiConfig } from "../ChatRoom/config/ApiConfig";

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

    const syncUserToBackend = async (firebaseUser) => {
        try {
            // 先檢查使用者是否已存在
            let existingUser = null;
            try {
                const response = await apiConfig.get(`/api/users/email/${encodeURIComponent(firebaseUser.email)}`);
                existingUser = response.data;
                console.log('找到現有使用者資料:', existingUser);
                
                if (existingUser.preferredAIPartner && existingUser.preferredAIPartner.trim() !== "") {
                    console.log('使用者已設定 AI 夥伴:', existingUser.preferredAIPartner);
                } else {
                    console.log('使用者尚未設定 AI 夥伴');
                }
            } catch (error) {
                if (error.response?.status === 404) {
                    console.log('使用者不存在，將創建新使用者');
                } else {
                    throw error;
                }
            }

            // 如果使用者已存在，就不要覆蓋資料
            if (existingUser) {
                console.log('使用者已存在，跳過同步以保留現有資料');
                return existingUser;
            }

            // 只有新使用者才創建資料
            let nickname = firebaseUser.displayName || "";
            if (!nickname && firebaseUser.email) {
                nickname = firebaseUser.email.split('@')[0];
            }
            
            const userData = {
                userId: firebaseUser.uid,
                email: firebaseUser.email,
                nickname: nickname,
                AINickname: "" 
            };
            
            console.log('創建新使用者資料:', userData);
            const response = await apiConfig.post('/api/users/sync', userData);
            const syncedUser = response.data;
            console.log('新使用者資料創建成功:', syncedUser);
            return syncedUser;

        } catch (error) {
            console.error('同步使用者資料到後端失敗:', error);
        }
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
            let userCredential;
            
            if (isRegistering) {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            }
            
            await syncUserToBackend(userCredential.user);
            
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
            const userCredential = await signInWithPopup(auth, provider);
            
            await syncUserToBackend(userCredential.user);
            
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