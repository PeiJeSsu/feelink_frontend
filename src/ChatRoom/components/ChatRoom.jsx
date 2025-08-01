import { Box, CircularProgress, Typography, Chip } from "@mui/material";
import { Assistant as AssistantIcon } from '@mui/icons-material';
import { chatRoomStyles } from "../styles/ChatRoomStyles";
import useChatMessages from "../hooks/UseChatMessages";
import ChatMessage from "./ChatMessage";
import TextInputArea from "./TextInputArea";
import PropTypes from "prop-types";

export default function ChatRoom({ canvas })  {
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
            {/* 聊天標題 */}
            <Box sx={chatRoomStyles.header}>
                <Box sx={chatRoomStyles.headerTitle}>
                    <AssistantIcon sx={chatRoomStyles.titleIcon} />
                    <Typography sx={chatRoomStyles.titleText}>
                        AI 助手
                    </Typography>
                </Box>
                <Chip 
                    label="你的創藝好夥伴" 
                    size="small" 
                    sx={chatRoomStyles.betaChip}
                />
            </Box>

            {/* 聊天訊息區域 */}
            <Box sx={chatRoomStyles.chatArea}>
                {messages.length === 0 && !loading ? (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '100%',
                        color: '#9ca3af', 
                        flexDirection: 'column'
                    }}>
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
                    onSendMessage={sendTextMessage}
                    onSendImage={sendImageMessage}
                    onAnalyzeCanvas={sendCanvasAnalysis}
                    onAIDrawing={sendAIDrawing}
                    disabled={loading}
                />
            </Box>
        </Box>
    );
}

ChatRoom.propTypes = {
    canvas: PropTypes.object.isRequired,
};
