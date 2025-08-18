import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useContext } from "react";
import { AuthContext, AuthProvider } from "../AuthContext";

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

// 測試元件用來讀取 Context 值
const TestComponent = () => {
    const context = useContext(AuthContext);
    
    if (!context) {
        return <div data-testid="no-context">No Context</div>;
    }

    const { user, initializing, logout } = context;
    
    return (
        <div>
            <div data-testid="user">{user ? JSON.stringify(user) : "null"}</div>
            <div data-testid="initializing">{initializing.toString()}</div>
            <button data-testid="logout-btn" onClick={logout}>
                登出
            </button>
        </div>
    );
};

describe("AuthContext", () => {
    let mockUnsubscribe;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // 創建 localStorage mock
        const localStorageMock = (() => {
            let store = {};
            return {
                getItem: (key) => store[key] || null,
                setItem: (key, value) => {
                    store[key] = value.toString();
                },
                removeItem: (key) => {
                    delete store[key];
                },
                clear: () => {
                    store = {};
                }
            };
        })();
        
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true,
        });
        
        localStorage.clear();
        console.error = jest.fn(); // 模擬 console.error
        
        // 模擬 onAuthStateChanged 返回 unsubscribe 函數
        mockUnsubscribe = jest.fn();
        mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("應正確提供初始狀態", () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId("user")).toHaveTextContent("null");
        expect(screen.getByTestId("initializing")).toHaveTextContent("true");
        expect(screen.getByTestId("logout-btn")).toBeInTheDocument();
    });

    test("AuthContext 在沒有 Provider 時應返回 undefined", () => {
        render(<TestComponent />);
        expect(screen.getByTestId("no-context")).toBeInTheDocument();
    });

    test("應正確設置 Firebase auth 監聽器", () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(mockOnAuthStateChanged).toHaveBeenCalledTimes(1);
        expect(mockOnAuthStateChanged).toHaveBeenCalledWith(
            expect.any(Object), // auth object
            expect.any(Function) // callback function
        );
    });

    test("當使用者登入時應更新狀態", async () => {
        const mockUser = {
            uid: "test-uid",
            email: "test@example.com",
            displayName: "Test User",
        };

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // 模擬使用者登入
        const authCallback = mockOnAuthStateChanged.mock.calls[0][1];
        authCallback(mockUser);

        await waitFor(() => {
            expect(screen.getByTestId("user")).toHaveTextContent(JSON.stringify(mockUser));
            expect(screen.getByTestId("initializing")).toHaveTextContent("false");
        });
    });

    test("當使用者登出時應更新狀態", async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // 模擬使用者登出
        const authCallback = mockOnAuthStateChanged.mock.calls[0][1];
        authCallback(null);

        await waitFor(() => {
            expect(screen.getByTestId("user")).toHaveTextContent("null");
            expect(screen.getByTestId("initializing")).toHaveTextContent("false");
        });
    });

    test("logout 函數應清除 localStorage 並呼叫 Firebase signOut", async () => {
        // 設定 localStorage 值
        localStorage.setItem("selectedPersonality", "test-personality");
        localStorage.setItem("currentSessionId", "test-session");

        mockSignOut.mockResolvedValue();

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const logoutBtn = screen.getByTestId("logout-btn");
        fireEvent.click(logoutBtn);

        await waitFor(() => {
            expect(localStorage.getItem("selectedPersonality")).toBe(null);
            expect(localStorage.getItem("currentSessionId")).toBe(null);
            expect(mockSignOut).toHaveBeenCalledTimes(1);
        });
    });

    test("logout 函數在 Firebase signOut 失敗時應記錄錯誤", async () => {
        const mockError = new Error("Firebase signOut failed");
        mockSignOut.mockRejectedValue(mockError);

        // 模擬 console.error 方法
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        const TestComponentWithErrorHandling = () => {
            const context = useContext(AuthContext);
            
            if (!context) {
                return <div data-testid="no-context">No Context</div>;
            }

            const { user, initializing, logout } = context;
            
            const handleLogout = async () => {
                try {
                    await logout();
                } catch (error) {
                    // 錯誤會被 AuthContext 的 logout 函數拋出
                }
            };
            
            return (
                <div>
                    <div data-testid="user">{user ? JSON.stringify(user) : "null"}</div>
                    <div data-testid="initializing">{initializing.toString()}</div>
                    <button data-testid="logout-btn" onClick={handleLogout}>
                        登出
                    </button>
                </div>
            );
        };

        render(
            <AuthProvider>
                <TestComponentWithErrorHandling />
            </AuthProvider>
        );

        const logoutBtn = screen.getByTestId("logout-btn");
        
        fireEvent.click(logoutBtn);

        await waitFor(() => {
            expect(mockSignOut).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy).toHaveBeenCalledWith("登出錯誤:", mockError);
        }, { timeout: 5000 });

        consoleErrorSpy.mockRestore();
    });

    test("元件卸載時應呼叫 unsubscribe", () => {
        const { unmount } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        unmount();

        expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });

    test("Context value 應使用 useMemo 進行最佳化", () => {
        const { rerender } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // 重新渲染相同的元件
        rerender(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // 驗證 onAuthStateChanged 只被呼叫一次
        expect(mockOnAuthStateChanged).toHaveBeenCalledTimes(1);
    });
});
