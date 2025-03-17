import * as React from 'react';
import { Box, Paper, Typography } from '@mui/material';

export default function ChatMessage({ message, isUser, isImage }) {
    console.log('isUser:', isUser);

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
            mb: 1,
            width: '100%'
        }}>
            <Box sx={{ maxWidth: '70%' }}>
                <Paper sx={{
                    padding: '8px 12px',
                    bgcolor: isUser ? "#DCE775" : "#F9FBE7",
                    borderRadius: '12px',
                    borderTopRightRadius: isUser ? 0 : '12px',
                    borderTopLeftRadius: isUser ? '12px' : 0,
                    overflow: 'hidden'
                }}>
                    {isImage ? (
                        <img 
                            src={message} 
                            alt="上傳的圖片" 
                            style={{
                                width: '100%',
                                borderRadius: '4px',
                                display: 'block'
                            }}
                        />
                    ) : (
                        <Typography variant='body2' sx={{
                            fontSize: "10px",
                            textAlign: "left",
                            display: "inline-block",
                        }}>
                            {message}
                        </Typography>
                    )}
                </Paper>
            </Box>
        </Box>
    );
}