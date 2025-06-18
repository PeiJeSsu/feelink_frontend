import { createNewMessage, handleError, addMessages, convertBlobToBase64, initializeMessageId, getFullMessage, appendMessage } from "./MessageFactory";
import {
  sendTextToBackend,
  sendImageToBackend,
  sendCanvasAnalysisToBackend,
  sendAIDrawingToBackend
} from './ChatMessageDeliveryService';


const handleMessageFlow = async (config) => {
    const {
        validateParams,prepareMessage,sendService,processSuccess,errorMessage,messages,setMessages,setLoading
    } = config;


    if (!validateParams()) return;

    try {
        setLoading(true);
        const currentId = initializeMessageId(messages);
        

        const preparedData = await prepareMessage(currentId, messages, setMessages);

        const result = await sendService(preparedData);
        
        if (result.success) {
            await processSuccess(result, preparedData, setMessages);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        handleError(error, errorMessage, messages, setMessages);
    } finally {
        setLoading(false);
    }
};

export const handleSendTextMessage = async (messageText, messages, setMessages, setLoading, defaultQuestion = "", conversationCount = 1) => {
    await handleMessageFlow({
        validateParams: () => !!messageText,
        
        prepareMessage: async (currentId, messages, setMessages) => {
            const sendMessage = createNewMessage(currentId, messageText, true, false);
            setMessages(prevMessages => [...prevMessages, sendMessage]);
            
            const fullMessage = getFullMessage(messageText, conversationCount, defaultQuestion);
            return { sendId: currentId, fullMessage };
        },
        
        sendService: ({ fullMessage }) => sendTextToBackend(fullMessage),
        
        processSuccess: async (result, { sendId }, setMessages) => {
            appendMessage(sendId + 1, result.content, setMessages);
        },
        
        errorMessage: '發送訊息失敗',
        messages,
        setMessages,
        setLoading
    });
};

export const handleSendImageMessage = async (messageText, messageImage, messages, setMessages, setLoading) => {
    await handleMessageFlow({
        validateParams: () => messageText || messageImage,
        
        prepareMessage: async (currentId, messages, setMessages) => {
            const finalId = addMessages(messageText, messageImage, currentId, messages, setMessages);
            return { finalId, messageText, messageImage };
        },
        
        sendService: ({ messageText, messageImage }) => sendImageToBackend(messageText, messageImage),
        
        processSuccess: async (result, { finalId }, setMessages) => {
            appendMessage(finalId, result.content, setMessages);
        },
        
        errorMessage: '發送圖片失敗',
        messages,
        setMessages,
        setLoading
    });
};

export const handleSendCanvasAnalysis = async (canvasImage, messageText, messages, setMessages, setLoading) => {
    await handleMessageFlow({
        validateParams: () => !!canvasImage,
        
        prepareMessage: async (currentId, messages, setMessages) => {
            const finalId = addMessages(messageText, canvasImage, currentId, messages, setMessages);
            return { finalId, messageText, canvasImage };
        },
        
        sendService: ({ messageText, canvasImage }) => sendCanvasAnalysisToBackend(messageText, canvasImage),
        
        processSuccess: async (result, { finalId }, setMessages) => {
            appendMessage(finalId, result.content, setMessages);
        },
        
        errorMessage: '分析畫布失敗',
        messages,
        setMessages,
        setLoading
    });
};

export const handleSendAIDrawing = async (canvasImage, messageText, messages, setMessages, setLoading, canvas) => {
    await handleMessageFlow({
        validateParams: () => !!canvasImage,
        
        prepareMessage: async (currentId, messages, setMessages) => {
            const finalId = addMessages(messageText, canvasImage, currentId, messages, setMessages);
            const canvasData = await convertBlobToBase64(canvasImage);
            return { finalId, messageText, canvasData, canvas };
        },
        
        sendService: ({ messageText, canvasData }) => sendAIDrawingToBackend(messageText, canvasData),
        
        processSuccess: async (result, { finalId, canvas }, setMessages) => {
            processDrawingResult(result, finalId, messages, setMessages, canvas);
        },
        
        errorMessage: 'AI 畫圖失敗',
        messages,
        setMessages,
        setLoading
    });
};

export const processDrawingResult = (result, currentId, messages, setMessages, canvas) => {
    const { clearCanvas, addImageToCanvas } = require("../../helpers/canvas/CanvasOperations");
    
    if (result.message) {
        const { createNewMessage } = require("../helpers/MessageFactory");
        const textResponseMessage = createNewMessage(currentId, result.message, false, false);
        setMessages(prevMessages => [...prevMessages, textResponseMessage]);
        currentId++;
    }

    if (result.imageData && canvas) {
        clearCanvas(canvas);
        addImageToCanvas(canvas, `data:image/png;base64,${result.imageData}`);
    }

    return currentId;
};