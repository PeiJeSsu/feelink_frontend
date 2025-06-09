import { createNewMessage, handleError, addMessages, convertBlobToBase64 , initializeMessageId,getFullMessage,appendMessage} from "./MessageFactory";
import {
  sendTextToBackend,
  sendImageToBackend,
  sendCanvasAnalysisToBackend,
  sendAIDrawingToBackend
} from './ChatMessageDeliveryService';


// 處理 AI 繪圖結果
export const processDrawingResult = (result, currentId, messages, setMessages, canvas) => {
    const { clearCanvas, addImageToCanvas } = require("../../helpers/canvas/CanvasOperations");
    
    // 如果有文字回應，顯示出來
    if (result.message) {
        const { createNewMessage } = require("../helpers/MessageFactory");
        const textResponseMessage = createNewMessage(currentId, result.message, false, false);
        setMessages(prevMessages => [...prevMessages, textResponseMessage]);
        currentId++;
    }

    // 處理生成的圖片
    if (result.imageData && canvas) {
        clearCanvas(canvas);
        addImageToCanvas(canvas, `data:image/png;base64,${result.imageData}`);
    }

    return currentId;
};

export const handleSendTextMessage = async (messageText,messages,setMessages,setLoading,defaultQuestion = "",conversationCount = 1) => {
    if (!messageText) return;

    try {
        setLoading(true);
        const sendId = initializeMessageId(messages);

        const sendMessage = createNewMessage(sendId, messageText, true, false);
        setMessages(prevMessages => [...prevMessages, sendMessage]);

        const fullMessage = getFullMessage(messageText, conversationCount, defaultQuestion);

        const result = await sendTextToBackend(fullMessage);
        
        if (result.success) {
            appendMessage(sendId + 1, result.content,setMessages);

        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        handleError(error, '發送訊息失敗', messages, setMessages);
    } finally {
        setLoading(false);
    }
};

export const handleSendImageMessage = async (messageText, messageImage, messages, setMessages, setLoading) => {
    if (!messageText && !messageImage) return;

    try {
        setLoading(true);
        const currentId = initializeMessageId(messages);
        const finalId = addMessages(messageText, messageImage, currentId, messages, setMessages);

        const result = await sendImageToBackend(messageText, messageImage);
        
        if (result.success) {
            appendMessage(finalId, result.content,setMessages);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        handleError(error, '發送圖片失敗', messages, setMessages);
    } finally {
        setLoading(false);
    }
};

export const handleSendCanvasAnalysis = async (canvasImage, messageText, messages, setMessages, setLoading) => {
    if (!canvasImage) return;

    try {
        setLoading(true);
        const currentId = initializeMessageId(messages);
        const finalId = addMessages(messageText, canvasImage, currentId, messages, setMessages);

        const result = await sendCanvasAnalysisToBackend(messageText, canvasImage);
        
        if (result.success) {
            appendMessage(finalId, result.content, setMessages);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        handleError(error, '分析畫布失敗', messages, setMessages);
    } finally {
        setLoading(false);
    }
};

export const handleSendAIDrawing = async (canvasImage, messageText, messages, setMessages, setLoading, canvas) => {
    if (!canvasImage) return;

    try {
        setLoading(true);
        const currentId = initializeMessageId(messages);
        const finalId = addMessages(messageText, canvasImage, currentId, messages, setMessages);

        const canvasData = await convertBlobToBase64(canvasImage);

        const result = await sendAIDrawingToBackend(messageText, canvasData);
        
        if (result.success) {
            processDrawingResult(result, finalId, messages, setMessages, canvas);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        handleError(error, 'AI 畫圖失敗', messages, setMessages);
    } finally {
        setLoading(false);
    }
};