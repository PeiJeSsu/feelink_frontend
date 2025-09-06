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
    const { 
        currentChatroomId, 
        chatroomLoading, 
        chatroomRefreshTrigger,
        getChatroomCache,
        updateChatroomCache
    } = useContext(AuthContext);
    
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
    const lastRefreshTrigger = useRef(0);
    const componentMountedRef = useRef(true); // 追蹤組件掛載狀態

    // 添加清理函數到引用中
    const addCleanupFunction = useCallback((cleanupFn) => {
        if (componentMountedRef.current) {
            cleanupFunctionsRef.current.push(cleanupFn);
        }
    }, []);

    // 執行所有清理函數（但不清理快取）
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

    // 重置聊天室狀態（修改版本：不影響快取）
    const resetChatroomState = useCallback(() => {
        console.log('重置聊天室狀態');
        
        // 只重置 UI 狀態，不要立即清空 messages（這可能觸發快取更新）
        setHistoryLoaded(false);
        setHistoryLoading(false);
        setConversationCount(0);
        setCurrentQuestion("");
        questionAdded.current = false;
        isLoadingRef.current = false;
        
        // 取消正在進行的請求
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        
        executeCleanup();
    }, [executeCleanup]);

    // 優化版本：從快取或資料庫載入聊天室歷史訊息
    const loadChatroomHistory = useCallback(async (chatroomId, forceReload = false) => {
        // 檢查組件是否還掛載
        if (!componentMountedRef.current) {
            console.log('組件已卸載，跳過載入');
            return;
        }

        // 檢查是否需要載入
        if (!chatroomId || chatroomLoading || isLoadingRef.current) {
            console.log('跳過載入歷史訊息:', { 
                chatroomId, 
                chatroomLoading, 
                isLoading: isLoadingRef.current
            });
            return;
        }

        // 優先檢查快取（即使是 lastLoadedChatroomId 不同的情況）
        if (!forceReload) {
            const cachedData = getChatroomCache(chatroomId);
            if (cachedData && cachedData.messages) {
                console.log('使用快取資料載入聊天室:', chatroomId);
                const uniqueMessages = removeDuplicateMessages(cachedData.messages);
                
                // 檢查組件是否還掛載
                if (!componentMountedRef.current) return;
                
                setMessages(uniqueMessages);
                setHistoryLoaded(true);
                setHistoryLoading(false);
                lastLoadedChatroomId.current = chatroomId;
                
                if (uniqueMessages.length > 0) {
                    questionAdded.current = true;
                    const userMessageCount = uniqueMessages.filter(msg => msg.isUser).length;
                    setConversationCount(userMessageCount);
                } else {
                    questionAdded.current = false;
                    setConversationCount(0);
                }
                
                console.log(`從快取載入 ${uniqueMessages.length} 條訊息`);
                return;
            }
        }

        // 沒有快取時才從資料庫載入
        try {
            console.log('從資料庫載入聊天室歷史訊息:', chatroomId);
            isLoadingRef.current = true;
            lastLoadedChatroomId.current = chatroomId;
            setHistoryLoading(true);
            
            // 創建新的 AbortController
            abortControllerRef.current = new AbortController();
            
            const result = await loadChatroomHistoryService(chatroomId);
            
            // 檢查請求是否被取消、聊天室是否已經切換或組件是否已卸載
            if (abortControllerRef.current?.signal.aborted || 
                lastLoadedChatroomId.current !== chatroomId ||
                !componentMountedRef.current) {
                console.log('載入請求已取消、聊天室已切換或組件已卸載');
                return;
            }
            
            if (result.success && Array.isArray(result.content)) {
                const uiMessages = convertDBMessagesToUIMessages(result.content);
                const uniqueMessages = removeDuplicateMessages(uiMessages);
                
                console.log(`成功從資料庫載入 ${uniqueMessages.length} 條歷史訊息`);
                
                // 更新快取
                updateChatroomCache(chatroomId, uniqueMessages);
                
                // 檢查組件是否還掛載
                if (!componentMountedRef.current) return;
                
                setMessages(uniqueMessages);
                
                if (uniqueMessages.length > 0) {
                    questionAdded.current = true;
                    const userMessageCount = uniqueMessages.filter(msg => msg.isUser).length;
                    setConversationCount(userMessageCount);
                } else {
                    console.log('沒有歷史訊息');
                    questionAdded.current = false;
                    setConversationCount(0);
                }
            } else {
                console.log('載入歷史訊息失敗或沒有訊息:', result.error);
                if (componentMountedRef.current) {
                    setMessages([]);
                    updateChatroomCache(chatroomId, []); // 快取空結果
                    questionAdded.current = false;
                    setConversationCount(0);
                }
            }
            
            if (componentMountedRef.current) {
                setHistoryLoaded(true);
            }
        } catch (error) {
            console.error('載入聊天室歷史訊息時發生錯誤:', error);
            // 只有在當前聊天室還是目標聊天室且組件還掛載時才設置錯誤狀態
            if (lastLoadedChatroomId.current === chatroomId && componentMountedRef.current) {
                setMessages([]);
                updateChatroomCache(chatroomId, []); // 快取空結果
                questionAdded.current = false;
                setConversationCount(0);
                setHistoryLoaded(true);
            }
        } finally {
            if (componentMountedRef.current) {
                setHistoryLoading(false);
                isLoadingRef.current = false;
                abortControllerRef.current = null;
            }
        }
    }, [chatroomLoading, getChatroomCache, updateChatroomCache]);

    // 監聽聊天室ID變化 - 修改版本：確保快取持久性
    useEffect(() => {
        console.log('聊天室ID變更效應觸發:', { 
            currentChatroomId, 
            chatroomLoading,
            lastLoaded: lastLoadedChatroomId.current
        });
        
        if (chatroomLoading) {
            console.log('聊天室載入中，跳過處理');
            return;
        }

        if (!currentChatroomId) {
            console.log('沒有聊天室ID，重置狀態');
            resetChatroomState();
            lastLoadedChatroomId.current = null;
            return;
        }

        // 檢查是否是同一個聊天室
        const isActuallySameChatroom = currentChatroomId === lastLoadedChatroomId.current;
        
        // 如果是同一個聊天室且已經載入過，跳過處理
        if (isActuallySameChatroom && historyLoaded) {
            console.log('相同聊天室且已載入，跳過處理');
            return;
        }
        
        // 優先檢查快取
        const cachedData = getChatroomCache(currentChatroomId);
        if (cachedData && cachedData.messages && !isActuallySameChatroom) {
            console.log('使用快取資料載入聊天室:', currentChatroomId);
            
            // 先清理狀態
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
            executeCleanup();
            
            const uniqueMessages = removeDuplicateMessages(cachedData.messages);
            setMessages(uniqueMessages);
            setHistoryLoaded(true);
            setHistoryLoading(false);
            lastLoadedChatroomId.current = currentChatroomId;
            
            if (uniqueMessages.length > 0) {
                questionAdded.current = true;
                const userMessageCount = uniqueMessages.filter(msg => msg.isUser).length;
                setConversationCount(userMessageCount);
            } else {
                questionAdded.current = false;
                setConversationCount(0);
            }
            
            console.log(`從快取載入 ${uniqueMessages.length} 條訊息`);
            return;
        }
        
        // 只有在沒有快取或確實是不同聊天室時才從資料庫載入
        if (!isActuallySameChatroom) {
            console.log('檢測到聊天室ID變化或無快取，準備載入:', currentChatroomId);
            
            // 先清理狀態
            setLoading(false);
            setDisabled(false);
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
            executeCleanup();
            
            // 延遲執行，避免快速切換導致的問題
            const timeoutId = setTimeout(() => {
                if (componentMountedRef.current) {
                    loadChatroomHistory(currentChatroomId, false);
                }
            }, 100);
            
            return () => {
                clearTimeout(timeoutId);
            };
        } else {
            console.log('聊天室ID未變更，跳過載入');
        }
    }, [currentChatroomId, chatroomLoading, executeCleanup, loadChatroomHistory, getChatroomCache, historyLoaded]);

    // 監聽強制重新整理觸發器
    useEffect(() => {
        if (chatroomRefreshTrigger > lastRefreshTrigger.current && 
            currentChatroomId && 
            !chatroomLoading &&
            componentMountedRef.current) {
            
            console.log('檢測到強制重新整理觸發器:', chatroomRefreshTrigger);
            lastRefreshTrigger.current = chatroomRefreshTrigger;
            
            // 強制從資料庫重新載入
            resetChatroomState();
            setTimeout(() => {
                if (componentMountedRef.current) {
                    loadChatroomHistory(currentChatroomId, true); // 強制重新載入
                }
            }, 100);
        }
    }, [chatroomRefreshTrigger, currentChatroomId, chatroomLoading, resetChatroomState, loadChatroomHistory]);

    // 顯示預設問題 - 獨立的效應，避免與載入邏輯混雜
    useEffect(() => {
        if (historyLoaded && 
            messages.length === 0 && 
            !questionAdded.current && 
            !loading && 
            !historyLoading &&
            currentChatroomId &&
            componentMountedRef.current) {
            
            console.log('顯示預設問題');
            const currentLanguage = localStorage.getItem('preferredLanguage') || 'zh-TW';
            const questions = predefinedQuestions[currentLanguage] || predefinedQuestions['zh-TW'];
            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
            const greetingMessage = getGreetingWithNickname(randomQuestion);
            
            addSystemMessage(greetingMessage);
            questionAdded.current = true;
        }
    }, [historyLoaded, messages.length, questionAdded.current, loading, historyLoading, currentChatroomId]);

    // 組件卸載時清理（修改版本：不清理快取）
    useEffect(() => {
        componentMountedRef.current = true;
        
        return () => {
            console.log('useChatMessages 組件卸載，執行清理');
            componentMountedRef.current = false;
            
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
            
            executeCleanup();
            
            // 清理定時器
            const highestTimeoutId = setTimeout(() => {}, 0);
            for (let i = 0; i <= highestTimeoutId; i++) {
                clearTimeout(i);
            }
            
        };
    }, [executeCleanup]);

    // 更新訊息時同步快取
    const updateMessagesOnly = useCallback((newMessages) => {
        if (componentMountedRef.current && newMessages && newMessages.length >= 0) {
            setMessages(newMessages);
        }
    }, []);

    // 僅更新快取的函數
    const updateCacheOnly = useCallback((newMessages) => {
        if (componentMountedRef.current && newMessages && newMessages.length >= 0 && currentChatroomId) {
            // 增加防護：不要用空陣列覆蓋有內容的快取
            const existingCache = getChatroomCache(currentChatroomId);
            if (newMessages.length > 0 || !existingCache || existingCache.messages.length === 0) {
                console.log('更新快取:', currentChatroomId, '訊息數量:', newMessages.length);
                updateChatroomCache(currentChatroomId, newMessages);
            } else {
                console.log('跳過快取更新 - 防止用空陣列覆蓋有效快取');
            }
        }
    }, [currentChatroomId, updateChatroomCache, getChatroomCache]);

    // 同時更新訊息和快取（用於非串流情況）
    const updateMessagesAndCache = useCallback((newMessages) => {
        updateMessagesOnly(newMessages);
        updateCacheOnly(newMessages);
    }, [updateMessagesOnly, updateCacheOnly]);

    // 發送訊息相關函數
    const sendTextMessageStream = useCallback((messageText, defaultQuestion = "", conversationCount = 1) => {
        if (!currentChatroomId || !componentMountedRef.current) {
            console.error('No current chatroom ID available or component unmounted');
            return;
        }
        return handleSendTextMessageStream(
            messageText, 
            messages, 
            updateMessagesOnly, 
            setLoading,
            setDisabled,
            currentChatroomId,
            updateCacheOnly 
        );
    }, [messages, updateMessagesOnly, updateCacheOnly, setLoading, setDisabled, currentChatroomId]);

    const sendImageMessageStream = useCallback((messageText, messageImage) => {
        if (!currentChatroomId || !componentMountedRef.current) {
            console.error('No current chatroom ID available or component unmounted');
            return;
        }
        return handleSendImageMessageStream(
            messageText, 
            messageImage, 
            messages, 
            updateMessagesOnly,  
            setLoading,
            setDisabled,
            currentChatroomId,
            updateCacheOnly 
        );
    }, [messages, updateMessagesOnly, updateCacheOnly, setLoading, setDisabled, currentChatroomId]);

    const convertCanvasToBlob = useCallback(async () => {
        if (!canvas) {
            throw new Error('沒有可用的畫布');
        }
        const dataUrl = canvas.toDataURL('image/png');
        return await (await fetch(dataUrl)).blob();
    }, [canvas]);

    const sendCanvasAnalysisStream = useCallback(async (messageText) => {
        if (!currentChatroomId || !componentMountedRef.current) {
            console.error('No current chatroom ID available or component unmounted');
            return;
        }
        try {
            const blob = await convertCanvasToBlob();
            await handleSendCanvasAnalysisStream(
                blob, 
                messageText, 
                messages, 
                updateMessagesOnly,  
                setLoading,
                setDisabled,
                currentChatroomId,
                updateCacheOnly  
            );
        } catch (error) {
            console.error(error.message);
        }
    }, [messages, updateMessagesOnly, updateCacheOnly, setLoading, setDisabled, canvas, currentChatroomId, convertCanvasToBlob]);

    const sendAIDrawing = useCallback(async (messageText) => {
        if (!currentChatroomId || !componentMountedRef.current) {
            console.error('No current chatroom ID available or component unmounted');
            return;
        }
        try {
            const blob = await convertCanvasToBlob();
            await handleSendAIDrawing(blob, messageText, messages, updateMessagesAndCache, setLoading, setDisabled, canvas, currentChatroomId);
        } catch (error) {
            console.error(error.message);
        }
    }, [messages, updateMessagesAndCache, setLoading, setDisabled, canvas, currentChatroomId, convertCanvasToBlob]);

    const sendAIDrawingWithTypewriter = useCallback(async (messageText) => {
        if (!currentChatroomId || !componentMountedRef.current) {
            console.error('No current chatroom ID available or component unmounted');
            return;
        }
        try {
            const blob = await convertCanvasToBlob();
            await handleSendAIDrawingWithTypewriter(
                blob, 
                messageText, 
                messages, 
                updateMessagesOnly,   
                setLoading, 
                setDisabled, 
                canvas, 
                currentChatroomId,
                updateCacheOnly       
            );
        } catch (error) {
            console.error(error.message);
        }
    }, [messages, updateMessagesOnly, updateCacheOnly, setLoading, setDisabled, canvas, currentChatroomId, convertCanvasToBlob]);

    const sendAIDrawingStream = useCallback(async (messageText) => {
        if (!currentChatroomId || !componentMountedRef.current) {
            console.error('No current chatroom ID available or component unmounted');
            return;
        }
        try {
            const blob = await convertCanvasToBlob();
            await handleSendAIDrawingStream(
                blob, 
                messageText, 
                messages, 
                updateMessagesOnly,  
                setLoading,
                setDisabled,
                canvas, 
                currentChatroomId,
                updateCacheOnly     
            );
        } catch (error) {
            console.error(error.message);
        }
    }, [messages, updateMessagesOnly, updateCacheOnly, setLoading, setDisabled, canvas, currentChatroomId, convertCanvasToBlob]);

    const sendGenerateObject = useCallback(async (messageText) => {
        if (!componentMountedRef.current) {
            return;
        }
        
        try {
            setInputNotification({
                message: '點擊畫布上要生成物件的位置，或按 ESC 鍵取消',
                severity: 'info'
            });
            
            setupCanvasForPositionSelection(messageText);
        } catch (error) {
            console.error(error.message);
        }
    }, [canvas, setInputNotification, messages, updateMessagesAndCache, setLoading, setDisabled, currentChatroomId]);

    const setupCanvasForPositionSelection = useCallback((messageText) => {
        if (!canvas || !currentChatroomId || !componentMountedRef.current) return;
        
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
        
        setDrawingMode(canvas, false);
        disableShapeDrawing(canvas);
        disableEraser(canvas);
        disablePathEraser(canvas);
        disablePaintBucket(canvas);
        setPanningMode(canvas, false);
        
        canvas.selection = false;
        canvas.getObjects().forEach(obj => {
            obj.selectable = false;
            obj.evented = false;
        });
        
        canvas.defaultCursor = 'crosshair';
        canvas.hoverCursor = 'crosshair';
        
        const restoreCanvasState = (clearPosition = true) => {
            canvas.isDrawingMode = originalState.isDrawingMode;
            canvas.selection = originalState.selection;
            canvas.defaultCursor = originalState.defaultCursor;
            canvas.hoverCursor = originalState.hoverCursor;
            
            originalState.objectStates.forEach(state => {
                state.obj.selectable = state.selectable;
                state.obj.evented = state.evented;
            });
            
            if (clearPosition) {
                delete canvas._generateObjectPosition;
            }
        };
        
        const cleanup = (clearPosition = true) => {
            canvas.off('mouse:down', handleCanvasClick);
            window.removeEventListener('keydown', handleKeyDown);
            restoreCanvasState(clearPosition);
            if (clearPosition && componentMountedRef.current) {
                setInputNotification(null);
            }
        };
        
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && componentMountedRef.current) {
                cleanup(true);
                setInputNotification(null);
                showAlert('已取消物件生成', 'info', 2000);
            }
        };
        
        const handleCanvasClick = async (options) => {
            if (!componentMountedRef.current) return;
            
            const pointer = canvas.getPointer(options.e);
            canvas._generateObjectPosition = { x: pointer.x, y: pointer.y };
            console.log('保存點擊位置:', canvas._generateObjectPosition);
            
            setInputNotification(null);
            
            canvas.off('mouse:down', handleCanvasClick);
            window.removeEventListener('keydown', handleKeyDown);
            restoreCanvasState(false);
            
            try {
                const blob = await convertCanvasToBlob();
                await handleSendGenerateObject(blob, messageText, messages, updateMessagesOnly, setLoading, setDisabled, canvas, currentChatroomId, updateCacheOnly); 
            } catch (error) {
                console.error(error.message);
                delete canvas._generateObjectPosition;
            }
        };
        
        canvas.on('mouse:down', handleCanvasClick);
        window.addEventListener('keydown', handleKeyDown);
        
        addCleanupFunction(() => cleanup(true));
    }, [canvas, currentChatroomId, convertCanvasToBlob, setInputNotification, messages, updateMessagesAndCache, setLoading, setDisabled, addCleanupFunction]);

    const addSystemMessage = useCallback((text) => {
        if (!componentMountedRef.current) return;
        
        const newMessages = [
            ...messages,
            createNewMessage(Date.now(), text, false, false)
        ];
        updateMessagesAndCache(newMessages);
    }, [messages, updateMessagesAndCache]);

    const reloadChatroomHistory = useCallback(() => {
        if (currentChatroomId && !historyLoading && !isLoadingRef.current && componentMountedRef.current) {
            console.log('手動重新載入聊天室歷史訊息:', currentChatroomId);
            resetChatroomState();
            setTimeout(() => {
                if (componentMountedRef.current) {
                    loadChatroomHistory(currentChatroomId, true);
                }
            }, 100);
        }
    }, [currentChatroomId, historyLoading, resetChatroomState, loadChatroomHistory]);

    const sendTextMessage = useCallback((messageText) => {
        if (!currentChatroomId || !componentMountedRef.current) {
            console.error('No current chatroom ID available or component unmounted');
            return;
        }
        const nextCount = conversationCount + 1; 
        setConversationCount(nextCount); 
        handleSendTextMessage(
            messageText, 
            messages, 
            updateMessagesAndCache,
            setLoading,
            setDisabled,
            currentChatroomId, 
            currentQuestion, 
            nextCount
        );
    }, [messages, updateMessagesAndCache, setLoading, setDisabled, currentChatroomId, conversationCount, currentQuestion]);

    const sendImageMessage = useCallback((messageText, messageImage) => {
        if (!currentChatroomId || !componentMountedRef.current) {
            console.error('No current chatroom ID available or component unmounted');
            return;
        }
        handleSendImageMessage(
            messageText, 
            messageImage, 
            messages, 
            updateMessagesAndCache,
            setLoading,
            setDisabled,
            currentChatroomId 
        );
    }, [messages, updateMessagesAndCache, setLoading, setDisabled, currentChatroomId]);

    const sendCanvasAnalysis = useCallback(async (messageText) => {
        if (!currentChatroomId || !componentMountedRef.current) {
            console.error('No current chatroom ID available or component unmounted');
            return;
        }
        try {
            const blob = await convertCanvasToBlob();
            await handleSendCanvasAnalysis(
                blob, 
                messageText, 
                messages, 
                updateMessagesAndCache,
                setLoading,
                setDisabled,
                currentChatroomId 
            );
        } catch (error) {
            console.error(error.message);
        }
    }, [messages, updateMessagesAndCache, setLoading, setDisabled, canvas, currentChatroomId, convertCanvasToBlob]);

    // 調試資訊 - 簡化日誌
    useEffect(() => {
        console.log('useChatMessages state:', {
            currentChatroomId,
            messagesCount: messages.length,
            historyLoaded,
            historyLoading,
            chatroomLoading,
            lastLoaded: lastLoadedChatroomId.current,
            isLoading: isLoadingRef.current,
            refreshTrigger: chatroomRefreshTrigger,
            componentMounted: componentMountedRef.current
        });
    }, [currentChatroomId, messages.length, historyLoaded, historyLoading, chatroomLoading, chatroomRefreshTrigger]);

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