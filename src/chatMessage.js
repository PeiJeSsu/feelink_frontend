import * as React from 'react';
import { Box, Paper, Typography } from '@mui/material';

export default function ChatMessage({message, isUser, timestamp, isImage}) {
    console.log('isUser:', isUser); // 添加這行來檢查 isUser 值
    
    return(
        <Box sx={{
            display:'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start', // 這裡決定氣泡的位置
            mb:1,
            width: '100%' // 確保足夠的寬度
        }}>
            <Box sx={{
                maxWidth: '70%' // 限制氣泡最大寬度
            }}>
                <Paper sx={{
                    padding: '8px 12px',
                    bgcolor: isUser ? "#DCE775" : "#F9FBE7",
                    borderRadius:'12px',
                    borderTopRightRadius: isUser ? 0 : '12px',
                    borderTopLeftRadius: isUser ? '12px' : 0,
                    overflow: 'hidden' // 確保內容不溢出
                }}>
                    {isImage ? (
                        <img 
                            src={message} 
                            alt="上傳的圖片" 
                            style={{
                                width: '100%', // 確保圖片填滿氣泡
                                borderRadius: '4px',
                                display: 'block' // 移除圖片下方的空白
                            }}
                        />
                    ) : (
                        <Typography variant='body2' sx={{
                            fontSize:"10px",
                            textAlign: "left",
                            display: "inline-block",
                        }}>
                            {message}
                        </Typography>
                    )}
                </Paper>
                <Typography variant="caption" sx={{
                    display:'block',
                    textAlign: isUser ? 'right' : 'left',
                    mt:0.5,
                    color: 'text.secondary',
                }}>
                    {timestamp}
                </Typography>
            </Box>
        </Box>
    );
}