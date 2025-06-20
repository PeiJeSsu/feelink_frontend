import { sendMessage } from "./MessageAPI";
import GeminiService from "../../services/GeminiService"; 

// 初始化 Gemini 服務
const geminiService = new GeminiService(process.env.REACT_APP_GEMINI_API_KEY);

// 發送文字訊息到後端
export const sendTextToBackend = async (message) => {
    return sendToBackend(message);
};

// 發送圖片訊息到後端
export const sendImageToBackend = async (messageText, messageImage) => {
    return sendToBackend(messageText, messageImage);
};

// 發送畫布分析到後端
export const sendCanvasAnalysisToBackend = async (messageText, canvasImage) => {
    const defaultMessage = "請分析這張圖片";
    return sendToBackend(messageText || defaultMessage, canvasImage);
};

// 發送 AI 繪圖請求到後端
export const sendAIDrawingToBackend = async (messageText, canvasData) => {
    const defaultMessage = "請根據這張圖片生成新的內容";
    return handleServiceCall(() => 
        geminiService.generateImage(messageText || defaultMessage, canvasData)
    );
};

// 通用的後端訊息發送函數
const sendToBackend = async (messageText, messageImage = null) => {
    return handleServiceCall(() => sendMessage(messageText, messageImage));
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