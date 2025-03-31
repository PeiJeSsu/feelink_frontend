export const chatRoomStyles = {
    container: {
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    chatArea: {
        border: "1px solid rgba(148, 163, 184, 0.15)",
        borderRadius: "12px",
        padding: "16px",
        position: "relative",
        flex: 1,
        backgroundColor: "#FFFFFF",
        overflowY: "auto",
        transition: "all 0.3s ease",
        boxShadow: "0px 4px 6px -1px rgba(0, 0, 0, 0.05)",
        "&::-webkit-scrollbar": {
            width: "6px",
        },
        "&::-webkit-scrollbar-track": {
            background: "#EEF2FF",
            borderRadius: "3px",
        },
        "&::-webkit-scrollbar-thumb": {
            background: "#CBD5E1",
            borderRadius: "3px",
            "&:hover": {
                background: "#94A3B8",
            },
        },
    },
    messageContainer: {
        backgroundColor: "#F8FAFC",
        borderRadius: "10px",
        padding: "12px",
        marginBottom: "8px",
        boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
    },
    userMessage: {
        backgroundColor: "#EEF2FF",
        borderColor: "#E0E7FF",
    },
};

