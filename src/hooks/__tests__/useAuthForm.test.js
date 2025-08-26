import { renderHook, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useAuthForm } from "../useAuthForm";

// 模擬 Firebase Auth 方法
const mockSignInWithEmailAndPassword = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockSignInWithPopup = jest.fn();
const mockGoogleAuthProvider = jest.fn();

jest.mock("firebase/auth", () => ({
    signInWithEmailAndPassword: (...args) => mockSignInWithEmailAndPassword(...args),
    createUserWithEmailAndPassword: (...args) => mockCreateUserWithEmailAndPassword(...args),
    signInWithPopup: (...args) => mockSignInWithPopup(...args),
    GoogleAuthProvider: jest.fn().mockImplementation(() => mockGoogleAuthProvider),
}));

// 模擬 Firebase 配置
jest.mock("../../config/firebase", () => ({
    auth: {
        currentUser: null,
    },
}));

describe("useAuthForm", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        console.error = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("應正確初始化狀態", () => {
        const { result } = renderHook(() => useAuthForm());

        expect(result.current.email).toBe("");
        expect(result.current.password).toBe("");
        expect(result.current.showPassword).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe("");
    });

    test("應正確更新 email 狀態", () => {
        const { result } = renderHook(() => useAuthForm());

        act(() => {
            result.current.setEmail("test@example.com");
        });

        expect(result.current.email).toBe("test@example.com");
    });

    test("應正確更新 password 狀態", () => {
        const { result } = renderHook(() => useAuthForm());

        act(() => {
            result.current.setPassword("testpassword");
        });

        expect(result.current.password).toBe("testpassword");
    });

    test("應正確切換密碼顯示狀態", () => {
        const { result } = renderHook(() => useAuthForm());

        expect(result.current.showPassword).toBe(false);

        act(() => {
            result.current.togglePasswordVisibility();
        });

        expect(result.current.showPassword).toBe(true);

        act(() => {
            result.current.togglePasswordVisibility();
        });

        expect(result.current.showPassword).toBe(false);
    });

    test("resetForm 應重置所有狀態", () => {
        const { result } = renderHook(() => useAuthForm());

        act(() => {
            result.current.setEmail("test@example.com");
            result.current.setPassword("testpassword");
            result.current.togglePasswordVisibility();
        });

        expect(result.current.email).toBe("test@example.com");
        expect(result.current.password).toBe("testpassword");
        expect(result.current.showPassword).toBe(true);

        act(() => {
            result.current.resetForm();
        });

        expect(result.current.email).toBe("");
        expect(result.current.password).toBe("");
        expect(result.current.showPassword).toBe(false);
        expect(result.current.error).toBe("");
    });

    describe("handleEmailAuth - 登入模式", () => {
        test("應在空欄位時顯示錯誤", async () => {
            const { result } = renderHook(() => useAuthForm(false));

            await act(async () => {
                await result.current.handleEmailAuth();
            });

            expect(result.current.error).toBe("請填寫所有欄位");
            expect(mockSignInWithEmailAndPassword).not.toHaveBeenCalled();
        });

        test("應成功登入並重置表單", async () => {
            const { result } = renderHook(() => useAuthForm(false));
            mockSignInWithEmailAndPassword.mockResolvedValue({});

            act(() => {
                result.current.setEmail("test@example.com");
                result.current.setPassword("testpassword");
            });

            await act(async () => {
                await result.current.handleEmailAuth();
            });

            expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
                expect.any(Object),
                "test@example.com",
                "testpassword"
            );
            expect(result.current.email).toBe("");
            expect(result.current.password).toBe("");
            expect(result.current.error).toBe("");
        });

        test("應正確處理無效憑證錯誤", async () => {
            const { result } = renderHook(() => useAuthForm(false));
            const error = { code: "auth/invalid-credential" };
            mockSignInWithEmailAndPassword.mockRejectedValue(error);

            act(() => {
                result.current.setEmail("test@example.com");
                result.current.setPassword("wrongpassword");
            });

            await act(async () => {
                await result.current.handleEmailAuth();
            });

            expect(result.current.error).toBe("登入失敗，請檢查您的電子郵件和密碼");
            expect(result.current.isLoading).toBe(false);
        });

        test("應正確處理無效電子郵件錯誤", async () => {
            const { result } = renderHook(() => useAuthForm(false));
            const error = { code: "auth/invalid-email" };
            mockSignInWithEmailAndPassword.mockRejectedValue(error);

            act(() => {
                result.current.setEmail("invalid-email");
                result.current.setPassword("testpassword");
            });

            await act(async () => {
                await result.current.handleEmailAuth();
            });

            expect(result.current.error).toBe("電子郵件格式不正確");
        });

        test("應正確處理一般錯誤", async () => {
            const { result } = renderHook(() => useAuthForm(false));
            const error = { code: "auth/unknown-error" };
            mockSignInWithEmailAndPassword.mockRejectedValue(error);

            act(() => {
                result.current.setEmail("test@example.com");
                result.current.setPassword("testpassword");
            });

            await act(async () => {
                await result.current.handleEmailAuth();
            });

            expect(result.current.error).toBe("登入失敗，請稍後再試");
        });
    });

    describe("handleEmailAuth - 註冊模式", () => {
        test("應成功註冊新使用者", async () => {
            const { result } = renderHook(() => useAuthForm(true));
            mockCreateUserWithEmailAndPassword.mockResolvedValue({});

            act(() => {
                result.current.setEmail("newuser@example.com");
                result.current.setPassword("newpassword");
            });

            await act(async () => {
                await result.current.handleEmailAuth();
            });

            expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
                expect.any(Object),
                "newuser@example.com",
                "newpassword"
            );
            expect(result.current.email).toBe("");
            expect(result.current.password).toBe("");
            expect(result.current.error).toBe("");
        });

        test("應正確處理電子郵件已被使用錯誤", async () => {
            const { result } = renderHook(() => useAuthForm(true));
            const error = { code: "auth/email-already-in-use" };
            mockCreateUserWithEmailAndPassword.mockRejectedValue(error);

            act(() => {
                result.current.setEmail("existing@example.com");
                result.current.setPassword("testpassword");
            });

            await act(async () => {
                await result.current.handleEmailAuth();
            });

            expect(result.current.error).toBe("此電子郵件已被註冊");
        });

        test("應正確處理弱密碼錯誤", async () => {
            const { result } = renderHook(() => useAuthForm(true));
            const error = { code: "auth/weak-password" };
            mockCreateUserWithEmailAndPassword.mockRejectedValue(error);

            act(() => {
                result.current.setEmail("test@example.com");
                result.current.setPassword("123");
            });

            await act(async () => {
                await result.current.handleEmailAuth();
            });

            expect(result.current.error).toBe("密碼強度不足，請使用至少 6 個字符");
        });
    });

    describe("handleGoogleAuth", () => {
        test("應成功執行 Google 登入", async () => {
            const { result } = renderHook(() => useAuthForm());
            mockSignInWithPopup.mockResolvedValue({});

            await act(async () => {
                await result.current.handleGoogleAuth();
            });

            expect(mockSignInWithPopup).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object)
            );
            expect(result.current.error).toBe("");
            expect(result.current.isLoading).toBe(false);
        });

        test("應正確處理使用者關閉彈出視窗", async () => {
            const { result } = renderHook(() => useAuthForm());
            const error = { code: "auth/popup-closed-by-user" };
            mockSignInWithPopup.mockRejectedValue(error);

            await act(async () => {
                await result.current.handleGoogleAuth();
            });

            expect(result.current.error).toBe("登入視窗已關閉");
            expect(result.current.isLoading).toBe(false);
        });

        test("應正確處理 Google 登入一般錯誤", async () => {
            const { result } = renderHook(() => useAuthForm());
            const error = { code: "auth/unknown-error" };
            mockSignInWithPopup.mockRejectedValue(error);

            await act(async () => {
                await result.current.handleGoogleAuth();
            });

            expect(result.current.error).toBe("Google 登入失敗，請稍後再試");
            expect(result.current.isLoading).toBe(false);
        });
    });

    describe("載入狀態", () => {
        test("handleEmailAuth 執行時應正確設定載入狀態", async () => {
            const { result } = renderHook(() => useAuthForm());
            let resolvePromise;
            const promise = new Promise(resolve => {
                resolvePromise = resolve;
            });
            mockSignInWithEmailAndPassword.mockReturnValue(promise);

            act(() => {
                result.current.setEmail("test@example.com");
                result.current.setPassword("testpassword");
            });

            // 開始執行
            act(() => {
                result.current.handleEmailAuth();
            });

            expect(result.current.isLoading).toBe(true);

            // 完成執行
            await act(async () => {
                resolvePromise();
                await promise;
            });

            expect(result.current.isLoading).toBe(false);
        });

        test("handleGoogleAuth 執行時應正確設定載入狀態", async () => {
            const { result } = renderHook(() => useAuthForm());
            let resolvePromise;
            const promise = new Promise(resolve => {
                resolvePromise = resolve;
            });
            mockSignInWithPopup.mockReturnValue(promise);

            // 開始執行
            act(() => {
                result.current.handleGoogleAuth();
            });

            expect(result.current.isLoading).toBe(true);

            // 完成執行
            await act(async () => {
                resolvePromise();
                await promise;
            });

            expect(result.current.isLoading).toBe(false);
        });
    });
});
