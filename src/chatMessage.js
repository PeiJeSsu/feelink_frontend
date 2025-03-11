import * as React from 'react';
import { Box, Paper, Typography } from '@mui/material';

export default function ChatMessage({message,isUser,timestamp}){
    return(
        <Box sx={{
            display:'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
            mb:1.
        }}>
            <Box>
                <Paper sx ={{
                    padding: '8px 12px',
                    bgcolor: isUser ? "#DCE775" : "#F9FBE7",  // 現代清新配色
                    color: isUser ? 'black' : 'black',
                    maxWidth:'70%',
                    
                    borderRadius:'12px',
                    borderTopRightRadius: isUser ? 0 : '12px',
                    borderTopLeftRadius: isUser ? '12px' : 0,
                }}>
                    <Typography variant='body2' sx={{fontSize:"10px"}}>{message}</Typography>
                </Paper>
                <Typography variant ="caption" sx={{
                    display:'block',
                    textAlign: isUser ? 'right' : 'left',
                    mt:0.5,
                    color: 'text.secondary',
                }}>
                    {timestamp}
                </Typography>
            </Box>
        </Box>
    )
}