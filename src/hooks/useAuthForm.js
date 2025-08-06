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

    // 同步用戶資料到後端
    const syncUserToBackend = async (firebaseUser) => {
        try {
            // 如果沒有 displayName，就使用 email 的 @ 前面部分作為 nickname
            let nickname = firebaseUser.displayName || "";
            if (!nickname && firebaseUser.email) {
                nickname = firebaseUser.email.split('@')[0];
            }
            
            const userData = {
                userId: firebaseUser.uid,  // 使用 Firebase UID 作為 userId
                email: firebaseUser.email,
                nickname: nickname,
                AINickname: "" // 預設為空，之後可以讓用戶設定
            };
            
            const response = await fetch('http://localhost:8080/api/users/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('同步用戶資料失敗');
            }

            const syncedUser = await response.json();
            console.log('用戶資料同步成功:', syncedUser);
        } catch (error) {
            console.error('同步用戶資料到後端失敗:', error);
            // 注意：這裡不拋出錯誤，因為同步失敗不應影響登入流程
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
            
            // 同步用戶資料到後端
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
            
            // 同步用戶資料到後端
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