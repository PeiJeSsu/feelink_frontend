import {sendMessage, callAIDrawingAPI, sendMessageStream, analysisImage, sendImageToBackendStream, sendCanvasAnalysisToBackendStream} from "./MessageAPI";

const getSessionId = () => {
    const sessionId = localStorage.getItem('currentSessionId');
    if (!sessionId) {
        console.error('SessionId 不存在，請先選擇 AI 個性');
        return null;
    }
    return sessionId;
};

// 發送文字訊息到後端
export const sendTextToBackend = async (payload) => {
    return handleServiceCall(() => sendMessage(payload.text, payload.conversationCount, payload.hasDefaultQuestion));
};

// 發送圖片訊息到後端
export const sendImageToBackend = async (messageText, messageImage) => {
    return handleServiceCall(() => analysisImage(messageText, messageImage));
};

// 發送畫布分析到後端
export const sendCanvasAnalysisToBackend = async (messageText, canvasImage) => {
    const defaultMessage = "請分析這張圖片";
    return handleServiceCall(() => analysisImage(messageText || defaultMessage, canvasImage));
};

// 修改後的 AI 繪圖函數，增加去背邏輯
export const sendAIDrawingToBackend = async (messageText, canvasData) => {
    const defaultMessage = "請根據這張圖片生成新的內容";
    return handleServiceCall(() => callAIDrawingAPI(messageText || defaultMessage, canvasData, true));
};

// 通用的後端訊息發送函數
const sendToBackend = async (messageText, messageImage = null, conversationCount = null, hasDefaultQuestion = false) => {
    return handleServiceCall(() => sendMessage(messageText, messageImage, conversationCount, hasDefaultQuestion));
};

export const sendTextToBackendStream = async (payload, onToken, onComplete, onError) => {
    const sessionId = getSessionId();
    return sendMessageStream(payload.text, sessionId, onToken, onComplete, onError);
};
export const sendImageToBackendStreamService = async (messageText, messageImage, onToken, onComplete, onError) => {
    const sessionId = getSessionId();
    return sendImageToBackendStream(messageText, messageImage, sessionId, onToken, onComplete, onError);
};

// 畫布分析流式服務
export const sendCanvasAnalysisToBackendStreamService = async (messageText, canvasImage, onToken, onComplete, onError) => {
    const sessionId = getSessionId();
    return sendCanvasAnalysisToBackendStream(messageText, canvasImage, sessionId, onToken, onComplete, onError);
};

// 通用的錯誤處理和回應格式化函數
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
