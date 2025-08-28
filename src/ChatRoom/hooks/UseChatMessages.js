import { useState, useRef, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext"; 
import { createNewMessage } from "../helpers/usage/MessageFactory";
import { 
    handleSendImageMessage, 
    handleSendTextMessage, 
    handleSendCanvasAnalysis, 
    handleSendAIDrawing,  
    handleSendAIDrawingWithTypewriter, 
    handleSendAIDrawingStream, 
    handleSendTextMessageStream, 
    handleSendImageMessageStream, 
    handleSendCanvasAnalysisStream
} from "../helpers/MessageController";
import { loadChatroomHistoryService } from "../helpers/MessageService";
import { 
    convertDBMessagesToUIMessages, 
    removeDuplicateMessages 
} from "../helpers/usage/MessageHelpers";

const predefinedQuestions = [
    "最近過得如何，有沒有發生甚麼有趣或難過的事？",
    "今天的心情如何呢",
    "最近有沒有讓你開心或困擾的事呢？"
];

export default function useChatMessages(canvas) {
    const { currentChatroomId, chatroomLoading } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [conversationCount, setConversationCount] = useState(0);
    const questionAdded = useRef(false);
    
    // 使用 ref 來追蹤當前處理的聊天室ID，避免重複載入
    const processingChatroomId = useRef(null);

    // 移除依賴，避免循環依賴
    const loadChatroomHistory = useCallback(async (chatroomId) => {
        if (!chatroomId || historyLoading || processingChatroomId.current === chatroomId) {
            console.log('跳過載入歷史訊息:', { 
                chatroomId, 
                historyLoading, 
                alreadyProcessing: processingChatroomId.current === chatroomId 
            });
            return;
        }

        try {
            processingChatroomId.current = chatroomId;
            setHistoryLoading(true);
            console.log('載入聊天室歷史訊息:', chatroomId);
            
            const result = await loadChatroomHistoryService(chatroomId);
            
            // 檢查聊天室是否已經切換
            if (processingChatroomId.current !== chatroomId) {
                console.log('聊天室已切換，忽略此次載入結果');
                return;
            }
            
            if (result.success && Array.isArray(result.content)) {
                const uiMessages = convertDBMessagesToUIMessages(result.content);
                const uniqueMessages = removeDuplicateMessages(uiMessages);
                
                console.log(`成功載入 ${uniqueMessages.length} 條歷史訊息`);
                
                if (uniqueMessages.length > 0) {
                    setMessages(uniqueMessages);
                    questionAdded.current = true;
                    
                    const userMessageCount = uniqueMessages.filter(msg => msg.isUser).length;
                    setConversationCount(userMessageCount);
                } else {
                    console.log('沒有歷史訊息');
                    setMessages([]);
                    questionAdded.current = false;
                }
            } else {
                console.log('載入歷史訊息失敗或沒有訊息:', result.error);
                setMessages([]);
                questionAdded.current = false;
            }
        } catch (error) {
            console.error('載入聊天室歷史訊息時發生錯誤:', error);
            setMessages([]);
            questionAdded.current = false;
        } finally {
            setHistoryLoaded(true);
            setHistoryLoading(false);
            // 只有在是當前聊天室時才清除 processing 標記
            if (processingChatroomId.current === chatroomId) {
                processingChatroomId.current = null;
            }
        }
    }, [historyLoading]); // 只依賴 historyLoading

    // 簡化 useEffect，移除 loadChatroomHistory 依賴
    useEffect(() => {
        let isCurrentEffect = true;
        
        if (currentChatroomId && !chatroomLoading) {
            console.log('聊天室ID變更，準備載入歷史訊息:', currentChatroomId);
            
            // 重置狀態
            setHistoryLoaded(false);
            setMessages([]);
            questionAdded.current = false;
            setConversationCount(0);
            setCurrentQuestion("");
            
            // 延遲載入歷史訊息
            const timeoutId = setTimeout(() => {
                if (isCurrentEffect) {
                    loadChatroomHistory(currentChatroomId);
                }
            }, 100);
            
            return () => {
                clearTimeout(timeoutId);
                isCurrentEffect = false;
            };
        } else if (!currentChatroomId) {
            // 清空所有狀態
            setHistoryLoaded(false);
            setMessages([]);
            questionAdded.current = false;
            setConversationCount(0);
            setCurrentQuestion("");
            processingChatroomId.current = null;
        }
        
        return () => {
            isCurrentEffect = false;
        };
    }, [currentChatroomId, chatroomLoading]); // 移除 loadChatroomHistory 依賴

    // 只有在沒有歷史訊息時才顯示預設問題
    useEffect(() => {
        if (historyLoaded && messages.length === 0 && !questionAdded.current && !loading) {
            const randomQuestion = predefinedQuestions[Math.floor(Math.random() * predefinedQuestions.length)];
            addSystemMessage(randomQuestion);
            questionAdded.current = true;
        }
    }, [historyLoaded, messages, loading]);

    // 流式訊息發送函數
    const sendTextMessageStream = useCallback((messageText, defaultQuestion = "", conversationCount = 1) => {
        if (!currentChatroomId) {
            console.error('No current chatroom ID available');
            return;
        }
        return handleSendTextMessageStream(
            messageText, 
            messages, 
            setMessages, 
            setLoading, 
            currentChatroomId
        );
    }, [messages, setMessages, setLoading, currentChatroomId]);

    const sendImageMessageStream = useCallback((messageText, messageImage) => {
        if (!currentChatroomId) {
            console.error('No current chatroom ID available');
            return;
        }
        return handleSendImageMessageStream(
            messageText, 
            messageImage, 
            messages, 
            setMessages, 
            setLoading, 
            currentChatroomId 
        );
    }, [messages, setMessages, setLoading, currentChatroomId]);

    const sendCanvasAnalysisStream = useCallback(async (messageText) => {
        if (!currentChatroomId) {
            console.error('No current chatroom ID available');
            return;
        }
        try {
            const blob = await convertCanvasToBlob();
            await handleSendCanvasAnalysisStream(
                blob, 
                messageText, 
                messages, 
                setMessages, 
                setLoading, 
                currentChatroomId 
            );
        } catch (error) {
            console.error(error.message);
        }
    }, [messages, setMessages, setLoading, canvas, currentChatroomId]);

    // 新增：AI 繪圖串流版本（真實 SSE）
    const sendAIDrawingStream = useCallback(async (messageText) => {
        if (!currentChatroomId) {
            console.error('No current chatroom ID available');
            return;
        }
        try {
            const blob = await convertCanvasToBlob();
            await handleSendAIDrawingStream(
                blob, 
                messageText, 
                messages, 
                setMessages, 
                setLoading, 
                canvas, 
                currentChatroomId
            );
        } catch (error) {
            console.error(error.message);
        }
    }, [messages, setMessages, setLoading, canvas, currentChatroomId]);

    // 一般訊息發送函數
    const sendTextMessage = useCallback((messageText) => {
        if (!currentChatroomId) {
            console.error('No current chatroom ID available');
            return;
        }
        const nextCount = conversationCount + 1; 
        setConversationCount(nextCount); 
        handleSendTextMessage(
            messageText, 
            messages, 
            setMessages, 
            setLoading, 
            currentChatroomId, 
            currentQuestion, 
            nextCount
        );
    }, [messages, setMessages, setLoading, currentChatroomId, conversationCount, currentQuestion]);

    const sendImageMessage = useCallback((messageText, messageImage) => {
        if (!currentChatroomId) {
            console.error('No current chatroom ID available');
            return;
        }
        handleSendImageMessage(
            messageText, 
            messageImage, 
            messages, 
            setMessages, 
            setLoading, 
            currentChatroomId 
        );
    }, [messages, setMessages, setLoading, currentChatroomId]);

    const sendCanvasAnalysis = useCallback(async (messageText) => {
        if (!currentChatroomId) {
            console.error('No current chatroom ID available');
            return;
        }
        try {
            const blob = await convertCanvasToBlob();
            await handleSendCanvasAnalysis(
                blob, 
                messageText, 
                messages, 
                setMessages, 
                setLoading, 
                currentChatroomId 
            );
        } catch (error) {
            console.error(error.message);
        }
    }, [messages, setMessages, setLoading, canvas, currentChatroomId]);

    // AI 繪圖功能（使用模擬打字機效果版本）
    const sendAIDrawing = useCallback(async (messageText) => {
        if (!currentChatroomId) {
            console.error('No current chatroom ID available');
            return;
        }
        try {
            const blob = await convertCanvasToBlob();
            // 使用帶打字機效果的版本（非串流 API + 前端打字機模擬）
            await handleSendAIDrawing(blob, messageText, messages, setMessages, setLoading, canvas, currentChatroomId);
        } catch (error) {
            console.error(error.message);
        }
    }, [messages, setMessages, setLoading, canvas, currentChatroomId]);

    // 明確的打字機效果版本
    const sendAIDrawingWithTypewriter = useCallback(async (messageText) => {
        if (!currentChatroomId) {
            console.error('No current chatroom ID available');
            return;
        }
        try {
            const blob = await convertCanvasToBlob();
            await handleSendAIDrawingWithTypewriter(blob, messageText, messages, setMessages, setLoading, canvas, currentChatroomId);
        } catch (error) {
            console.error(error.message);
        }
    }, [messages, setMessages, setLoading, canvas, currentChatroomId]);

    const addSystemMessage = useCallback((text) => {
        setCurrentQuestion(text);
        setMessages((prevMessages) => [
            ...prevMessages,
            createNewMessage(Date.now(), text, false, false)
        ]);
    }, []);

    const convertCanvasToBlob = useCallback(async () => {
        if (!canvas) {
            throw new Error('沒有可用的畫布');
        }
        const dataUrl = canvas.toDataURL('image/png');
        return await (await fetch(dataUrl)).blob();
    }, [canvas]);

    // 重新載入歷史訊息函數
    const reloadChatroomHistory = useCallback(() => {
        if (currentChatroomId && !historyLoading) {
            console.log('手動重新載入聊天室歷史訊息:', currentChatroomId);
            
            // 重置狀態
            setHistoryLoaded(false);
            setMessages([]);
            questionAdded.current = false;
            processingChatroomId.current = null;
            
            // 延遲載入
            setTimeout(() => {
                loadChatroomHistory(currentChatroomId);
            }, 100);
        }
    }, [currentChatroomId, historyLoading, loadChatroomHistory]);

    // 調試資訊
    useEffect(() => {
        console.log('useChatMessages state:', {
            currentChatroomId,
            messagesCount: messages.length,
            historyLoaded,
            historyLoading,
            chatroomLoading,
            processingId: processingChatroomId.current
        });
    }, [currentChatroomId, messages.length, historyLoaded, historyLoading, chatroomLoading]);

    return { 
        messages, 
        loading,
        historyLoading,
        historyLoaded,
        predefinedQuestions, 
        sendTextMessage, 
        sendImageMessage, 
        sendCanvasAnalysis, 
        sendAIDrawing, 
        addSystemMessage,
        sendTextMessageStream,
        sendImageMessageStream,
        sendCanvasAnalysisStream,
        sendAIDrawingWithTypewriter, 
        reloadChatroomHistory,
        currentChatroomId
    };
}