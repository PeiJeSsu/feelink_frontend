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
    handleSendCanvasAnalysisStream,
    handleSendGenerateObject
} from "../helpers/MessageController";
import { loadChatroomHistoryService } from "../helpers/MessageService";
import { 
    convertDBMessagesToUIMessages, 
    removeDuplicateMessages 
} from "../helpers/usage/MessageHelpers";
import { setDrawingMode } from "../../helpers/canvas/CanvasOperations";
import { setPanningMode } from "../../helpers/canvas/PanHelper";
import { disableShapeDrawing } from "../../helpers/shape/ShapeTools";
import { disableEraser } from "../../helpers/eraser/ObjectEraserTools";
import { disablePathEraser } from "../../helpers/eraser/PathEraserTools";
import { disablePaintBucket } from "../../helpers/paint-bucket/PaintBucketTools";
import { showAlert } from "../../utils/AlertUtils";

const predefinedQuestions = {
    'zh-TW': [
        "最近過得如何，有沒有發生什麼有趣或難過的事？",
        "今天的心情如何呢？",
        "最近有沒有讓你開心或困擾的事呢？"
    ],
    'en-US': [
        "How have you been recently? Has anything interesting or sad happened?",
        "How are you feeling today?",
        "Is there anything that has made you happy or troubled recently?"
    ]
};

const getGreetingWithNickname = (question) => {
    const userNickname = localStorage.getItem('userNickname') || '朋友';
    const aiPartnerName = localStorage.getItem('aiPartnerName') || 'AI夥伴';
    const currentLanguage = localStorage.getItem('preferredLanguage') || 'zh-TW';
    
    if (currentLanguage === 'zh-TW') {
        return `嗨，${userNickname}！我是你的 AI 夥伴${aiPartnerName}。${question}`;
    } else {
        return `Hi, ${userNickname}! I'm your AI partner ${aiPartnerName}. ${question}`;
    }
};

