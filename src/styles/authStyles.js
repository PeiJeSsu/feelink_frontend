// 主容器背景樣式
export const backgroundStyles = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #fefefe 0%, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%, #fefefe 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    p: 2,
    position: "relative",
    overflow: "hidden",
};

// 背景裝飾球體樣式
export const decorativeOrbs = [
    {
        position: "absolute",
        top: "-20%",
        right: "-20%",
        width: "40%",
        height: "40%",
        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.05))",
        borderRadius: "50%",
        filter: "blur(60px)",
        zIndex: 0,
    },
    {
        position: "absolute",
        bottom: "-20%",
        left: "-20%",
        width: "40%",
        height: "40%", 
        background: "linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(236, 72, 153, 0.05))",
        borderRadius: "50%",
        filter: "blur(60px)",
        zIndex: 0,
    },
    {
        position: "absolute",
        top: "25%",
        left: "25%",
        width: "20%",
        height: "20%",
        background: "linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(6, 182, 212, 0.08))",
        borderRadius: "50%",
        filter: "blur(40px)",
        zIndex: 0,
    }
];

// 主卡片樣式
export const cardStyles = {
    position: "relative",
    zIndex: 1,
    p: 6,
    maxWidth: 420,
    width: "100%",
    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "24px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1)",
};

// Logo 圖示樣式
export const logoIcons = [
    {
        width: 48,
        height: 48,
        background: "linear-gradient(135deg, #3b82f6, #6366f1)",
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
        transform: "rotate(-5deg)",
    },
    {
        width: 32,
        height: 32,
        background: "linear-gradient(135deg, #a855f7, #ec4899)",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 15px rgba(168, 85, 247, 0.3)",
        transform: "rotate(10deg)",
        alignSelf: "flex-end",
    },
    {
        width: 24,
        height: 24,
        background: "linear-gradient(135deg, #14b8a6, #06b6d4)",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 15px rgba(20, 184, 166, 0.3)",
        transform: "rotate(-10deg)",
        alignSelf: "center",
    }
];

// 標題樣式
export const titleStyles = {
    fontWeight: 700,
    color: "#1e293b",
    mb: 1,
    fontFamily: '"Noto Sans TC", sans-serif',
};

export const subtitleStyles = {
    color: "#64748b",
    fontFamily: '"Noto Sans TC", sans-serif',
};

// 錯誤訊息樣式
export const errorBoxStyles = {
    mb: 3,
    p: 2,
    bgcolor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: "12px",
};

export const errorTextStyles = {
    color: "#dc2626",
    fontSize: "14px",
};

// 輸入框樣式
export const inputFieldStyles = {
    "& .MuiOutlinedInput-root": {
        height: 48,
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(203, 213, 225, 0.6)",
        borderRadius: "12px",
        fontSize: "16px",
        fontFamily: '"Noto Sans TC", sans-serif',
        transition: "all 0.3s ease",
        "& fieldset": {
            border: "none",
        },
        "&:hover": {
            background: "rgba(255, 255, 255, 0.9)",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(148, 163, 184, 0.8)",
        },
        "&.Mui-focused": {
            background: "rgba(255, 255, 255, 0.9)",
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
            border: "1px solid #3b82f6",
        },
        // 為手動輸入添加內部間距
        "& input": {
            margin: "2px !important",
            padding: "0 12px !important",
            height: "calc(100% - 4px) !important",
            borderRadius: "10px !important",
            background: "rgba(255, 255, 255, 0.5) !important",
        },
        // 移除自動填充的黃色背景
        "& input:-webkit-autofill": {
            WebkitBoxShadow: "0 0 0px 500px rgba(255, 255, 255, 0.9) inset !important",
            boxShadow: "0 0 0px 500px rgba(255, 255, 255, 0.9) inset !important",
            WebkitTextFillColor: "#1e293b !important",
            borderRadius: "10px !important",
            margin: "2px !important",
            padding: "0 12px !important",
            height: "calc(100% - 4px) !important",
            width: "calc(100% - 4px) !important",
        },
        "& input:-webkit-autofill:hover": {
            WebkitBoxShadow: "0 0 0px 500px rgba(255, 255, 255, 0.9) inset !important",
            boxShadow: "0 0 0px 500px rgba(255, 255, 255, 0.9) inset !important",
            borderRadius: "10px !important",
            margin: "2px !important",
            padding: "0 12px !important",
            height: "calc(100% - 4px) !important",
            width: "calc(100% - 4px) !important",
        },
        "& input:-webkit-autofill:focus": {
            WebkitBoxShadow: "0 0 0px 500px rgba(255, 255, 255, 0.9) inset !important",
            boxShadow: "0 0 0px 500px rgba(255, 255, 255, 0.9) inset !important",
            borderRadius: "10px !important",
            margin: "2px !important",
            padding: "0 12px !important",
            height: "calc(100% - 4px) !important",
            width: "calc(100% - 4px) !important",
        },
    },
};

// 按鈕樣式變體
export const buttonStyles = {
    // 主要按鈕樣式
    primary: {
        height: 48,
        background: "linear-gradient(135deg, #3b82f6, #6366f1)",
        color: "white",
        fontWeight: 600,
        fontSize: "16px",
        fontFamily: '"Noto Sans TC", sans-serif',
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
        transition: "all 0.3s ease",
        "&:hover": {
            background: "linear-gradient(135deg, #2563eb, #4f46e5)",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 25px rgba(59, 130, 246, 0.5)",
        },
    },
    
    // 次要按鈕樣式
    secondary: {
        height: 48,
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        borderRadius: "12px",
        color: "#475569",
        fontWeight: 500,
        fontSize: "16px",
        fontFamily: '"Noto Sans TC", sans-serif',
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
        transition: "all 0.3s ease",
        "&:hover": {
            background: "rgba(255, 255, 255, 0.9)",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
        },
    },
    
    // 文字按鈕樣式
    text: {
        color: "#64748b",
        fontSize: "14px",
        fontFamily: '"Noto Sans TC", sans-serif',
        "&:hover": {
            color: "#475569",
            background: "transparent",
        },
    },
    
    // 連結按鈕樣式
    link: {
        color: "#3b82f6",
        fontWeight: 600,
        fontSize: "14px",
        fontFamily: '"Noto Sans TC", sans-serif',
        p: 0,
        minWidth: "auto",
        textTransform: "none",
        verticalAlign: "baseline",
        "&:hover": {
            color: "#2563eb",
            background: "transparent",
        },
    }
};

// 分隔線樣式
export const dividerStyles = {
    flex: 1,
    backgroundColor: "#e2e8f0",
};

// 登入模式標題樣式
export const modeHeaderStyles = {
    color: "#1e293b",
    fontWeight: 600,
    fontSize: "18px",
    fontFamily: '"Noto Sans TC", sans-serif',
    textAlign: "center",
    mb: 1,
};
