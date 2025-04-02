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
    text:{
        fontFamily: '"微軟正黑體", "Microsoft JhengHei", sans-serif',
        fontSize: '0.875rem',
        lineHeight: '1.5',
        letterSpacing: '0.01em',
    },
    image: {
        width: '100%',
        borderRadius: '4px',
        display: 'block'
    },
    markdown: {
        '& p': {
          fontSize: '0.875rem', // 對應 Typography variant='body2' 的大小
          fontFamily: 'inherit',
          margin: '0'
        },
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          fontSize: '0.975rem', // 稍微大一點的標題
          fontWeight: 'bold',
          margin: '0.5em 0'
        },
        '& ul, & ol': {
          fontSize: '0.875rem',
          margin: '0.5em 0',
          paddingLeft: '1.5em'
        },
        '& code': {
          fontSize: '0.8rem',
          fontFamily: 'monospace',
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          padding: '0.1em 0.3em',
          borderRadius: '3px'
        }
      }
};