import * as React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { chatRoomStyles } from "../styles/ChatRoomStyles";
import useChatMessages from "../hooks/UseChatMessages";
import ChatMessage from "./ChatMessage";
import TextInputArea from "./TextInputArea";
import PropTypes from "prop-types";

export default function ChatRoom({ canvas }) {
    const { 
        messages, 
        loading, 
        predefinedQuestions, 
        sendTextMessage, 
        sendImageMessage, 
        sendCanvasAnalysis, 
        sendAIDrawing, 
        addSystemMessage,
    } = useChatMessages(canvas);

    const questionAdded = React.useRef(false);

    React.useEffect(() => {
        if (messages.length === 0 && !questionAdded.current) {
            const randomQuestion = predefinedQuestions[Math.floor(Math.random() * predefinedQuestions.length)];
            addSystemMessage(randomQuestion);
            questionAdded.current = true; 
        }
    }, [messages, addSystemMessage]);

    return (
        <Box sx={chatRoomStyles.container}>
            

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
    canvas: PropTypes.object
};