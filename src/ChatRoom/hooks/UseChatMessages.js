import { useState, useRef, useEffect, useCallback } from "react";
import { createNewMessage } from "../helpers/usage/MessageFactory";
import { handleSendAIDrawing, handleSendGenerateObject, handleSendTextMessageStream, handleSendImageMessageStream, handleSendCanvasAnalysisStream} from "../helpers/MessageController";
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
        return `嗨，${userNickname}！我是你的AI夥伴${aiPartnerName}。${question}`;
    } else {
        return `Hi, ${userNickname}! I'm your AI partner ${aiPartnerName}. ${question}`;
    }
};

export default function useChatMessages(canvas, setInputNotification) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const questionAdded = useRef(false);
    const cleanupFunctionsRef = useRef([]);
    const [disabled, setDisabled] = useState(false);

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

    // 組件卸載時清理
    useEffect(() => {
        return () => {
            executeCleanup();
        };
    }, [executeCleanup]);

    const sendTextMessageStream = useCallback((messageText, defaultQuestion = "", conversationCount = 1) => {
        return handleSendTextMessageStream(messageText, messages, setMessages, setLoading, setDisabled, defaultQuestion, conversationCount);
    }, [messages, setMessages, setLoading]);

    const sendImageMessageStream = useCallback((messageText, messageImage) => {
        return handleSendImageMessageStream(messageText, messageImage, messages, setMessages ,setLoading, setDisabled);
    }, [messages, setMessages, setLoading]);

    const convertCanvasToBlob = useCallback(async () => {
        if (!canvas) {
            throw new Error('沒有可用的畫布');
        }
        const dataUrl = canvas.toDataURL('image/png');
        return await (await fetch(dataUrl)).blob();
    }, [canvas]);

    const sendCanvasAnalysisStream = useCallback(async (messageText) => {
        try {
            const blob = await convertCanvasToBlob();
            await handleSendCanvasAnalysisStream(blob, messageText, messages, setMessages, setLoading, setDisabled);
        } catch (error) {
            console.error(error.message);
        }
    }, [messages, setMessages, setLoading, convertCanvasToBlob]);


    const sendAIDrawing = async (messageText) => {
        try {
            const blob = await convertCanvasToBlob();
            await handleSendAIDrawing(blob, messageText, messages, setMessages, setLoading, setDisabled, canvas);
        } catch (error) {
            console.error(error.message);
        }
    };

    const sendGenerateObject = async (messageText) => {
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
    };

    const setupCanvasForPositionSelection = (messageText) => {
        if (!canvas) return;
        
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
                await handleSendGenerateObject(blob, messageText, messages, setMessages, setLoading, setDisabled, canvas);
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
    };

    const addSystemMessage = useCallback((text) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            createNewMessage(Date.now(), text, false, false)
        ]);
    }, []);

    useEffect(() => {
        if (messages.length === 0 && !questionAdded.current) {
            const currentLanguage = localStorage.getItem('preferredLanguage') || 'zh-TW';
            const questions = predefinedQuestions[currentLanguage] || predefinedQuestions['zh-TW'];
            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
            const greetingMessage = getGreetingWithNickname(randomQuestion);
            addSystemMessage(greetingMessage);
            questionAdded.current = true;
        }
    }, [messages, addSystemMessage]);

    return { 
        messages, 
        loading,
        disabled,
        predefinedQuestions,
        sendAIDrawing, 
        sendGenerateObject,
        addSystemMessage,
        sendTextMessageStream,
        sendImageMessageStream,
        sendCanvasAnalysisStream
    };
}