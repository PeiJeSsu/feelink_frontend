import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserProfileMenu from "../UserProfileMenu";
import { AuthProvider } from "../../../contexts/AuthContext";

// 模擬 useAuth Hook
const mockLogout = jest.fn();
const mockUseAuth = jest.fn();

jest.mock("../../../hooks/useAuth", () => ({
    useAuth: () => mockUseAuth(),
}));

// 模擬 useHandleDirtyButtonClick Hook
// 此 Hook 會回傳一個函式,該函式接收一個 target 參數
// 當 target 是函式時,直接執行它
jest.mock("../../SaveCanvas/useHandleDirtyButtonClick", () => ({
    useHandleDirtyButtonClick: () => (target) => {
        if (typeof target === 'function') {
            target();
        }
    },
}));

// 模擬 Firebase Auth
const mockOnAuthStateChanged = jest.fn();
const mockSignOut = jest.fn();

jest.mock("firebase/auth", () => ({
    onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
    signOut: (...args) => mockSignOut(...args),
}));

// 模擬 Firebase 配置
jest.mock("../../../config/firebase", () => ({
    auth: {
        currentUser: null,
    },
}));

// 模擬 MUI 的 ThemeProvider
jest.mock("@mui/material/styles", () => ({
    ...jest.requireActual("@mui/material/styles"),
    useTheme: () => ({
        palette: {
            primary: { main: "#1976d2" },
            secondary: { main: "#dc004e" },
        },
    }),
}));

