import {addMessages, appendMessage, getNewId} from "./usage/MessageFactory";
import {sendAIDrawingToBackend, sendCanvasAnalysisToBackend, sendCanvasAnalysisToBackendStreamService, sendImageToBackend, sendImageToBackendStreamService, sendTextToBackend, sendTextToBackendStream} from './MessageService';
import {convertBlobToBase64} from './usage/MessageHelpers'
import {handleError} from "./usage/MessageError";

// 修改：添加 chatroomId 參數到流式處理函數
const handleStreamMessage = async (messageText, image, messages, setMessages, setLoading, chatroomId, streamFunction, errorMessage) => {
    console.log('handleStreamMessage called with chatroomId:', chatroomId);
    if (!messageText && !image) return;
    if (!chatroomId) {
        console.error('chatroomId is required for sending messages');
        return;
    }

    const currentId = getNewId(messages);
    const finalId = addMessages(messageText, image, currentId, messages, setMessages);
    setLoading(true);
    
    // 不立即加入 AI 回應訊息，等到第一個字符到達時再加入
    let responseMessageAdded = false;
    let displayedContent = "";
    let pendingQueue = [];
    let typewriterTimer = null;
    let isTypewriting = false;

    const typewriterEffect = () => {
        if (pendingQueue.length > 0) {
            isTypewriting = true;
            displayedContent += pendingQueue.shift();

            setMessages(prevMessages => {
                return prevMessages.map(msg => {
                    if (msg.id === finalId) {
                        return {...msg, message: displayedContent};
                    }
                    return msg;
                });
            });
            typewriterTimer = setTimeout(typewriterEffect, 30);
        } else {
            isTypewriting = false;
            typewriterTimer = null;
        }
    };

    const startTypewriter = () => {
        if (!isTypewriting && pendingQueue.length > 0) {
            typewriterEffect();
        }
    };

    const onToken = (token) => {
        console.log('Token received:', token);
        
        // 收到第一個字符時，加入 AI 回應訊息並關閉載入狀態
        if (!responseMessageAdded) {
            const responseMessage = {
                id: finalId,
                message: "",
                isUser: false,
                isImage: false
            };
            setMessages(prevMessages => [...prevMessages, responseMessage]);
            setLoading(false); // 收到第一個字符時關閉載入狀態
            responseMessageAdded = true;
        }
        
        for (const char of token) {
            pendingQueue.push(char);
        }
        startTypewriter();
    };

    const onComplete = () => {
        console.log('Stream completed');
    };

    const onError = (error) => {
        if (typewriterTimer) {
            clearTimeout(typewriterTimer);
            typewriterTimer = null;
        }
        isTypewriting = false;
        
        // 如果還沒有加入 AI 回應訊息，在錯誤時加入空訊息
        if (!responseMessageAdded) {
            const responseMessage = {
                id: finalId,
                message: "",
                isUser: false,
                isImage: false
            };
            setMessages(prevMessages => [...prevMessages, responseMessage]);
            responseMessageAdded = true;
        }
        
        if (pendingQueue.length > 0) {
            displayedContent += pendingQueue.join('');
            setMessages(prevMessages => {
                return prevMessages.map(msg => {
                    if (msg.id === finalId) {
                        return {...msg, message: displayedContent};
                    }
                    return msg;
                });
            });
        }
        setLoading(false);
        handleError(error, errorMessage, messages, setMessages);
    };
    
    try {
        await streamFunction(messageText, image, chatroomId, onToken, onComplete, onError);
    } catch (error) {
        onError(error);
    }
};

// 修改：添加 chatroomId 參數
export const handleSendTextMessageStream = async (messageText, messages, setMessages, setLoading, chatroomId) => {
    return handleStreamMessage(
        messageText,
        null,
        messages,
        setMessages,
        setLoading,
        chatroomId,
        (text, image, chatroomId, onToken, onComplete, onError) => {
            sendTextToBackendStream(
                { text: text },
                chatroomId,
                onToken,
                onComplete,
                onError
            );
        },
        '發送訊息失敗'
    );
};

// 修改：添加 chatroomId 參數
export const handleSendImageMessageStream = async (messageText, messageImage, messages, setMessages, setLoading, chatroomId) => {
    return handleStreamMessage(
        messageText,
        messageImage,
        messages,
        setMessages,
        setLoading,
        chatroomId,
        (text, image, chatroomId, onToken, onComplete, onError) => {
            sendImageToBackendStreamService(text, image, chatroomId, onToken, onComplete, onError);
        },
        '發送圖片失敗'
    );
};

// 修改：畫布分析流式處理，添加 chatroomId 參數
export const handleSendCanvasAnalysisStream = async (canvasImage, messageText, messages, setMessages, setLoading, chatroomId) => {
    return handleStreamMessage(
        messageText,
        canvasImage,
        messages,
        setMessages,
        setLoading,
        chatroomId,
        (text, image, chatroomId, onToken, onComplete, onError) => {
            sendCanvasAnalysisToBackendStreamService(text, image, chatroomId, onToken, onComplete, onError);
        },
        '分析畫布失敗'
    );
};

