import * as React from "react";
import { Box, CircularProgress } from "@mui/material";
import { chatRoomStyles } from "../styles/ChatRoomStyles";
import useChatMessages from "../hooks/UseChatMessages";
import ChatMessage from "./ChatMessage";
import TextInputArea from "./TextInputArea";
import PropTypes from "prop-types";

export default function ChatRoom({ canvas }) {
const { messages, loading, predefinedQuestions, sendTextMessage, sendImageMessage, sendCanvasAnalysis, sendAIDrawing, addSystemMessage } = useChatMessages(canvas);
    
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
                {messages.map((message) => (
                    <ChatMessage
                        key={message.id}
                        message={message.message}
                        isUser={message.isUser}
                        isImage={message.isImage}
                    />
                ))}
                {loading && (
                    <Box sx={chatRoomStyles.messageLoading}>
                        <CircularProgress size={24} color="#f7cac9" />
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
