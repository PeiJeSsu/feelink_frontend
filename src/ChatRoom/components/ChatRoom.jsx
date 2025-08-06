import { Box, CircularProgress, Typography, Chip, Skeleton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";
import { Assistant as AssistantIcon, DeleteSweep as DeleteSweepIcon } from '@mui/icons-material';
import { useState } from 'react';
import { chatRoomStyles } from "../styles/ChatRoomStyles";
import useChatMessages from "../hooks/UseChatMessages";
import ChatMessage from "./ChatMessage";
import TextInputArea from "./TextInputArea";
import PropTypes from "prop-types";
import { IconButton } from "@mui/material";

export default function ChatRoom({ canvas }) {
    const { 
        messages, 
        loading,
        historyLoading,
        historyLoaded,
        sendTextMessage, 
        sendImageMessage, 
        sendCanvasAnalysis, 
        sendAIDrawing,
        sendTextMessageStream,
        sendImageMessageStream,
        sendCanvasAnalysisStream,
        reloadChatroomHistory,
        currentChatroomId
    } = useChatMessages(canvas);

    // 🎯 新增：控制清空確認對話框
    const [openClearDialog, setOpenClearDialog] = useState(false);
    const [clearing, setClearing] = useState(false);

    // 🎯 新增：清空聊天室函數
    const handleClearChatroom = async () => {
        if (!currentChatroomId) {
            console.error('沒有可用的聊天室ID');
            return;
        }

        try {
            setClearing(true);
            
            // 調用後端API刪除聊天室所有訊息
            const response = await fetch(`http://localhost:8080/api/messages/chatroom/${currentChatroomId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                console.log('聊天室清空成功');
                // 重新載入聊天室歷史（應該會是空的）
                reloadChatroomHistory();
            } else {
                console.error('清空聊天室失敗:', await response.text());
                // 即使後端失敗，也可以嘗試重新載入看看實際狀況
                reloadChatroomHistory();
            }
        } catch (error) {
            console.error('清空聊天室時發生錯誤:', error);
        } finally {
            setClearing(false);
            setOpenClearDialog(false);
        }
    };

    // 🎯 渲染載入歷史訊息的骨架屏
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

    // 🎯 渲染空狀態
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
            {historyLoaded && (
                <Typography variant="caption" sx={{ fontSize: "12px", marginTop: 0.5, opacity: 0.7 }}>
                    聊天室 ID: {currentChatroomId}
                </Typography>
            )}
        </Box>
    );

    return (
        <Box sx={chatRoomStyles.container}>
            {/* 🎯 修改：聊天標題 */}
            <Box sx={chatRoomStyles.header}>
                <Box sx={chatRoomStyles.headerTitle}>
                    <AssistantIcon sx={chatRoomStyles.titleIcon} />
                    <Typography sx={chatRoomStyles.titleText}>
                        AI 助手
                    </Typography>
                    {/* 🎯 新增：清空聊天室按鈕 */}
                    {historyLoaded && messages.length > 0 && (
                        <IconButton
                            size="small"
                            onClick={() => setOpenClearDialog(true)}
                            disabled={clearing || historyLoading}
                            sx={{ 
                                marginLeft: 1,
                                '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
                            }}
                            title="清空聊天室"
                        >
                            <DeleteSweepIcon 
                                sx={{ 
                                    fontSize: 18, 
                                    color: '#ef4444'
                                }} 
                            />
                        </IconButton>
                    )}
                </Box>
                
                {/* 🎯 修改：只保留創藝好夥伴標籤，放在右側 */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip 
                        label="你的創藝好夥伴" 
                        size="small" 
                        sx={chatRoomStyles.betaChip}
                    />
                </Box>
            </Box>

            {/* 聊天訊息區域 */}
            <Box sx={chatRoomStyles.chatArea}>
                {/* 🎯 載入歷史訊息時顯示骨架屏 */}
                {historyLoading && renderHistoryLoadingSkeleton()}
                
                {/* 🎯 沒有訊息且載入完成時顯示空狀態 */}
                {!historyLoading && messages.length === 0 && renderEmptyState()}
                
                {/* 🎯 顯示聊天訊息 */}
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
                
                {/* 🎯 發送新訊息時的載入指示器 */}
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
                    disabled={loading || historyLoading}
                />
            </Box>

            {/* 🎯 新增：清空確認對話框 */}
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
                    <DialogContentText sx={{ marginTop: 1, fontSize: '12px', color: '#6b7280' }}>
                        聊天室 ID: {currentChatroomId}
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
}

ChatRoom.propTypes = {
    canvas: PropTypes.object.isRequired,
};