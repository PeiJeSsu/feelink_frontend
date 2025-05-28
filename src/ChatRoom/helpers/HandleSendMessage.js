import { getNewId, createNewMessage, handleError, addMessages, convertBlobToBase64 } from "../utils/MessageUtils";
import { sendTextToBackend, sendImageToBackend, sendCanvasAnalysisToBackend, sendAIDrawingToBackend } from "../services/MessageApiService";
import { getFullMessage, processDrawingResult } from "../processors/MessageProcessor";

export const handleSendTextMessage = async (
    messageText,
    messages,
    setMessages,
    setLoading,
    defaultQuestion = "",
    conversationCount = 1
) => {
    if (!messageText) return;

    try {
        setLoading(true);
        const sendId = getNewId(messages);

        const sendMessage = createNewMessage(sendId, messageText, true, false);
        setMessages(prevMessages => [...prevMessages, sendMessage]);

        const fullMessage = getFullMessage(messageText, conversationCount, defaultQuestion);

        const result = await sendTextToBackend(fullMessage);
        
        if (result.success) {
            const response = createNewMessage(sendId + 1, result.content, false, false);
            setMessages(prevMessages => [...prevMessages, response]);
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
        const baseId = getNewId(messages);
        let currentId = baseId;
        currentId = addMessages(messageText, messageImage, currentId, messages, setMessages);

        const result = await sendImageToBackend(messageText, messageImage);
        
        if (result.success) {
            const response = createNewMessage(currentId, result.content, false, false);
            setMessages(prevMessages => [...prevMessages, response]);
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
        const baseId = getNewId(messages);
        let currentId = baseId;
        currentId = addMessages(messageText, canvasImage, currentId, messages, setMessages);

        const result = await sendCanvasAnalysisToBackend(messageText, canvasImage);
        
        if (result.success) {
            const analysisMessage = createNewMessage(
                currentId,
                result.content,
                false,
                false
            );
            setMessages(prevMessages => [...prevMessages, analysisMessage]);
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
        const baseId = getNewId(messages);
        let currentId = baseId;

        currentId = addMessages(messageText, canvasImage, currentId, messages, setMessages);

        const canvasData = await convertBlobToBase64(canvasImage);

        const result = await sendAIDrawingToBackend(messageText, canvasData);
        
        if (result.success) {
            processDrawingResult(result, currentId, messages, setMessages, canvas);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        handleError(error, 'AI 畫圖失敗', messages, setMessages);
    } finally {
        setLoading(false);
    }
};