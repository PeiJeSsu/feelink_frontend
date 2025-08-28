export const chatMessageStyles = {
    container: (isUser) => ({
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        mb: 2,
        width: '100%',
        ...(isUser && { flexDirection: 'row-reverse' }),
    }),
    messageBox: {
        maxWidth: '75%',
    },
    avatar: {
        width: 32,
        height: 32,
        backgroundColor: "#f1f5f9",
        fontSize: "16px",
    },
    paper: (isUser) => ({
        padding: '16px',
        backgroundColor: isUser ? "#2563eb" : "#f8fafc",
        color: isUser ? "#ffffff" : "#374151",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        border: isUser ? "none" : "1px solid #e5e7eb",
        boxShadow: "none",
    }),
    text: {
        fontSize: '14px',
        lineHeight: 1.5,
        whiteSpace: 'pre-line',
    },
    timeStamp: {
        color: "#9ca3af",
        marginTop: 0.5,
        display: "block",
        fontSize: "11px",
    },
    image: {
        width: '100%',
        borderRadius: '8px',
        display: 'block'
    },
    markdown: {
        '& p': {
          fontSize: '14px',
          fontFamily: 'inherit',
          margin: '0',
          lineHeight: 1.5
        },
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          fontSize: '16px',
          fontWeight: 'bold',
          margin: '0.5em 0',
          color: 'inherit'
        },
        '& ul, & ol': {
          fontSize: '14px',
          margin: '0.5em 0',
          paddingLeft: '1.5em'
        },
        '& code': {
          fontSize: '13px',
          fontFamily: 'monospace',
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          padding: '0.1em 0.3em',
          borderRadius: '3px'
        },
        '& pre': {
          fontSize: '13px',
          fontFamily: 'monospace',
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          padding: '8px',
          borderRadius: '6px',
          overflowX: 'auto'
        }
    }
};