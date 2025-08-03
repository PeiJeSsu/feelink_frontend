import {addMessages, appendMessage, getNewId} from "./usage/MessageFactory";
import {sendAIDrawingToBackend, sendCanvasAnalysisToBackend, sendCanvasAnalysisToBackendStreamService, sendImageToBackend, sendImageToBackendStreamService, sendTextToBackend, sendTextToBackendStream} from './MessageService';
import {convertBlobToBase64} from './usage/MessageHelpers'
import {handleError} from "./usage/MessageError";

const handleStreamMessage = async (messageText, image, messages, setMessages, setLoading, streamFunction, errorMessage) => {
    if (!messageText && !image) return;

    const currentId = getNewId(messages);
    const finalId = addMessages(messageText, image, currentId, messages, setMessages);
    setLoading(true);
    const responseMessage = {
        id: finalId,
        message: "",
        isUser: false,
        isImage: false
    };
    setMessages(prevMessages => [...prevMessages, responseMessage]);
    let displayedContent = "";
    let pendingQueue = [];
    let typewriterTimer = null;
    let isTypewriting = false;
    let streamCompleted = false;

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
            if (streamCompleted) {
                setLoading(false);
            }
        }
    };

    const startTypewriter = () => {
        if (!isTypewriting && pendingQueue.length > 0) {
            typewriterEffect();
        }
    };

    const onToken = (token) => {
        console.log('Token received:', token);
        for (let i = 0; i < token.length; i++) {
            pendingQueue.push(token[i]);
        }
        startTypewriter();
    };

    const onComplete = () => {
        console.log('Stream completed');
        streamCompleted = true;
        if (!isTypewriting && pendingQueue.length === 0) {
            setLoading(false);
        }
    };

    const onError = (error) => {
        if (typewriterTimer) {
            clearTimeout(typewriterTimer);
            typewriterTimer = null;
        }
        isTypewriting = false;
        streamCompleted = true;
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
        await streamFunction(messageText, image, onToken, onComplete, onError);
    } catch (error) {
        onError(error);
    }
};


export const handleSendTextMessageStream = async (messageText, messages, setMessages, setLoading) => {
    return handleStreamMessage(
        messageText,
        null,
        messages,
        setMessages,
        setLoading,
        (text, image, onToken, onComplete, onError) => {
            sendTextToBackendStream(
                { text: text },
                onToken,
                onComplete,
                onError
            );
        },
        '發送訊息失敗'
    );
};
export const handleSendImageMessageStream = async (messageText, messageImage, messages, setMessages, setLoading) => {
    return handleStreamMessage(
        messageText,
        messageImage,
        messages,
        setMessages,
        setLoading,
        (text, image, onToken, onComplete, onError) => {
            sendImageToBackendStreamService(text, image, onToken, onComplete, onError);
        },
        '發送圖片失敗'
    );
};

// 畫布分析流式處理
export const handleSendCanvasAnalysisStream = async (canvasImage, messageText, messages, setMessages, setLoading) => {
    return handleStreamMessage(
        messageText,
        canvasImage,
        messages,
        setMessages,
        setLoading,
        (text, image, onToken, onComplete, onError) => {
            sendCanvasAnalysisToBackendStreamService(text, image, onToken, onComplete, onError);
        },
        '分析畫布失敗'
    );
};

export const handleSendTextMessage = async (messageText, messages, setMessages, setLoading, defaultQuestion = "", conversationCount = 1) => {
    if (!messageText) return;

    await runMessageTask({
        messageText,
        image: null,
        messages,
        setMessages,
        setLoading,
        generatePayload: () => Promise.resolve({
            text: messageText,
            conversationCount: conversationCount,
            hasDefaultQuestion: !!defaultQuestion
        }),
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

    if (!messageText && !canvasImage) return;
    const currentId = getNewId(messages);
    const finalId = addMessages(messageText, canvasImage, currentId, messages, setMessages);
    setLoading(true);

    let responseMessageAdded = false;
    try {
        const result = await sendAIDrawingToBackend(messageText || "請根據這張圖片生成新的內容", canvasData);

        if (result.success) {
            const content = result.content;

            if (content.message) {
                let displayedContent = "";
                for (let i = 0; i < content.message.length; i++) {
                    displayedContent += content.message[i];
                    if (!responseMessageAdded) {
                        const responseMessage = {
                            id: finalId,
                            message: "",
                            isUser: false,
                            isImage: false
                        };
                        setMessages(prevMessages => [...prevMessages, responseMessage]);
                        setLoading(false);
                        responseMessageAdded = true;
                    }
                    setMessages(prevMessages => {
                        return prevMessages.map(msg => {
                            if (msg.id === finalId) {
                                return {...msg, message: displayedContent};
                            }
                            return msg;
                        });
                    });
                    await new Promise(resolve => setTimeout(resolve, 30));
                }
            }
            if (content.imageData) {
                if (!responseMessageAdded) {
                    const responseMessage = {
                        id: finalId,
                        message: "",
                        isUser: false,
                        isImage: false
                    };
                    setMessages(prevMessages => [...prevMessages, responseMessage]);
                    setLoading(false);
                    responseMessageAdded = true;
                }

                await new Promise(resolve => setTimeout(resolve, 500));

                if (canvas) {
                    const { clearCanvas, addImageToCanvas } = require("../../helpers/canvas/CanvasOperations");
                    try {
                        clearCanvas(canvas);
                        const imageDataUrl = `data:image/png;base64,${content.imageData}`;
                        addImageToCanvas(canvas, imageDataUrl);
                    } catch (error) {
                        console.error('Error adding image to canvas:', error);
                    }
                }
                setMessages(prevMessages => {
                    return prevMessages.map(msg => {
                        if (msg.id === finalId) {
                            return {
                                ...msg,
                                imageData: content.imageData,
                                hasImage: true
                            };
                        }
                        return msg;
                    });
                });
            }
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
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
        setLoading(false);
        handleError(error, 'AI 畫圖失敗', messages, setMessages);
    }

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