import * as React from 'react';
import ChatMessage from './chatMessage';
import TextInputArea from './textInputArea';
import { Box } from '@mui/material';
import ChatService from './chatService';

export default function ChatRoom() {
    const [messages, setMessages] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [inputAreaHeight, setInputAreaHeight] = React.useState(12);

    React.useEffect(() => {
        setLoading(true);
        ChatService.getChatHistory()
            .then(history => {
                if (history && history.length > 0) {
                    const formattedHistory = history.map((msg, index) => ({
                        id: index + 1,
                        message: msg.content,
                        isUser: msg.isUser,
                        isImage: msg.isImage || false
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

    const handleSendMessage = (messageText) => {
        if (!messageText.trim()) return;
        
        const newId = messages.length > 0 
            ? Math.max(...messages.map(m => m.id)) + 1 
            : 1;
        
        const newMessage = {
            id: newId,
            message: messageText,
            isUser: true,
            isImage: false
        };
        
        setMessages(prevMessages => [...prevMessages, newMessage]);
        
        ChatService.sendMessage(messageText, true)
            .then(() => {
                setTimeout(() => {
                    ChatService.getLatestResponse()
                        .then(response => {
                            if (response) {
                                const apiMessage = {
                                    id: messages.length + 2,
                                    message: response.content,
                                    isUser: false,
                                    isImage: response.isImage || false
                                };
                                setMessages(prevMessages => [...prevMessages, apiMessage]);
                            }
                        })
                        .catch(error => console.error('獲取API回應錯誤:', error));
                }, 500);
            })
            .catch(error => console.error('發送訊息錯誤:', error));
    };

    const handleUploadImage = (file, messageText = '') => {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageDataUrl = e.target.result;
            const newId = messages.length > 0 
                ? Math.max(...messages.map(m => m.id)) + 1 
                : 1;
            
            // 如果有文字訊息，先發送文字
            if (messageText && messageText.trim()) {
                const textMessage = {
                    id: newId,
                    message: messageText,
                    isUser: true,
                    isImage: false
                };
                
                setMessages(prevMessages => [...prevMessages, textMessage]);
                
                // 發送文字訊息到後端
                ChatService.sendMessage(messageText, true)
                    .catch(error => console.error('發送文字訊息錯誤:', error));
            }
            
            // 然後發送圖片
            const imageMessage = {
                id: newId + (messageText ? 1 : 0),
                message: imageDataUrl,
                isUser: true,
                isImage: true
            };
            
            setMessages(prevMessages => [...prevMessages, imageMessage]);
            
            // 發送圖片到後端
            // 這裡假設 ChatService 有處理上傳圖片的方法
            ChatService.sendImage(file)
                .then(() => {
                    // 獲取後端回應
                    setTimeout(() => {
                        ChatService.getLatestResponse()
                            .then(response => {
                                if (response) {
                                    const apiMessage = {
                                        id: messages.length + 2 + (messageText ? 1 : 0),
                                        message: response.content,
                                        isUser: false,
                                        isImage: response.isImage || false
                                    };
                                    setMessages(prevMessages => [...prevMessages, apiMessage]);
                                }
                            })
                            .catch(error => console.error('獲取API回應錯誤:', error));
                    }, 500);
                })
                .catch(error => console.error('上傳圖片錯誤:', error));
        };
        reader.readAsDataURL(file);
    };

    const handleInputHeightChange = (lineCount) => {
        const newHeight = Math.min(12 + (lineCount - 1) * 3, 18);
        setInputAreaHeight(newHeight);
    };

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
                        isImage={msg.isImage}
                    />
                ))}
                {loading && <div>載入中...</div>}
            </Box>

            <TextInputArea 
                onSendMessage={handleSendMessage}
                onUploadImage={handleUploadImage}
                disabled={loading}
                onHeightChange={handleInputHeightChange}
            />
        </Box>
    );
}