describe("UserProfileMenu", () => {
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

        // 清理 localStorage
        localStorage.clear();
        console.error = jest.fn();
        
        // 模擬 onAuthStateChanged 返回 unsubscribe 函數
        mockUnsubscribe = jest.fn();
        mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe);

        // 設定預設的 useAuth 回傳值
        mockUseAuth.mockReturnValue({
            user: {
                uid: "test-uid",
                email: "test@example.com",
                displayName: "Test User",
                photoURL: null,
            },
            logout: mockLogout,
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const renderWithAuthProvider = (ui) => {
        return render(
            <AuthProvider>
                {ui}
            </AuthProvider>
        );
    };

    test("應正確渲染使用者頭像按鈕", () => {
        renderWithAuthProvider(<UserProfileMenu />);

        const avatarButton = screen.getByRole("button");
        expect(avatarButton).toBeInTheDocument();
    });

    test("應在沒有頭像時顯示預設圖示", () => {
        renderWithAuthProvider(<UserProfileMenu />);

        const defaultIcon = document.querySelector('[data-testid="AccountCircleIcon"]');
        // 如果沒有 testid，檢查是否有 svg 元素
        if (!defaultIcon) {
            const svgElement = document.querySelector('svg');
            expect(svgElement).toBeInTheDocument();
        } else {
            expect(defaultIcon).toBeInTheDocument();
        }
    });

    test("應在有頭像 URL 時顯示頭像圖片", () => {
        mockUseAuth.mockReturnValue({
            user: {
                uid: "test-uid",
                email: "test@example.com",
                displayName: "Test User",
                photoURL: "https://example.com/avatar.jpg",
            },
            logout: mockLogout,
        });

        renderWithAuthProvider(<UserProfileMenu />);

        const avatar = screen.getByRole("img");
        expect(avatar).toHaveAttribute("src", "https://example.com/avatar.jpg");
    });

    test("應在點擊頭像時開啟選單", () => {
        renderWithAuthProvider(<UserProfileMenu />);

        const avatarButton = screen.getByRole("button");
        fireEvent.click(avatarButton);

        expect(screen.getByText("Test User")).toBeInTheDocument();
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
        expect(screen.getByText("個人設定")).toBeInTheDocument();
        expect(screen.getByText("登出")).toBeInTheDocument();
    });

    test("應在點擊外部時關閉選單", async () => {
        renderWithAuthProvider(<UserProfileMenu />);

        const avatarButton = screen.getByRole("button");
        fireEvent.click(avatarButton);

        expect(screen.getByText("個人設定")).toBeInTheDocument();

        // 模擬點擊外部 (backdrop)
        const backdrop = document.querySelector('.MuiBackdrop-root');
        if (backdrop) {
            fireEvent.click(backdrop);
        }

        await waitFor(() => {
            expect(screen.queryByText("個人設定")).not.toBeInTheDocument();
        }, { timeout: 3000 });
    });

    test("應在點擊登出時呼叫 logout 函數", async () => {
        mockLogout.mockResolvedValue();

        renderWithAuthProvider(<UserProfileMenu />);

        const avatarButton = screen.getByRole("button");
        fireEvent.click(avatarButton);

        const logoutButton = screen.getByText("登出");
        fireEvent.click(logoutButton);

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalledTimes(1);
        });
    });

    test("應處理登出失敗的情況", async () => {
        const mockError = new Error("Logout failed");
        mockLogout.mockRejectedValue(mockError);

        renderWithAuthProvider(<UserProfileMenu />);

        const avatarButton = screen.getByRole("button");
        fireEvent.click(avatarButton);

        const logoutButton = screen.getByText("登出");
        fireEvent.click(logoutButton);

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalledWith("登出失敗:", mockError);
        });
    });

    test("應顯示 localStorage 中的暱稱", () => {
        localStorage.getItem.mockReturnValue("我的暱稱");

        renderWithAuthProvider(<UserProfileMenu />);

        const avatarButton = screen.getByRole("button");
        fireEvent.click(avatarButton);

        expect(screen.getByText("我的暱稱")).toBeInTheDocument();
    });

    test("應在沒有暱稱時顯示 Firebase displayName", () => {
        localStorage.getItem.mockReturnValue(null);

        renderWithAuthProvider(<UserProfileMenu />);

        const avatarButton = screen.getByRole("button");
        fireEvent.click(avatarButton);

        expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    test("應在沒有暱稱和 displayName 時顯示預設名稱", () => {
        localStorage.getItem.mockReturnValue(null);
        mockUseAuth.mockReturnValue({
            user: {
                uid: "test-uid",
                email: "test@example.com",
                displayName: null,
                photoURL: null,
            },
            logout: mockLogout,
        });

        renderWithAuthProvider(<UserProfileMenu />);

        const avatarButton = screen.getByRole("button");
        fireEvent.click(avatarButton);

        expect(screen.getByText("使用者")).toBeInTheDocument();
    });

    test("應監聽 localStorage 變化事件", () => {
        const addEventListener = jest.spyOn(window, 'addEventListener');

        renderWithAuthProvider(<UserProfileMenu />);

        expect(addEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
        expect(addEventListener).toHaveBeenCalledWith('nicknameUpdated', expect.any(Function));
    });

    test("應在元件卸載時移除事件監聽器", () => {
        const removeEventListener = jest.spyOn(window, 'removeEventListener');

        const { unmount } = renderWithAuthProvider(<UserProfileMenu />);
        unmount();

        expect(removeEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
        expect(removeEventListener).toHaveBeenCalledWith('nicknameUpdated', expect.any(Function));
    });

    test("應在點擊個人設定時關閉選單", async () => {
        renderWithAuthProvider(<UserProfileMenu />);

        const avatarButton = screen.getByRole("button");
        fireEvent.click(avatarButton);

        expect(screen.getByText("個人設定")).toBeInTheDocument();

        const profileButton = screen.getByText("個人設定");
        fireEvent.click(profileButton);

        await waitFor(() => {
            expect(screen.queryByText("個人設定")).not.toBeInTheDocument();
        }, { timeout: 3000 });
    });

    test("選單應有正確的樣式和結構", () => {
        renderWithAuthProvider(<UserProfileMenu />);

        const avatarButton = screen.getByRole("button");
        fireEvent.click(avatarButton);

        // 檢查選單項目是否存在
        expect(screen.getByText("個人設定")).toBeInTheDocument();
        expect(screen.getByText("登出")).toBeInTheDocument();

        // 檢查使用者資訊
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    test("應正確處理空的使用者物件", () => {
        mockUseAuth.mockReturnValue({
            user: null,
            logout: mockLogout,
        });

        renderWithAuthProvider(<UserProfileMenu />);

        const avatarButton = screen.getByRole("button");
        fireEvent.click(avatarButton);

        expect(screen.getByText("使用者")).toBeInTheDocument();
        expect(screen.queryByText("@")).not.toBeInTheDocument();
    });
});
