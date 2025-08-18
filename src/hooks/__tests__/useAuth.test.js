import { renderHook } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useAuth } from "../useAuth";
import { AuthProvider } from "../../contexts/AuthContext";

// 模擬 Firebase Auth
const mockOnAuthStateChanged = jest.fn();
const mockSignOut = jest.fn();

jest.mock("firebase/auth", () => ({
    onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
    signOut: (...args) => mockSignOut(...args),
}));

// 模擬 Firebase 配置
jest.mock("../../config/firebase", () => ({
    auth: {
        currentUser: null,
    },
}));

describe("useAuth", () => {
    let mockUnsubscribe;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // 模擬 localStorage
        const localStorageMock = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
        };
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true,
        });
        
        localStorage.clear();
        console.error = jest.fn();
        
        // 模擬 onAuthStateChanged 返回 unsubscribe 函數
        mockUnsubscribe = jest.fn();
        mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("應在有 AuthProvider 時正常返回 context", () => {
        const wrapper = ({ children }) => (
            <AuthProvider>{children}</AuthProvider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        expect(result.current).toBeDefined();
        expect(result.current).toHaveProperty("user");
        expect(result.current).toHaveProperty("initializing");
        expect(result.current).toHaveProperty("logout");
        expect(typeof result.current.logout).toBe("function");
    });

    test("應在沒有 AuthProvider 時拋出錯誤", () => {
        // 模擬 console.error 避免錯誤訊息影響測試輸出
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => {
            renderHook(() => useAuth());
        }).toThrow("useAuth must be used within an AuthProvider");

        consoleErrorSpy.mockRestore();
    });

    test("應正確提供 AuthContext 的所有屬性", () => {
        const wrapper = ({ children }) => (
            <AuthProvider>{children}</AuthProvider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });
        const authContext = result.current;

        // 驗證 context 包含所有必要的屬性
        expect(authContext).toHaveProperty("user");
        expect(authContext).toHaveProperty("initializing");
        expect(authContext).toHaveProperty("logout");

        // 驗證初始狀態
        expect(authContext.user).toBeNull();
        expect(authContext.initializing).toBe(true);
    });
});
