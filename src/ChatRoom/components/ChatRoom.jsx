import * as React from "react";
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { chatRoomStyles } from "../styles/ChatRoomStyles";
import useChatMessages from "../hooks/UseChatMessages";
import ChatMessage from "./ChatMessage";
import TextInputArea from "./TextInputArea";
import PropTypes from "prop-types";

export default function ChatRoom({ canvas, onClose })  {
    const { 
        messages, 
        loading, 
        sendTextMessage, 
        sendImageMessage, 
        sendCanvasAnalysis, 
        sendAIDrawing, 
    } = useChatMessages(canvas);

    return (
        <Box sx={chatRoomStyles.container}>
            <Box sx={chatRoomStyles.header}>
                <IconButton
                    onClick={onClose}
                    size="medium"
                    sx={{
                        padding: '2px',
                        minHeight: '20px',
                        height: '20px',
                        marginTop: '-6px',
                        marginRight: '-10px',
                        color: '#5c5c5c',
                        '&:hover': {
                            color: '#f7cac9',
                            backgroundColor: 'rgba(247, 202, 201, 0.1)',
                        },
                    }}
                >
                    <CloseIcon sx={{ fontSize: '20px' }} />
                </IconButton>
            </Box>
            <Box sx={chatRoomStyles.chatArea}>
                {messages.length === 0 && !loading ? (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '100%',
                        color: '#888', 
                        flexDirection: 'column'
                    }}>
                        <Typography variant="body2">
                            沒有聊天記錄或正在載入中...
                        </Typography>
                    </Box>
                ) : (
                    messages.map((message) => (
                        <ChatMessage
                            key={message.id}
                            message={message.message}
                            isUser={message.isUser}
                            isImage={message.isImage}
                        />
                    ))
                )}
                {loading && (
                    <Box sx={chatRoomStyles.messageLoading}>
                        <CircularProgress size={24} sx={{ color: "#f7cac9" }} />
                    </Box>
                )}
            </Box>

            <TextInputArea
                onSendMessage={sendTextMessage}
                onSendImage={sendImageMessage}
                onAnalyzeCanvas={sendCanvasAnalysis}
                onAIDrawing={sendAIDrawing}
                disabled={loading}
            />
        </Box>
    );
}

ChatRoom.propTypes = {
    canvas: PropTypes.object,
    onClose: PropTypes.func.isRequired,
};
