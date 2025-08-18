import {addMessages, getNewId, createNewMessage} from "./usage/MessageFactory";
import {sendAIDrawingToBackend, sendCanvasAnalysisToBackendStreamService, sendImageToBackendStreamService, sendTextToBackendStream} from './MessageService';
import {convertBlobToBase64} from './usage/MessageHelpers'
import {handleError} from "./usage/MessageError";
import {clearCanvas, addImageToCanvas} from "../../helpers/canvas/CanvasOperations";

const handleStreamMessage = async ({messageText, image = null, messages, setMessages, setLoading, setDisabled, generatePayload, streamFunction, onSuccess, onErrorMessage}) => {
    if (!messageText && !image) return;
    try {
        setLoading(true);
        setDisabled(true);
        const currentId = getNewId(messages);
        const finalId = addMessages(messageText, image, currentId, messages, setMessages);
        const payload = await generatePayload();

        let responseMessageAdded = false;
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
                    setDisabled(false);
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

            for (const char of token) {
                pendingQueue.push(char);
            }
            startTypewriter();
        };

        const onComplete = () => {
            console.log('Stream completed');
            streamCompleted = true;
            if (!isTypewriting) {
                setDisabled(false);
            }
            onSuccess && onSuccess({ content: displayedContent }, finalId);
        };

        const onError = (error) => {
            if (typewriterTimer) {
                clearTimeout(typewriterTimer);
                typewriterTimer = null;
            }
            isTypewriting = false;
            streamCompleted = true;

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
            setDisabled(false);
            handleError(error, onErrorMessage, messages, setMessages);
        };
        await streamFunction(payload, onToken, onComplete, onError);
    } catch (error) {
        handleError(error, onErrorMessage, messages, setMessages);
        setLoading(false);
        setDisabled(false);
    }
};

export const handleSendTextMessageStream = async (messageText, messages, setMessages, setLoading, setDisabled) => {
    return handleStreamMessage({
        messageText,
        image: null,
        messages,
        setMessages,
        setLoading,
        setDisabled,
        generatePayload: () => Promise.resolve({ text: messageText }),
        streamFunction: (payload, onToken, onComplete, onError) => {
            sendTextToBackendStream(
                payload,
                onToken,
                onComplete,
                onError
            );
        },
        onSuccess: () => {},
        onErrorMessage: '發送訊息失敗'
    });
};

export const handleSendImageMessageStream = async (messageText, messageImage, messages, setMessages, setLoading, setDisabled) => {
    return handleStreamMessage({
        messageText,
        image: messageImage,
        messages,
        setMessages,
        setLoading,
        setDisabled,
        generatePayload: () => Promise.resolve({ text: messageText, image: messageImage }),
        streamFunction: (payload, onToken, onComplete, onError) => {
            sendImageToBackendStreamService(payload.text, payload.image, onToken, onComplete, onError);
        },
        onSuccess: () => {},
        onErrorMessage: '發送圖片失敗'
    });
};

export const handleSendCanvasAnalysisStream = async (canvasImage, messageText, messages, setMessages, setLoading, setDisabled) => {
    return handleStreamMessage({
        messageText,
        image: canvasImage,
        messages,
        setMessages,
        setLoading,
        setDisabled,
        generatePayload: () => Promise.resolve({ text: messageText, image: canvasImage }),
        streamFunction: (payload, onToken, onComplete, onError) => {
            sendCanvasAnalysisToBackendStreamService(payload.text, payload.image, onToken, onComplete, onError);
        },
        onSuccess: () => {},
        onErrorMessage: '分析畫布失敗'
    });
};

export const handleSendAIDrawing = async (canvasImage, messageText, messages, setMessages, setLoading, setDisabled , canvas) => {
    if (!canvasImage) return;
    const canvasData = await convertBlobToBase64(canvasImage);

    await runMessageTask({
        messageText,
        image: canvasImage,
        messages,
        setMessages,
        setLoading,
        setDisabled,
        generatePayload: () => Promise.resolve({ text: messageText, imageData: canvasData, mode: 'drawing' }),
        sendFunction: ({ text, imageData, mode }) => sendAIDrawingToBackend(text, imageData, mode),
        onSuccess: (result, finalId) => {
            return processDrawingResult(result, finalId, messages, setMessages, canvas,setLoading,setDisabled);
        },
        onErrorMessage: 'AI 畫圖失敗',
    });
};

