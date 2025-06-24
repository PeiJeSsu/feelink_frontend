import {addMessages, appendMessage, getNewId} from "./usage/MessageFactory";
import {sendAIDrawingToBackend, sendCanvasAnalysisToBackend, sendImageToBackend, sendTextToBackend} from './MessageService';
import {convertBlobToBase64, getFullMessage} from './usage/MessageHelpers'
import {handleError} from "./usage/MessageError";

export const handleSendTextMessage = async (messageText, messages, setMessages, setLoading, defaultQuestion = "", conversationCount = 1) => {
    if (!messageText) return;

    await runMessageTask({
        messageText,
        image: null,
        messages,
        setMessages,
        setLoading,
        generatePayload: () => Promise.resolve(getFullMessage(messageText, conversationCount, defaultQuestion)),
        sendFunction: (payload) => sendTextToBackend(payload),
        onSuccess: (res, finalId) => appendMessage(finalId, res.content, setMessages),
        onErrorMessage: '發送訊息失敗',
    });
};

export const handleSendImageMessage = async (messageText, messageImage, messages, setMessages, setLoading) => {
    if (!messageText && !messageImage) return;

    await runMessageTask({
        messageText,
        image: messageImage,
        messages,
        setMessages,
        setLoading,
        generatePayload: () => Promise.resolve({ text: messageText, image: messageImage }),
        sendFunction: ({ text, image }) => sendImageToBackend(text, image),
        onSuccess: (res, finalId) => appendMessage(finalId, res.content, setMessages),
        onErrorMessage: '發送圖片失敗',
    });
};

export const handleSendCanvasAnalysis = async (canvasImage, messageText, messages, setMessages, setLoading) => {
    if (!canvasImage) return;

    await runMessageTask({
        messageText,
        image: canvasImage,
        messages,
        setMessages,
        setLoading,
        generatePayload: () => Promise.resolve({ text: messageText, image: canvasImage }),
        sendFunction: ({ text, image }) => sendCanvasAnalysisToBackend(text, image),
        onSuccess: (res, finalId) => appendMessage(finalId, res.content, setMessages),
        onErrorMessage: '分析畫布失敗',
    });
};

export const handleSendAIDrawing = async (canvasImage, messageText, messages, setMessages, setLoading, canvas) => {
    if (!canvasImage) return;

    const canvasData = await convertBlobToBase64(canvasImage);

    await runMessageTask({
        messageText,
        image: canvasImage,
        messages,
        setMessages,
        setLoading,
        generatePayload: () => Promise.resolve({ text: messageText, imageData: canvasData }),
        sendFunction: ({ text, imageData }) => sendAIDrawingToBackend(text, imageData),
        onSuccess: (res, finalId) =>
            processDrawingResult(res, finalId, messages, setMessages, canvas),
        onErrorMessage: 'AI 畫圖失敗',
    });
};

const runMessageTask = async ({messageText, image = null, messages, setMessages, setLoading, generatePayload, sendFunction, onSuccess, onErrorMessage,}) => {
    try {
        setLoading(true);

        const { finalId, payload } = await prepareMessageAndPayload(messageText, image, messages, setMessages, generatePayload);

        const result = await sendFunction(payload);
        handleResult(result, res => onSuccess(res, finalId));
    } catch (error) {
        handleError(error, onErrorMessage, messages, setMessages);
    } finally {
        setLoading(false);
    }
};

const prepareMessageAndPayload = async (messageText, image, messages, setMessages, generatePayloadFn) => {
    const currentId = getNewId(messages);
    const finalId = addMessages(messageText, image, currentId, messages, setMessages);

    const payload = await generatePayloadFn();
    return { finalId, payload };
};

const handleResult = (result, onSuccess) => {
    if (result.success) {
        onSuccess(result);
    } else {
        throw new Error(result.error);
    }
};

const processDrawingResult = (result, currentId, messages, setMessages, canvas) => {
    const { clearCanvas, addImageToCanvas } = require("../../helpers/canvas/CanvasOperations");

    // 如果有文字回應，顯示出來
    if (result.message) {
        const { createNewMessage } = require("./usage/MessageFactory");
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