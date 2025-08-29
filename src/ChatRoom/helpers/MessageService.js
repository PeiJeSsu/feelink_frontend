import {
    sendMessage, 
    callAIDrawingAPI, 
    callAIDrawingAPIStream,
    sendMessageStream, 
    analysisImage, 
    sendImageToBackendStream, 
    sendCanvasAnalysisToBackendStream,
    loadChatroomMessages,
    loadChatroomTextMessages,
    loadChatroomDrawingMessages,
    loadUserMessages,
    loadAIMessages
} from "./MessageAPI";

// 獲取選中的個性設置
const getSelectedPersonality = () => {
    return localStorage.getItem('selectedPersonality') || 'default';
};

// 添加 chatroomId 和 personality 參數
export const sendTextToBackend = async (payload, chatroomId) => {
    return handleServiceCall(() => sendMessage(payload.text, payload.conversationCount, payload.hasDefaultQuestion, chatroomId, getSelectedPersonality()));
};

// 添加 chatroomId 和 personality 參數
export const sendImageToBackend = async (messageText, messageImage, chatroomId) => {
    return handleServiceCall(() => analysisImage(messageText, messageImage, chatroomId, getSelectedPersonality()));
};

// 添加 chatroomId 和 personality 參數
export const sendCanvasAnalysisToBackend = async (messageText, canvasImage, chatroomId) => {
    const defaultMessage = "請分析這張圖片";
    return handleServiceCall(() => analysisImage(messageText || defaultMessage, canvasImage, chatroomId, getSelectedPersonality()));
};

// AI 繪圖函數，增加 chatroomId 參數和去背邏輯 (非串流版本)
export const sendAIDrawingToBackend = async (messageText, canvasData, chatroomId, mode = 'drawing') => {
    const defaultMessage = "請根據這張圖片生成新的內容";

    // 添加 chatroomId 參數到 API 調用
    return handleServiceCall(() => callAIDrawingAPI(messageText || defaultMessage, canvasData, true, chatroomId, mode));
};

// 新增：AI 繪圖串流函數
export const sendAIDrawingToBackendStream = async (messageText, canvasData, chatroomId, onToken, onComplete, onError, onImageGenerated) => {
    const defaultMessage = "請根據這張圖片生成新的內容";
    return callAIDrawingAPIStream(messageText || defaultMessage, canvasData, true, chatroomId, onToken, onComplete, onError, onImageGenerated);
};

// 更新流式發送函數，使用 chatroomId
export const sendTextToBackendStream = async (payload, chatroomId, onToken, onComplete, onError) => {
    return sendMessageStream(payload.text, chatroomId, onToken, onComplete, onError);
};

// 更新流式發送函數，使用 chatroomId
export const sendImageToBackendStreamService = async (messageText, messageImage, chatroomId, onToken, onComplete, onError) => {
    return sendImageToBackendStream(messageText, messageImage, chatroomId, onToken, onComplete, onError);
};

// 畫布分析流式服務，使用 chatroomId
export const sendCanvasAnalysisToBackendStreamService = async (messageText, canvasImage, chatroomId, onToken, onComplete, onError) => {
    return sendCanvasAnalysisToBackendStream(messageText, canvasImage, chatroomId, onToken, onComplete, onError);
};

// 載入聊天室歷史訊息的服務
export const loadChatroomHistoryService = async (chatroomId) => {
    return handleServiceCall(() => loadChatroomMessages(chatroomId));
};

// 載入文字訊息服務
export const loadTextMessagesService = async (chatroomId) => {
    return handleServiceCall(() => loadChatroomTextMessages(chatroomId));
};

// 載入畫布資料服務
export const loadDrawingMessagesService = async (chatroomId) => {
    return handleServiceCall(() => loadChatroomDrawingMessages(chatroomId));
};

// 載入使用者訊息服務
export const loadUserMessagesService = async (chatroomId) => {
    return handleServiceCall(() => loadUserMessages(chatroomId));
};

// 載入AI訊息服務
export const loadAIMessagesService = async (chatroomId) => {
    return handleServiceCall(() => loadAIMessages(chatroomId));
};

// 通用的錯誤處理和回應格式化函數（保持不變）
const handleServiceCall = async (serviceCall) => {
    try {
        const response = await serviceCall();
        return {
            success: true,
            content: response.content || response
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};