import { sendMessage } from "./HandleSendMessageApiConn"; 
import GeminiService from "../../services/GeminiService"; 
import { createNewMessage } from "./MessageFactory";

// 初始化 Gemini 服務
const geminiService = new GeminiService(process.env.REACT_APP_GEMINI_API_KEY);

// 發送訊息並接收回應
export const saveReceiveMessage = async (id, messageText, messageImage) => {
    const response = await sendMessage(messageText, messageImage);
    return createNewMessage(id, response.content, false, false);
};

// 發送文字訊息到後端
export const sendTextToBackend = async (message) => {
    try {
        const response = await sendMessage(message, null);
        return {
            success: true,
            content: response.content
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// 發送圖片訊息到後端
export const sendImageToBackend = async (messageText, messageImage) => {
    try {
        const response = await sendMessage(messageText, messageImage);
        return {
            success: true,
            content: response.content
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// 發送畫布分析到後端
export const sendCanvasAnalysisToBackend = async (messageText, canvasImage) => {
    try {
        const response = await sendMessage(messageText || "請分析這張圖片", canvasImage);
        return {
            success: true,
            content: response.content
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

export const sendAIDrawingToBackend = async (messageText, canvasData) => {
    try {
        const result = await geminiService.generateImage(
            messageText || "請根據這張圖片生成新的內容", 
            canvasData
        );
        return result;
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};