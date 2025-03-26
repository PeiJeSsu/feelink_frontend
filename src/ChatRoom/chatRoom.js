import * as React from 'react';
import ChatMessage from './chatMessage';
import TextInputArea from './textInputArea';
import { Box } from '@mui/material';
import ChatService from './chatService';

const processImageUpload = (file, messageText, messages, setMessages, setLoading) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageDataUrl = e.target.result;
            const newId = messages.length > 0 
                ? Math.max(...messages.map(m => m.id)) + 1 
                : 1;
            
            const updatedMessages = [];
            
            // 如果有文字訊息，先加入顯示
            if (messageText?.trim()) {
                updatedMessages.push({
                    id: newId,
                    message: messageText,
                    isUser: true,
                    isImage: false
                });
            }
            
            // 顯示圖片訊息
            const imageMessage = {
                id: newId + (messageText ? 1 : 0),
                message: imageDataUrl,
                isUser: true,
                isImage: true
            };
            
            updatedMessages.push(imageMessage);
            
            // 更新本地訊息
            setMessages(prevMessages => [...prevMessages, ...updatedMessages]);
            setLoading(true);
            
            // 發送圖片到後端
            ChatService.sendImage(file, messageText)
                .then(response => {
                    const apiMessage = {
                        id: newId + (messageText ? 2 : 1),
                        message: response.content,
                        isUser: false,
                        isImage: response.isImage || false
                    };
                    
                    setMessages(prevMessages => [...prevMessages, apiMessage]);
                    setLoading(false);
                    resolve();
                })
                .catch(error => {
                    console.error('上傳圖片錯誤:', error);
                    setLoading(false);
                    reject(new Error(`圖片上傳失敗：${error.message}`));
                });
        };
        
        reader.onerror = (error) => {
            console.error('讀取圖片錯誤:', error);
            reject(new Error(`讀取圖片錯誤：${error.message}`));
        };
        
        reader.readAsDataURL(file);
    });
};

export default function ChatRoom() {
    const [messages, setMessages] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [inputAreaHeight, setInputAreaHeight] = React.useState(12);

    // 載入聊天歷史
    React.useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                setLoading(true);
                const history = await ChatService.getChatHistory();
                
                if (history && history.length > 0) {
                    const formattedHistory = history.map((msg, index) => ({
                        id: index + 1,
                        message: msg.content,
                        isUser: msg.isUser,
                        isImage: msg.isImage || false
                    }));
                    setMessages(formattedHistory);
                }
            } catch (error) {
                console.error('載入聊天歷史錯誤:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChatHistory();
    }, []);

    // 發送文字訊息
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
        setLoading(true);
        
        ChatService.sendMessage(messageText)
        .then(response => {
            const apiMessage = {
                id: newId + 1,
                message: response.content, 
                isUser: false,
                isImage: false
            };
            setMessages(prevMessages => [...prevMessages, apiMessage]);
            setLoading(false);
        })
        .catch(error => {
            console.error('發送訊息錯誤:', error);
            setLoading(false);
        });
    };

    // 上傳圖片
    const handleUploadImage = (file, messageText = '') => {
        if (!file) return;
        
        processImageUpload(file, messageText, messages, setMessages, setLoading)
            .catch(error => {
                console.error('圖片上傳處理失敗:', error);
            });
    };

    // 調整輸入區域高度
    const handleInputHeightChange = (lineCount) => {
        const newHeight = Math.min(12 + (lineCount - 1) * 3, 18);
        setInputAreaHeight(newHeight);
    };

    const chatAreaHeight = `${85 - inputAreaHeight + 8}%`;

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