export const handleSendGenerateObject = async (canvasImage, messageText, messages, setMessages, setLoading, setDisabled, canvas) => {
    if (!canvasImage) return;
    
    const canvasData = await convertBlobToBase64(canvasImage);

    await runMessageTask({
        messageText,
        image: canvasImage,
        messages,
        setMessages,
        setLoading,
        setDisabled,
        generatePayload: () => Promise.resolve({ text: messageText, imageData: canvasData, mode: 'generateObject' }),
        sendFunction: ({ text, imageData, mode }) => sendAIDrawingToBackend(text, imageData, mode),
        onSuccess: (result, finalId) => {
            return processGenerateObjectResult(result, finalId, messages, setMessages, canvas, setLoading, setDisabled);
        },
        onErrorMessage: 'AI 生成物件失敗',
    });
};

const runMessageTask = async ({messageText, image = null, messages, setMessages, setLoading, setDisabled,  generatePayload, sendFunction, onSuccess, onErrorMessage,}) => {
    try {
        setLoading(true);
        if (setDisabled) setDisabled(true);
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

const processDrawingResult = async (result, currentId, messages, setMessages, canvas, setLoading, setDisabled) => {
    let actualResult = result;
    if (result.success && result.content) {
        actualResult = result.content;
    }
    if (actualResult.message) {
        const textResponseMessage = createNewMessage(currentId, "", false, false);
        setMessages(prevMessages => [...prevMessages, textResponseMessage]);
        setLoading(false)
        let displayedContent = "";
        for (let i = 0; i < actualResult.message.length; i++) {
            displayedContent += actualResult.message[i];
            setMessages(prevMessages => {
                return prevMessages.map(msg => {
                    if (msg.id === currentId) {
                        return {...msg, message: displayedContent};
                    }
                    return msg;
                });
            });
            await new Promise(resolve => setTimeout(resolve, 30));
        }
        currentId++;
    }

    if (actualResult.imageData && canvas) {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            clearCanvas(canvas);
            const imageDataUrl = `data:image/png;base64,${actualResult.imageData}`;
            addImageToCanvas(canvas, imageDataUrl, { mode: 'fillViewport' });

            setMessages(prevMessages => {
                return prevMessages.map(msg => {
                    if (msg.id === currentId - 1) {
                        return {
                            ...msg,
                            imageData: actualResult.imageData,
                            hasImage: true
                        };
                    }
                    return msg;
                });
            });
        } catch (error) {
            console.error('Error adding image to canvas:', error);
        }
    }
    if (setDisabled) setDisabled(false);
    return currentId;
};

const processGenerateObjectResult = async (result, currentId, messages, setMessages, canvas, setLoading, setDisabled) => {
    let actualResult = result;
    if (result.success && result.content) {
        actualResult = result.content;
        console.log('Found nested content:', actualResult); 
    }

    if (actualResult.message) {
        const textResponseMessage = createNewMessage(currentId, "", false, false);
        setMessages(prevMessages => [...prevMessages, textResponseMessage]);
        setLoading(false);
        let displayedContent = "";
        for (let i = 0; i < actualResult.message.length; i++) {
            displayedContent += actualResult.message[i];
            setMessages(prevMessages => {
                return prevMessages.map(msg => {
                    if (msg.id === currentId) {
                        return {...msg, message: displayedContent};
                    }
                    return msg;
                });
            });
            await new Promise(resolve => setTimeout(resolve, 30));
        }
        currentId++;
    }

    if (actualResult.imageData && canvas) {
        try {
            const imageDataUrl = `data:image/png;base64,${actualResult.imageData}`;
            // 取得儲存的點擊位置
            const targetPosition = canvas._generateObjectPosition || null;
            console.log('讀取到的點擊位置:', targetPosition);
            addImageToCanvas(canvas, imageDataUrl, { 
                mode: 'originalSize', 
                targetPosition: targetPosition,
                maxSize: 200 
            });
            // 清除儲存的位置
            delete canvas._generateObjectPosition;
            // 恢復畫布交互功能
            canvas.selection = true;
            canvas.getObjects().forEach(obj => {
                obj.selectable = true;
                obj.evented = true;
            });
        } catch (error) {
            console.error('Error adding generated object to canvas:', error); 
        }
    } else {
        console.log('Missing data:', { 
            hasImageData: !!actualResult.imageData, 
            hasCanvas: !!canvas,
            actualResult: actualResult
        });
    }
    if (setDisabled) setDisabled(false);
    return currentId;
};