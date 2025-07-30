import { sendMessage , callAIDrawingAPI,analysisImage } from "./MessageAPI";


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

// 發送 AI 繪圖請求到後端
export const sendAIDrawingToBackend = async (messageText, canvasData) => {
    const defaultMessage = "請根據這張圖片生成新的內容";
    return handleServiceCall(() => callAIDrawingAPI(messageText || defaultMessage, canvasData, true));
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
