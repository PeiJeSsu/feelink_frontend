import * as React from "react";
import { Box ,CircularProgress } from "@mui/material";
import {chatRoomStyles} from "../styles/ChatRoomStyles";
import useChatMessages from "../hooks/UseChatMessages";
import ChatMessage from "./ChatMessage";
import TextInputArea from "./TextInputArea";
import PropTypes from "prop-types";

export default function ChatRoom({ canvas }) {
    const { messages, loading, sendTextMessage, sendImageMessage, sendCanvasAnalysis } = useChatMessages();

    const handleAnalyzeCanvas = async (messageText) => {
        if (!canvas) return;

        try {
            // 將畫布轉換為圖片
            const dataUrl = canvas.toDataURL('image/png');
            // 將 base64 轉換為 blob
            const blob = await (await fetch(dataUrl)).blob();
            
            // 發送分析請求，包含文字訊息
            await sendCanvasAnalysis(blob, messageText);
        } catch (error) {
            console.error('分析畫布時發生錯誤:', error);
        }
    };

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
                onAnalyzeCanvas={handleAnalyzeCanvas}
                disabled={loading}
            />
        </Box>
    );
}

ChatRoom.propTypes = {
    canvas: PropTypes.object
};