// 修改：添加 chatroomId 參數
export const handleSendTextMessage = async (messageText, messages, setMessages, setLoading, chatroomId, defaultQuestion = "", conversationCount = 1) => {
    if (!messageText) return;
    if (!chatroomId) {
        console.error('chatroomId is required for sending messages');
        return;
    }

    await runMessageTask({
        messageText,
        image: null,
        messages,
        setMessages,
        setLoading,
        chatroomId,
        generatePayload: () => Promise.resolve({
            text: messageText,
            conversationCount: conversationCount,
            hasDefaultQuestion: !!defaultQuestion
        }),
        sendFunction: (payload, chatroomId) => sendTextToBackend(payload, chatroomId),
        onSuccess: (res, finalId) => appendMessage(finalId, res.content, setMessages),
        onErrorMessage: '發送訊息失敗',
    });
};

// 修改：添加 chatroomId 參數
export const handleSendImageMessage = async (messageText, messageImage, messages, setMessages, setLoading, chatroomId) => {
    if (!messageText && !messageImage) return;
    if (!chatroomId) {
        console.error('chatroomId is required for sending messages');
        return;
    }

    await runMessageTask({
        messageText,
        image: messageImage,
        messages,
        setMessages,
        setLoading,
        chatroomId,
        generatePayload: () => Promise.resolve({ text: messageText, image: messageImage }),
        sendFunction: (payload, chatroomId) => sendImageToBackend(payload.text, payload.image, chatroomId),
        onSuccess: (res, finalId) => appendMessage(finalId, res.content, setMessages),
        onErrorMessage: '發送圖片失敗',
    });
};

// 修改：添加 chatroomId 參數
export const handleSendCanvasAnalysis = async (canvasImage, messageText, messages, setMessages, setLoading, chatroomId) => {
    if (!canvasImage) return;
    if (!chatroomId) {
        console.error('chatroomId is required for sending messages');
        return;
    }

    await runMessageTask({
        messageText,
        image: canvasImage,
        messages,
        setMessages,
        setLoading,
        chatroomId,
        generatePayload: () => Promise.resolve({ text: messageText, image: canvasImage }),
        sendFunction: (payload, chatroomId) => sendCanvasAnalysisToBackend(payload.text, payload.image, chatroomId),
        onSuccess: (res, finalId) => appendMessage(finalId, res.content, setMessages),
        onErrorMessage: '分析畫布失敗',
    });
};

// 🎯 修改：AI 繪圖功能，添加 chatroomId 參數
export const handleSendAIDrawing = async (canvasImage, messageText, messages, setMessages, setLoading, canvas, chatroomId) => {
    if (!canvasImage) return;
    if (!chatroomId) {
        console.error('chatroomId is required for AI drawing');
        return;
    }
    
    const canvasData = await convertBlobToBase64(canvasImage);

    await runMessageTask({
        messageText,
        image: canvasImage,
        messages,
        setMessages,
        setLoading,
        chatroomId,
        generatePayload: () => Promise.resolve({ text: messageText, imageData: canvasData }),
        sendFunction: ({ text, imageData }, chatroomId) => sendAIDrawingToBackend(text, imageData, chatroomId),
        onSuccess: (result, finalId) => {
            return processDrawingResult(result, finalId, messages, setMessages, canvas);
        },
        onErrorMessage: 'AI 畫圖失敗',
    });
};

// 修改：更新 runMessageTask 函數來處理 chatroomId
const runMessageTask = async ({messageText, image = null, messages, setMessages, setLoading, chatroomId, generatePayload, sendFunction, onSuccess, onErrorMessage}) => {
    try {
        setLoading(true);

        const { finalId, payload } = await prepareMessageAndPayload(messageText, image, messages, setMessages, generatePayload);

        const result = await sendFunction(payload, chatroomId);
        handleResult(result, res => onSuccess(res, finalId));
    } catch (error) {
        handleError(error, onErrorMessage, messages, setMessages);
    } finally {
        setLoading(false);
    }
};

// 保持不變的輔助函數
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
    const { createNewMessage } = require("./usage/MessageFactory");
    let actualResult = result;
    if (result.success && result.content) {
        actualResult = result.content;
        console.log('Found nested content:', actualResult); 
    }

    if (actualResult.message) {
        const textResponseMessage = createNewMessage(currentId, actualResult.message, false, false);
        setMessages(prevMessages => [...prevMessages, textResponseMessage]);
        currentId++;
    }

    if (actualResult.imageData && canvas) {
        try {
            clearCanvas(canvas);
            const imageDataUrl = `data:image/png;base64,${actualResult.imageData}`;
            addImageToCanvas(canvas, imageDataUrl);
        } catch (error) {
            console.error('Error adding image to canvas:', error); 
        }
    } else {
        console.log('Missing data:', { 
            hasImageData: !!actualResult.imageData, 
            hasCanvas: !!canvas,
            actualResult: actualResult
        });
    }

    return currentId;
};