export default function useChatMessages(canvas, setInputNotification) {
    const { currentChatroomId, chatroomLoading } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [conversationCount, setConversationCount] = useState(0);
    
    // 使用 ref 來追蹤狀態，避免重複操作
    const questionAdded = useRef(false);
    const cleanupFunctionsRef = useRef([]);
    const lastLoadedChatroomId = useRef(null);
    const isLoadingRef = useRef(false);
    const abortControllerRef = useRef(null);

    // 添加清理函數到引用中
    const addCleanupFunction = useCallback((cleanupFn) => {
        cleanupFunctionsRef.current.push(cleanupFn);
    }, []);

    // 執行所有清理函數
    const executeCleanup = useCallback(() => {
        cleanupFunctionsRef.current.forEach(cleanup => {
            try {
                cleanup();
            } catch (error) {
                console.error('清理函數執行失敗:', error);
            }
        });
        cleanupFunctionsRef.current = [];
    }, []);

    // 重置聊天室狀態
    const resetChatroomState = useCallback(() => {
        console.log('重置聊天室狀態');
        setMessages([]);
        setHistoryLoaded(false);
        setHistoryLoading(false);
        setConversationCount(0);
        setCurrentQuestion("");
        questionAdded.current = false;
        lastLoadedChatroomId.current = null;
        isLoadingRef.current = false;
        
        // 取消正在進行的請求
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        
        executeCleanup();
    }, [executeCleanup]);

    // 載入聊天室歷史訊息
    const loadChatroomHistory = useCallback(async (chatroomId) => {
        // 檢查是否需要載入
        if (!chatroomId || 
            chatroomLoading || 
            isLoadingRef.current || 
            lastLoadedChatroomId.current === chatroomId) {
            console.log('跳過載入歷史訊息:', { 
                chatroomId, 
                chatroomLoading, 
                isLoading: isLoadingRef.current,
                lastLoaded: lastLoadedChatroomId.current
            });
            return;
        }

        try {
            console.log('開始載入聊天室歷史訊息:', chatroomId);
            isLoadingRef.current = true;
            lastLoadedChatroomId.current = chatroomId;
            setHistoryLoading(true);
            
            // 創建新的 AbortController
            abortControllerRef.current = new AbortController();
            
            const result = await loadChatroomHistoryService(chatroomId);
            
            // 檢查請求是否被取消或聊天室是否已經切換
            if (abortControllerRef.current?.signal.aborted || 
                lastLoadedChatroomId.current !== chatroomId) {
                console.log('載入請求已取消或聊天室已切換');
                return;
            }
            
            if (result.success && Array.isArray(result.content)) {
                const uiMessages = convertDBMessagesToUIMessages(result.content);
                const uniqueMessages = removeDuplicateMessages(uiMessages);
                
                console.log(`成功載入 ${uniqueMessages.length} 條歷史訊息`);
                
                setMessages(uniqueMessages);
                
                if (uniqueMessages.length > 0) {
                    questionAdded.current = true;
                    const userMessageCount = uniqueMessages.filter(msg => msg.isUser).length;
                    setConversationCount(userMessageCount);
                } else {
                    console.log('沒有歷史訊息');
                    questionAdded.current = false;
                }
            } else {
                console.log('載入歷史訊息失敗或沒有訊息:', result.error);
                setMessages([]);
                questionAdded.current = false;
            }
            
            setHistoryLoaded(true);
        } catch (error) {
            console.error('載入聊天室歷史訊息時發生錯誤:', error);
            // 只有在當前聊天室還是目標聊天室時才設置錯誤狀態
            if (lastLoadedChatroomId.current === chatroomId) {
                setMessages([]);
                questionAdded.current = false;
                setHistoryLoaded(true);
            }
        } finally {
            setHistoryLoading(false);
            isLoadingRef.current = false;
            abortControllerRef.current = null;
        }
    }, [chatroomLoading]);

    // 監聽聊天室ID變化 - 簡化邏輯，避免無限循環
    useEffect(() => {
        console.log('聊天室ID變更效應觸發:', { currentChatroomId, chatroomLoading });
        
        if (chatroomLoading) {
            console.log('聊天室載入中，跳過處理');
            return;
        }

        if (!currentChatroomId) {
            console.log('沒有聊天室ID，重置狀態');
            resetChatroomState();
            return;
        }

        // 如果是新的聊天室ID，則載入歷史訊息
        if (currentChatroomId !== lastLoadedChatroomId.current) {
            console.log('檢測到新的聊天室ID，準備載入歷史訊息:', currentChatroomId);
            resetChatroomState();
            
            // 延遲執行，避免快速切換導致的問題
            const timeoutId = setTimeout(() => {
                loadChatroomHistory(currentChatroomId);
            }, 100);
            
            return () => {
                clearTimeout(timeoutId);
            };
        }
    }, [currentChatroomId, chatroomLoading, resetChatroomState, loadChatroomHistory]);

    // 顯示預設問題 - 獨立的效應，避免與載入邏輯混雜
    useEffect(() => {
        if (historyLoaded && 
            messages.length === 0 && 
            !questionAdded.current && 
            !loading && 
            !historyLoading &&
            currentChatroomId) {
            
            console.log('顯示預設問題');
            const currentLanguage = localStorage.getItem('preferredLanguage') || 'zh-TW';
            const questions = predefinedQuestions[currentLanguage] || predefinedQuestions['zh-TW'];
            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
            const greetingMessage = getGreetingWithNickname(randomQuestion);
            
            addSystemMessage(greetingMessage);
            questionAdded.current = true;
        }
    }, [historyLoaded, messages.length, questionAdded.current, loading, historyLoading, currentChatroomId]);

    // 組件卸載時清理
    useEffect(() => {
        return () => {
            console.log('useChatMessages 組件卸載，執行清理');
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            executeCleanup();
        };
    }, [executeCleanup]);

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
            setDisabled,
            currentChatroomId
        );
    }, [messages, setMessages, setLoading, setDisabled, currentChatroomId]);

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
            setDisabled,
            currentChatroomId 
        );
    }, [messages, setMessages, setLoading, setDisabled, currentChatroomId]);

    const convertCanvasToBlob = useCallback(async () => {
        if (!canvas) {
            throw new Error('沒有可用的畫布');
        }
        const dataUrl = canvas.toDataURL('image/png');
        return await (await fetch(dataUrl)).blob();
    }, [canvas]);

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
                setDisabled,
                currentChatroomId 
            );
        } catch (error) {
            console.error(error.message);
        }
    }, [messages, setMessages, setLoading, setDisabled, canvas, currentChatroomId, convertCanvasToBlob]);

    // AI 繪圖功能（使用模擬打字機效果版本）
    const sendAIDrawing = useCallback(async (messageText) => {
        if (!currentChatroomId) {
            console.error('No current chatroom ID available');
            return;
        }
        try {
            const blob = await convertCanvasToBlob();
            // 使用帶打字機效果的版本（非串流 API + 前端打字機模擬）
            await handleSendAIDrawing(blob, messageText, messages, setMessages, setLoading, setDisabled, canvas, currentChatroomId);
        } catch (error) {
            console.error(error.message);
        }
    }, [messages, setMessages, setLoading, setDisabled, canvas, currentChatroomId, convertCanvasToBlob]);

    // 明確的打字機效果版本
    const sendAIDrawingWithTypewriter = useCallback(async (messageText) => {
        if (!currentChatroomId) {
            console.error('No current chatroom ID available');
            return;
        }
        try {
            const blob = await convertCanvasToBlob();
            await handleSendAIDrawingWithTypewriter(blob, messageText, messages, setMessages, setLoading, setDisabled, canvas, currentChatroomId);
        } catch (error) {
            console.error(error.message);
        }
    }, [messages, setMessages, setLoading, setDisabled, canvas, currentChatroomId, convertCanvasToBlob]);

    // AI 繪圖串流版本（真實 SSE）
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
                setDisabled,
                canvas, 
                currentChatroomId
            );
        } catch (error) {
            console.error(error.message);
        }
    }, [messages, setMessages, setLoading, setDisabled, canvas, currentChatroomId, convertCanvasToBlob]);

    // 物件生成功能
    const sendGenerateObject = useCallback(async (messageText) => {
        try {
            // 使用輸入框通知而不是全局 snackbar
            setInputNotification({
                message: '點擊畫布上要生成物件的位置，或按 ESC 鍵取消',
                severity: 'info'
            });
            
            // 設置畫布為選擇位置模式
            setupCanvasForPositionSelection(messageText);
        } catch (error) {
            console.error(error.message);
        }
    }, [canvas, setInputNotification, messages, setMessages, setLoading, setDisabled, currentChatroomId]);

    const setupCanvasForPositionSelection = useCallback((messageText) => {
        if (!canvas || !currentChatroomId) return;
        
        // 保存目前的畫布狀態，以便稍後恢復
        const originalState = {
            isDrawingMode: canvas.isDrawingMode,
            selection: canvas.selection,
            defaultCursor: canvas.defaultCursor,
            hoverCursor: canvas.hoverCursor,
            objectStates: canvas.getObjects().map(obj => ({
                obj: obj,
                selectable: obj.selectable,
                evented: obj.evented
            }))
        };
        
        // 禁用所有工具和物件選取
        setDrawingMode(canvas, false);
        disableShapeDrawing(canvas);
        disableEraser(canvas);
        disablePathEraser(canvas);
        disablePaintBucket(canvas);
        setPanningMode(canvas, false);
        
        // 禁用物件選取
        canvas.selection = false;
        canvas.getObjects().forEach(obj => {
            obj.selectable = false;
            obj.evented = false;
        });
        
        // 設置游標樣式
        canvas.defaultCursor = 'crosshair';
        canvas.hoverCursor = 'crosshair';
        
        // 恢復畫布狀態的函數
        const restoreCanvasState = (clearPosition = true) => {
            // 恢復畫布基本狀態
            canvas.isDrawingMode = originalState.isDrawingMode;
            canvas.selection = originalState.selection;
            canvas.defaultCursor = originalState.defaultCursor;
            canvas.hoverCursor = originalState.hoverCursor;
            
            // 恢復物件狀態
            originalState.objectStates.forEach(state => {
                state.obj.selectable = state.selectable;
                state.obj.evented = state.evented;
            });
            
            // 只在需要時清除位置標記
            if (clearPosition) {
                delete canvas._generateObjectPosition;
            }
        };
        
        // 清理事件監聽器的函數
        const cleanup = (clearPosition = true) => {
            canvas.off('mouse:down', handleCanvasClick);
            window.removeEventListener('keydown', handleKeyDown);
            restoreCanvasState(clearPosition);
            if (clearPosition) {
                setInputNotification(null); // 清理時清除通知
            }
        };
        
        // ESC 鍵取消選取的處理函數
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                cleanup(true); // 清除位置
                setInputNotification(null); // 清除通知
                showAlert('已取消物件生成', 'info', 2000);
            }
        };
        
        // 添加一次性點擊事件監聽器
        const handleCanvasClick = async (options) => {
            const pointer = canvas.getPointer(options.e);
            
            // 儲存點擊位置到畫布
            canvas._generateObjectPosition = { x: pointer.x, y: pointer.y };
            console.log('保存點擊位置:', canvas._generateObjectPosition);
            
            // 清除通知
            setInputNotification(null);
            
            // 移除事件監聽器但不清除位置
            canvas.off('mouse:down', handleCanvasClick);
            window.removeEventListener('keydown', handleKeyDown);
            restoreCanvasState(false); // 不清除位置
            
            try {
                const blob = await convertCanvasToBlob();
                await handleSendGenerateObject(blob, messageText, messages, setMessages, setLoading, setDisabled, canvas, currentChatroomId);
            } catch (error) {
                console.error(error.message);
                // 如果出錯，手動清除位置
                delete canvas._generateObjectPosition;
            }
        };
        
        // 添加事件監聽器
        canvas.on('mouse:down', handleCanvasClick);
        window.addEventListener('keydown', handleKeyDown);
        
        // 將清理函數添加到全域清理列表
        addCleanupFunction(() => cleanup(true));
    }, [canvas, currentChatroomId, convertCanvasToBlob, setInputNotification, messages, setMessages, setLoading, setDisabled, addCleanupFunction]);

    const addSystemMessage = useCallback((text) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            createNewMessage(Date.now(), text, false, false)
        ]);
    }, []);

    // 重新載入歷史訊息函數
    const reloadChatroomHistory = useCallback(() => {
        if (currentChatroomId && !historyLoading && !isLoadingRef.current) {
            console.log('手動重新載入聊天室歷史訊息:', currentChatroomId);
            resetChatroomState();
            setTimeout(() => {
                loadChatroomHistory(currentChatroomId);
            }, 100);
        }
    }, [currentChatroomId, historyLoading, resetChatroomState, loadChatroomHistory]);

    // 一般訊息發送函數（非串流）
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
            setDisabled,
            currentChatroomId, 
            currentQuestion, 
            nextCount
        );
    }, [messages, setMessages, setLoading, setDisabled, currentChatroomId, conversationCount, currentQuestion]);

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
            setDisabled,
            currentChatroomId 
        );
    }, [messages, setMessages, setLoading, setDisabled, currentChatroomId]);

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
                setDisabled,
                currentChatroomId 
            );
        } catch (error) {
            console.error(error.message);
        }
    }, [messages, setMessages, setLoading, setDisabled, canvas, currentChatroomId, convertCanvasToBlob]);

    // 調試資訊 - 簡化日誌
    useEffect(() => {
        console.log('useChatMessages state:', {
            currentChatroomId,
            messagesCount: messages.length,
            historyLoaded,
            historyLoading,
            chatroomLoading,
            lastLoaded: lastLoadedChatroomId.current,
            isLoading: isLoadingRef.current
        });
    }, [currentChatroomId, messages.length, historyLoaded, historyLoading, chatroomLoading]);

    return { 
        messages, 
        loading,
        disabled,
        historyLoading,
        historyLoaded,
        predefinedQuestions, 
        sendTextMessage, 
        sendImageMessage, 
        sendCanvasAnalysis, 
        sendAIDrawing, 
        sendGenerateObject,
        addSystemMessage,
        sendTextMessageStream,
        sendImageMessageStream,
        sendCanvasAnalysisStream,
        sendAIDrawingStream,
        sendAIDrawingWithTypewriter, 
        reloadChatroomHistory,
        currentChatroomId
    };
}