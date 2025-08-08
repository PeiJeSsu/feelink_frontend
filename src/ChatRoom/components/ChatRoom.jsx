import { Box, CircularProgress, Typography, Chip } from "@mui/material";
import { Assistant as AssistantIcon } from "@mui/icons-material";
import { useState } from "react";
import { chatRoomStyles } from "../styles/ChatRoomStyles";
import useChatMessages from "../hooks/UseChatMessages";
import ChatMessage from "./ChatMessage";
import TextInputArea from "./TextInputArea";
import PropTypes from "prop-types";

export default function ChatRoom({ canvas }) {
    const [inputNotification, setInputNotification] = useState(null);
    
    const {
        messages,
        loading,
        disabled,
        sendAIDrawing,
        sendGenerateObject,
        sendTextMessageStream,
        sendImageMessageStream,
        sendCanvasAnalysisStream,
    } = useChatMessages(canvas, setInputNotification);

    // 取得 AI 夥伴名稱的函數
    const getAIPartnerName = () => {
        const aiPartnerName = localStorage.getItem('aiPartnerName');
        const currentLanguage = localStorage.getItem('preferredLanguage') || 'zh-TW';
        
        if (!aiPartnerName) {
            return currentLanguage === 'zh-TW' ? 'AI 夥伴' : 'AI Partner';
        }
        
        return currentLanguage === 'zh-TW' ? `AI 夥伴 — ${aiPartnerName}` : `AI Partner ${aiPartnerName}`;
    };
    return (
        <Box sx={chatRoomStyles.container}>
            {/* 聊天標題 */}
            <Box sx={chatRoomStyles.header}>
                <Box sx={{ gap: "24px", display: "flex" }}>
                    <Box sx={chatRoomStyles.headerTitle}>
                        <AssistantIcon sx={chatRoomStyles.titleIcon} />
                        <Typography sx={chatRoomStyles.titleText}>
                            {getAIPartnerName()}
                        </Typography>
                    </Box>
                    <Chip
                        label="你的創藝好夥伴"
                        size="small"
                        sx={chatRoomStyles.betaChip}
                    />
                </Box>
            </Box>

            {/* 聊天訊息區域 */}
            <Box sx={chatRoomStyles.chatArea}>
                {messages.length === 0 && !loading ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                            color: "#9ca3af",
                            flexDirection: "column",
                        }}
                    >
                        <Typography variant="body2" sx={{ fontSize: "14px" }}>
                            沒有聊天記錄，輸入訊息開始對話吧！
                        </Typography>
                    </Box>
                ) : (
                    messages.map((message) => (
                        <ChatMessage
                            key={message.id}
                            message={message.message}
                            isUser={message.isUser}
                            isImage={message.isImage}
                            timestamp={message.timestamp}
                        />
                    ))
                )}
                {loading && (
                    <Box sx={chatRoomStyles.messageLoading}>
                        <CircularProgress size={20} sx={{ color: "#2563eb" }} />
                        <Typography sx={chatRoomStyles.loadingText}>
                            正在思考中...
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* 聊天輸入區域 */}
            <Box sx={chatRoomStyles.inputArea}>
                <TextInputArea
                    onSendMessage={sendTextMessageStream}
                    onSendImage={sendImageMessageStream}
                    onAnalyzeCanvas={sendCanvasAnalysisStream}
                    onAIDrawing={sendAIDrawing}
                    onGenerateObject={sendGenerateObject}
                    disabled={disabled}
                    inputNotification={inputNotification}
                    onClearNotification={() => setInputNotification(null)}
                />
            </Box>
        </Box>
    );
}

ChatRoom.propTypes = {
    canvas: PropTypes.object.isRequired,
};