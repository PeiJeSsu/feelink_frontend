export const chatMessageStyles = {
    container: (isUser) => ({
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 1,
        width: '100%'
    }),
    messageBox: {
        maxWidth: '70%'
    },
    paper: (isUser) => ({
        padding: '8px 12px',
        bgcolor: isUser ? "#f7cac9" : "#f5f5e9",
        borderRadius: '12px',
        borderTopRightRadius: isUser ? 0 : '12px',
        borderTopLeftRadius: isUser ? '12px' : 0,
        overflow: 'hidden'
    }),
    text: {
        fontSize: "10px",
        textAlign: "left",
        display: "inline-block",
        color: "#333333"
    },
    image: {
        width: '100%',
        borderRadius: '4px',
        display: 'block'
    }
};