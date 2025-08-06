import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { getChatroomMessages } from "../api/MessageAPI";

export const ChatroomContext = createContext();

export const ChatroomProvider = ({ children }) => {
    const { currentChatroomId } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [messagesLoading, setMessagesLoading] = useState(false);

    // 載入聊天室訊息
    const loadChatroomMessages = async (chatroomId) => {
        if (!chatroomId) return;

        try {
            setMessagesLoading(true);
            const chatMessages = await getChatroomMessages(chatroomId);

            // 將後端的 ChatMessage 轉換為前端需要的格式
            const formattedMessages = chatMessages.map((msg, index) => ({
                id: index + 1,
                message: msg.content,
                isUser: msg.isUser,
                isImage: msg.isDrawingData, // 如果是繪圖資料，視為圖片訊息
                timestamp: msg.sentAt,
                messageId: msg.messageId // 保留後端的 messageId
            }));

            setMessages(formattedMessages);
        } catch (error) {
            console.error('載入聊天室訊息失敗:', error);
            setMessages([]);
        } finally {
            setMessagesLoading(false);
        }
    };

    // 當 currentChatroomId 改變時，載入該聊天室的訊息
    useEffect(() => {
        if (currentChatroomId) {
            loadChatroomMessages(currentChatroomId);
        } else {
            setMessages([]);
        }
    }, [currentChatroomId]);

    // 重新載入當前聊天室的訊息
    const refreshMessages = () => {
        if (currentChatroomId) {
            loadChatroomMessages(currentChatroomId);
        }
    };

    // 清空當前聊天室的訊息（僅前端顯示）
    const clearMessages = () => {
        setMessages([]);
    };

    const value = {
        messages,
        setMessages,
        loading,
        setLoading,
        messagesLoading,
        refreshMessages,
        clearMessages,
        currentChatroomId
    };

    return (
        <ChatroomContext.Provider value={value}>
            {children}
        </ChatroomContext.Provider>
    );
};