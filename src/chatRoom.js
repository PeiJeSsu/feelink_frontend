import * as React from 'react';
import ChatMessage from './chatMessage';
import TextInputArea from './textInputArea';
import { Box } from '@mui/material';
import ChatService from './chatService';

export default function ChatRoom() {
    const [messages, setMessages] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [inputAreaHeight, setInputAreaHeight] = React.useState(12); // 以百分比表示

    // 當元件掛載時從後端載入訊息歷史
    React.useEffect(() => {
        setLoading(true);
        ChatService.getChatHistory()
            .then(history => {
                if (history && history.length > 0) {
                    const formattedHistory = history.map((msg, index) => ({
                        id: index + 1,
                        message: msg.content,
                        isUser: msg.isUser
                    }));
                    setMessages(formattedHistory);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('載入聊天歷史錯誤:', error);
                setLoading(false);
            });
    }, []);

    // 處理發送新訊息
    const handleSendMessage = (messageText) => {
        if (!messageText.trim()) return;
        
        // 產生新的訊息ID
        const newId = messages.length > 0 
            ? Math.max(...messages.map(m => m.id)) + 1 
            : 1;
        
        // 先將使用者訊息添加到UI
        const newMessage = {
            id: newId,
            message: messageText,
            isUser: true
        };
        
        setMessages(prevMessages => [...prevMessages, newMessage]);
        
        // 發送到後端
        ChatService.sendMessage(messageText, true)
            .then(() => {
                // 發送成功後，檢查API回應
                setTimeout(() => {
                    ChatService.getLatestResponse()
                        .then(response => {
                            if (response) {
                                const apiMessage = {
                                    id: messages.length + 2, // +1 是因為已經添加了使用者訊息
                                    message: response.content,
                                    isUser: false
                                };
                                setMessages(prevMessages => [...prevMessages, apiMessage]);
                            }
                        })
                        .catch(error => console.error('獲取API回應錯誤:', error));
                }, 500); // 給後端一些處理時間
            })
            .catch(error => console.error('發送訊息錯誤:', error));
    };

    // 處理API分析請求
    const handleAnalysis = (messageText) => {
        if (!messageText.trim()) return;
        
        ChatService.callApi(messageText)
            .then(apiResponse => {
                if (apiResponse && apiResponse.success) {
                    // 分析請求成功後，檢查新的回應
                    setTimeout(() => {
                        ChatService.getLatestResponse()
                            .then(response => {
                                if (response) {
                                    const apiMessage = {
                                        id: messages.length + 1,
                                        message: response.content,
                                        isUser: false
                                    };
                                    setMessages(prevMessages => [...prevMessages, apiMessage]);
                                }
                            })
                            .catch(error => console.error('獲取API回應錯誤:', error));
                    }, 500);
                }
            })
            .catch(error => console.error('API分析錯誤:', error));
    };

    // 處理輸入區域高度變化
    const handleInputHeightChange = (lineCount) => {
        // 根據行數計算高度百分比
        // 基本高度是12%，每增加一行增加3%，最大到25%
        const newHeight = Math.min(12 + (lineCount - 1) * 3, 18);
        setInputAreaHeight(newHeight);
    };

    // 計算訊息區域高度
    const chatAreaHeight = `${85 - inputAreaHeight+8}%`;

    return (
        <Box sx={{ 
            position: "fixed",
            bottom: "5px",
            right: "5px",
            width: "21.5%",
            height: "100%",
            gap: "8px"
        }}>
            {/* 聊天訊息區域 */}
            <Box sx={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px',
                position: "relative",
                height: chatAreaHeight,
                top: "10px",
                backgroundColor: '#ffffff',
                overflowY: 'auto',
                transition: 'height 0.3s ease'
            }}>
                {messages.map(msg => (
                    <ChatMessage
                        key={msg.id}
                        message={msg.message}
                        isUser={msg.isUser}
                    />
                ))}
                {loading && <div>載入中...</div>}
            </Box>

            {/* 輸入區域 */}
            <TextInputArea 
                onSendMessage={handleSendMessage} 
                onAnalyze={handleAnalysis} 
                disabled={loading}
                onHeightChange={handleInputHeightChange}
            />
        </Box>
    );
}