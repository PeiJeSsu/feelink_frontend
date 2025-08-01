export const chatRoomStyles = {
    container: {
        position: "relative",
        width: "100%",
        height: "100%",
        maxHeight: "calc(100vh - 16px)",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    header: {
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0",
    },
    chatArea: {
        border: "1px solid rgba(92, 92, 92, 0.15)",
        borderRadius: "12px",
        padding: "16px",
        position: "relative",
        flex: 1,
        backgroundColor: "#fffff3",
        overflowY: "auto",
        transition: "all 0.3s ease",
        boxShadow: "0px 4px 6px -1px rgba(0, 0, 0, 0.05)",
        "&::-webkit-scrollbar": {
            width: "6px",
        },
        "&::-webkit-scrollbar-track": {
            background: "#f5f5e9",
            borderRadius: "3px",
        },
        "&::-webkit-scrollbar-thumb": {
            background: "#ccccc0",
            borderRadius: "3px",
            "&:hover": {
                background: "#5c5c5c",
            },
        },
    },
    messageContainer: {
        backgroundColor: "#f5f5e9",
        borderRadius: "10px",
        padding: "12px",
        marginBottom: "8px",
        boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
    },
    userMessage: {
        backgroundColor: "#f7cac9",
        borderColor: "#e5b8b7",
    },
    messageLoading:{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '10px'
    }
};

