export const chatRoomStyles = {
    container: {
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        boxShadow: "none",
        minWidth: 0, // 確保可以縮小
        overflow: "hidden", // 防止內容溢出
    },
    header: {
        padding: "16px 20px 12px 20px",
        borderBottom: "1px solid #aeb8d5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerTitle: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },
    chatArea: {
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        backgroundColor: "#ffffff",
        "&::-webkit-scrollbar": {
            width: "6px",
        },
        "&::-webkit-scrollbar-track": {
            background: "#f8fafc",
            borderRadius: "3px",
        },
        "&::-webkit-scrollbar-thumb": {
            background: "#d1d5db",
            borderRadius: "3px",
            "&:hover": {
                background: "#9ca3af",
            },
        },
    },
    inputArea: {
        padding: "16px",
        borderTop: "1px solid #00000056",
        backgroundColor: "#ffffff",
        flexShrink: 0, // 確保輸入區域不被壓縮
        minWidth: 0, // 確保可以縮小
    },
    quickActions: {
        display: "flex",
        gap: "8px",
        marginTop: "12px",
    },
    messageLoading: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '16px',
        gap: '12px',
    },
    loadingText: {
        color: "#64748b",
        fontSize: "14px",
    },
    closeButton: {
        color: "#64748b",
        width: 32,
        height: 32,
        "&:hover": {
            backgroundColor: "#f1f5f9",
            color: "#2563eb",
        },
    },
    titleIcon: {
        color: "#2563eb",
        fontSize: 20,
    },
    titleText: {
        color: "#1e293b",
        fontWeight: 600,
        fontSize: "16px",
        fontFamily: '"Inter", "Noto Sans TC", sans-serif',
    },
    betaChip: {
        backgroundColor: "#dbeafe",
        color: "#1d4ed8",
        fontSize: "11px",
        fontWeight: 600,
    }
};

