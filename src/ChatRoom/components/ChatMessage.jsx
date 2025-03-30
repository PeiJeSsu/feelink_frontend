import * as React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { chatMessageStyles } from '../styles/ChatMessageStyles';

export default function ChatMessage({ message, isUser, isImage }) {
    return (
        <Box sx={chatMessageStyles.container(isUser)}>
            <Box sx={chatMessageStyles.messageBox}>
                <Paper sx={chatMessageStyles.paper(isUser)}>
                    {isImage ? (
                        <img src={message} alt="上傳的圖片" style={chatMessageStyles.image} />
                    ) : (
                        <Typography variant='body2' sx={chatMessageStyles.text}>
                            {message}
                        </Typography>
                    )}
                </Paper>
            </Box>
        </Box>
    );
}
