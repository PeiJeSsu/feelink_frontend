import { Box, CircularProgress, Typography, Chip, Skeleton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";
import { Assistant as AssistantIcon, DeleteSweep as DeleteSweepIcon } from '@mui/icons-material';
import { useState, useEffect ,useRef, forwardRef, useImperativeHandle} from 'react';
import { chatRoomStyles } from "../styles/ChatRoomStyles";
import useChatMessages from "../hooks/UseChatMessages";
import ChatMessage from "./ChatMessage";
import TextInputArea from "./TextInputArea";
import PropTypes from "prop-types";
import { apiConfig } from "../config/ApiConfig"

const ChatRoom = forwardRef(function ChatRoom({ canvas, onClose, onDisabledChange }, ref) {
    const [inputNotification, setInputNotification] = useState(null);
    const chatAreaRef = useRef(null);
    const { 
        messages, 
        loading,
        disabled,
        historyLoading,
        historyLoaded,
        sendGenerateObject,
        sendTextMessageStream,
        sendImageMessageStream,
        sendCanvasAnalysisStream,
        sendAIDrawingWithTypewriter,
        reloadChatroomHistory,
        currentChatroomId
    } = useChatMessages(canvas, setInputNotification);

    // 控制清空確認對話框
    const [openClearDialog, setOpenClearDialog] = useState(false);
    const [clearing, setClearing] = useState(false);

    // 將內部 disabled 狀態通過 callback 傳遞給父組件
    useEffect(() => {
        if (onDisabledChange) {
            onDisabledChange(disabled || loading || historyLoading || clearing);
        }
    }, [disabled, loading, historyLoading, clearing, onDisabledChange]);

    // 暴露清空聊天室函數給父組件
    useImperativeHandle(ref, () => ({
        handleClearChatroom: () => {
            if (historyLoaded && messages.length > 0) {
                setOpenClearDialog(true);
            }
        }
    }));

    // 取得 AI 夥伴名稱的函數
    const getAIPartnerName = () => {
        let aiPartnerName;
        const currentLanguage = localStorage.getItem('preferredLanguage') || 'zh-TW';
        if(currentLanguage ==='zh-TW'){
            aiPartnerName = localStorage.getItem('currentChatroomAIPartnerName');
        }
        else{
            aiPartnerName = localStorage.getItem('currentChatroomAIPartnerEnglish');
        }
        if (!aiPartnerName) {
            return currentLanguage === 'zh-TW' ? 'AI 夥伴' : 'AI Partner';
        }
        
        return currentLanguage === 'zh-TW' ? `AI 夥伴 — ${aiPartnerName}` : `AI Partner ${aiPartnerName}`;
    };
    const scrollToBottom = () => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    };
    useEffect(() => {
        if (historyLoaded && !historyLoading && messages.length > 0) {
            setTimeout(() => {
                scrollToBottom();
            }, 1);
        }
    }, [historyLoaded, historyLoading, messages.length]);
    
    const handleClearChatroom = async () => {
        if (!currentChatroomId) {
            console.error('沒有可用的聊天室ID');
            return;
        }

        try {
            setClearing(true);
            await apiConfig.delete(`/api/messages/chatroom/${currentChatroomId}`, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('聊天室清空成功');
            reloadChatroomHistory();
        } catch (error) {
            console.error('清空聊天室失敗:', error);
            reloadChatroomHistory();
        } finally {
            setClearing(false);
            setOpenClearDialog(false);
        }
    };

    // 渲染載入歷史訊息的骨架屏
    const renderHistoryLoadingSkeleton = () => (
        <Box sx={{ padding: 2 }}>
            {[1, 2, 3].map((item) => (
                <Box key={item} sx={{ marginBottom: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton variant="text" width={100} sx={{ marginLeft: 1 }} />
                    </Box>
                    <Skeleton variant="rectangular" width="80%" height={60} sx={{ borderRadius: 2 }} />
                </Box>
            ))}
        </Box>
    );

    // 渲染空狀態
    const renderEmptyState = () => (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            color: '#9ca3af', 
            flexDirection: 'column',
            padding: 2
        }}>
            <AssistantIcon sx={{ fontSize: 48, opacity: 0.3, marginBottom: 1 }} />
            <Typography variant="body2" sx={{ fontSize: "14px", textAlign: 'center' }}>
                {historyLoaded ? '沒有聊天記錄，輸入訊息開始對話吧！' : '準備載入聊天記錄...'}
            </Typography>
            {historyLoaded && currentChatroomId && (
                <Typography variant="caption" sx={{ fontSize: "12px", marginTop: 0.5, opacity: 0.7 }}>
                    聊天室 ID: {currentChatroomId}
                </Typography>
            )}
        </Box>
    );

    return (
        <Box sx={chatRoomStyles.container}>
            {/* 聊天標題 */}
            <Box sx={chatRoomStyles.header}>
                <Box sx={chatRoomStyles.headerTitle}>
                    <AssistantIcon sx={chatRoomStyles.titleIcon} />
                    <Typography sx={chatRoomStyles.titleText}>
                        {getAIPartnerName()}
                    </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip 
                        label="你的創藝好夥伴" 
                        size="small" 
                        sx={chatRoomStyles.betaChip}
                    />
                </Box>
            </Box>

            {/* 聊天訊息區域 */}
            <Box ref={chatAreaRef} sx={chatRoomStyles.chatArea}>
                {/* 載入歷史訊息時顯示骨架屏 */}
                {historyLoading && renderHistoryLoadingSkeleton()}
                
                {/* 沒有訊息且載入完成時顯示空狀態 */}
                {!historyLoading && messages.length === 0 && renderEmptyState()}
                
                {/* 顯示聊天訊息 */}
                {!historyLoading && messages.length > 0 && (
                    <>
                        {messages.map((message) => (
                            <ChatMessage
                                key={message.id}
                                message={message.message}
                                isUser={message.isUser}
                                isImage={message.isImage}
                                timestamp={message.timestamp}
                            />
                        ))}
                    </>
                )}
                
                {/* 發送新訊息時的載入指示器 */}
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
                    onAIDrawing={sendAIDrawingWithTypewriter}
                    onGenerateObject={sendGenerateObject}
                    disabled={disabled || loading || historyLoading}
                    inputNotification={inputNotification}
                    onClearNotification={() => setInputNotification(null)}
                />
            </Box>

            {/* 清空確認對話框 */}
            <Dialog
                open={openClearDialog}
                onClose={() => !clearing && setOpenClearDialog(false)}
                aria-labelledby="clear-dialog-title"
                aria-describedby="clear-dialog-description"
            >
                <DialogTitle id="clear-dialog-title">
                    清空聊天室
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="clear-dialog-description">
                        確定要清空這個聊天室的所有訊息嗎？此操作無法復原。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setOpenClearDialog(false)} 
                        disabled={clearing}
                        color="inherit"
                    >
                        取消
                    </Button>
                    <Button 
                        onClick={handleClearChatroom} 
                        disabled={clearing}
                        color="error"
                        variant="contained"
                        startIcon={clearing ? <CircularProgress size={16} /> : <DeleteSweepIcon />}
                    >
                        {clearing ? '清空中...' : '確認清空'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
});

ChatRoom.displayName = 'ChatRoom';

ChatRoom.propTypes = {
    canvas: PropTypes.object.isRequired,
    onClose: PropTypes.func,
    onDisabledChange: PropTypes.func,
};

export default ChatRoom;