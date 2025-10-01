import {addMessages, appendMessage, getNewId, createNewMessage} from "./usage/MessageFactory";
import {sendAIDrawingToBackend, sendAIDrawingToBackendStream, sendCanvasAnalysisToBackend, sendCanvasAnalysisToBackendStreamService, sendImageToBackend, sendImageToBackendStreamService, sendTextToBackend, sendTextToBackendStream} from './MessageService';
import {convertBlobToBase64} from './usage/MessageHelpers'
import {handleError} from "./usage/MessageError";
import {clearCanvas, addImageToCanvas} from "../../helpers/canvas/CanvasOperations";

const handleStreamMessage = async (messageText, image, messages, setMessages, setLoading, setDisabled, chatroomId, updateCache, streamFunction, errorMessage) => {
    if (!messageText && !image) return;
    if (!chatroomId) {
        console.error('chatroomId is required for sending messages');
        return;
    }

    const currentId = getNewId(messages);
    const finalId = addMessages(messageText, image, currentId, messages, setMessages);
    
    setLoading(true);
    if (setDisabled) setDisabled(true);
    
    let responseMessageAdded = false;
    let displayedContent = "";
    let pendingQueue = [];
    let typewriterTimer = null;
    let isTypewriting = false;
    let streamCompleted = false;
    let aiResponseId = finalId;

    const ensureUnlocked = () => {
        setLoading(false);
        if (setDisabled) setDisabled(false);
    };

    // 清理所有資源的函數
    const cleanup = () => {
        if (typewriterTimer) {
            clearTimeout(typewriterTimer);
            typewriterTimer = null;
        }
        isTypewriting = false;
    };

    const typewriterEffect = () => {
        if (pendingQueue.length > 0) {
            isTypewriting = true;
            const nextChar = pendingQueue.shift();
            displayedContent += nextChar;

            setMessages(prevMessages => {
                return prevMessages.map(msg => {
                    if (msg.id === aiResponseId) {
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
                setMessages(prevMessages => {
                    if (updateCache) updateCache(prevMessages);
                    return prevMessages;
                });
                ensureUnlocked();
            }
        }
    };

    const startTypewriter = () => {
        if (!isTypewriting && pendingQueue.length > 0 && responseMessageAdded) {
            typewriterEffect();
        }
    };

    const onToken = (token) => {
        console.log('Token received:', token);
        
        if (!responseMessageAdded) {
            const responseMessage = createNewMessage(aiResponseId, "", false, false);
            setMessages(prevMessages => [...prevMessages, responseMessage]);
            setLoading(false);
            responseMessageAdded = true;
            console.log('AI 回應訊息已創建，ID:', aiResponseId);
        }
        
        if (token && typeof token === 'string') {
            for (const char of token) {
                pendingQueue.push(char);
            }
            startTypewriter();
        }
    };

    const onComplete = () => {
        console.log('Stream completed');
        streamCompleted = true;
        
        if (!isTypewriting && pendingQueue.length === 0) {
            setMessages(prevMessages => {
                if (updateCache) updateCache(prevMessages);
                return prevMessages;
            });
            ensureUnlocked();
        }
    };

    const onError = (error) => {
        console.error('Stream error:', error);
        
        cleanup();
        streamCompleted = true;
        
        if (!responseMessageAdded) {
            const errorMessageObj = createNewMessage(aiResponseId, "抱歉，發生了錯誤", false, false);
            setMessages(prevMessages => [...prevMessages, errorMessageObj]);
            responseMessageAdded = true;
        } else if (pendingQueue.length > 0) {
            displayedContent += pendingQueue.join('');
            setMessages(prevMessages => {
                return prevMessages.map(msg => {
                    if (msg.id === aiResponseId) {
                        return {...msg, message: displayedContent || "發生錯誤"};
                    }
                    return msg;
                });
            });
        }
        
        ensureUnlocked();
        handleError(error, errorMessage, messages, setMessages);
    };
    
    try {
        await streamFunction(messageText, image, chatroomId, onToken, onComplete, onError);
    } catch (error) {
        onError(error);
    }
};

// 處理 AI 繪圖串流的特殊函數
const handleAIDrawingStream = async (messageText, canvasImage, messages, setMessages, setLoading, setDisabled, canvas, chatroomId, updateCache) => {
    console.log('handleAIDrawingStream called with chatroomId:', chatroomId);
    if (!canvasImage) return;
    if (!chatroomId) {
        console.error('chatroomId is required for AI drawing');
        return;
    }

    const currentId = getNewId(messages);
    const canvasData = await convertBlobToBase64(canvasImage);
    const finalId = addMessages(messageText, canvasImage, currentId, messages, setMessages);
    setLoading(true);
    if (setDisabled) setDisabled(true);
    
    // 文字回應處理
    let textResponseMessageAdded = false;
    let displayedContent = "";
    let pendingQueue = [];
    let typewriterTimer = null;
    let isTypewriting = false;
    let textResponseId = finalId;

    const typewriterEffect = () => {
        if (pendingQueue.length > 0) {
            isTypewriting = true;
            displayedContent += pendingQueue.shift();

            setMessages(prevMessages => {
                return prevMessages.map(msg => {
                    if (msg.id === textResponseId) {
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
        console.log('AI Drawing Token received:', token);
        
        // 收到第一個字符時，加入 AI 文字回應訊息並關閉載入狀態
        if (!textResponseMessageAdded) {
            const responseMessage = createNewMessage(textResponseId, "", false, false);
            setMessages(prevMessages => [...prevMessages, responseMessage]);
            setLoading(false);
            textResponseMessageAdded = true;
        }
        
        for (const char of token) {
            pendingQueue.push(char);
        }
        startTypewriter();
    };

    const onImageGenerated = (imageData) => {
        console.log('Image generated, updating canvas');
        if (canvas && imageData) {
            try {
                clearCanvas(canvas);
                const imageDataUrl = `data:image/png;base64,${imageData}`;
                addImageToCanvas(canvas, imageDataUrl);
            } catch (error) {
                console.error('Error updating canvas with generated image:', error);
            }
        }
    };

    const onComplete = () => {
        console.log('AI Drawing stream completed');
        // 清理定時器
        if (typewriterTimer) {
            clearTimeout(typewriterTimer);
            typewriterTimer = null;
        }
        
        // 確保所有剩餘內容都顯示出來
        if (pendingQueue.length > 0) {
            displayedContent += pendingQueue.join('');
            pendingQueue = [];
            
            if (textResponseMessageAdded) {
                setMessages(prevMessages => {
                    const updatedMessages = prevMessages.map(msg => {
                        if (msg.id === textResponseId) {
                            return {...msg, message: displayedContent};
                        }
                        return msg;
                    });
                    // 串流完成時更新快取
                    if (updateCache) updateCache(updatedMessages);  // 新增這行
                    return updatedMessages;
                });
            }
        } else {
            // 即使沒有待處理內容，也要觸發快取更新
            setMessages(prevMessages => {
                if (updateCache) updateCache(prevMessages);  // 新增這行
                return prevMessages;
            });
        }
        
        if (setDisabled) setDisabled(false);
    };

    const onError = (error) => {
        if (typewriterTimer) {
            clearTimeout(typewriterTimer);
            typewriterTimer = null;
        }
        isTypewriting = false;
        
        // 如果還沒有加入 AI 回應訊息，在錯誤時加入空訊息
        if (!textResponseMessageAdded) {
            const responseMessage = createNewMessage(textResponseId, "", false, false);
            setMessages(prevMessages => [...prevMessages, responseMessage]);
            textResponseMessageAdded = true;
        }
        
        if (pendingQueue.length > 0) {
            displayedContent += pendingQueue.join('');
            setMessages(prevMessages => {
                return prevMessages.map(msg => {
                    if (msg.id === textResponseId) {
                        return {...msg, message: displayedContent};
                    }
                    return msg;
                });
            });
        }
        setLoading(false);
        if (setDisabled) setDisabled(false);
        handleError(error, 'AI 繪圖失敗', messages, setMessages);
    };

    try {
        await sendAIDrawingToBackendStream(messageText, canvasData, chatroomId, onToken, onComplete, onError, onImageGenerated);
    } catch (error) {
        handleError(error, 'AI 繪圖失敗', messages, setMessages);
        setLoading(false);
        if (setDisabled) setDisabled(false);
    }
};

// 帶打字機效果的任務執行器
const runMessageTaskWithTypewriter = async ({messageText, image = null, messages, setMessages, setLoading, setDisabled, chatroomId, generatePayload, sendFunction, onSuccess, onErrorMessage}) => {
    try {
        setLoading(true);
        if (setDisabled) setDisabled(true);

        const { finalId, payload } = await prepareMessageAndPayload(messageText, image, messages, setMessages, generatePayload);

        const result = await sendFunction(payload, chatroomId);
        
        if (result.success) {
            // 將 loading 和 disabled 的控制權交給 onSuccess 函數
            await onSuccess(result, finalId);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        // 只有在錯誤時才在這裡解除狀態
        setLoading(false);
        if (setDisabled) setDisabled(false);
        handleError(error, onErrorMessage, messages, setMessages);
    }
};

// 帶打字機效果的繪圖結果處理器
const processDrawingResultWithTypewriter = async (result, currentId, messages, setMessages, canvas, setLoading, setDisabled, updateCache) => {
    let actualResult = result;
    if (result.success && result.content) {
        actualResult = result.content;
    }

    // 處理文字回應 
    if (actualResult.message) {
        const textResponseMessage = createNewMessage(currentId, "", false, false);
        setMessages(prevMessages => [...prevMessages, textResponseMessage]);
        
        let displayedContent = "";
        setLoading(false);
        
        // 文字打字機效果
        for (let i = 0; i < actualResult.message.length; i++) {
            displayedContent += actualResult.message[i];
            const currentContent = displayedContent;
            const messageId = currentId;
            setMessages(prevMessages => {
                return prevMessages.map(msg => {
                    if (msg.id === messageId) {
                        return {...msg, message: currentContent};
                    }
                    return msg;
                });
            });
            await new Promise(resolve => setTimeout(resolve, 30));
        }
        currentId++;
    }

    // 處理圖片 - 更新畫布並添加到聊天室
    if (actualResult.imageData && canvas) {
        try {
            await new Promise(resolve => setTimeout(resolve, 500)); 
            
            // 更新畫布
            clearCanvas(canvas);
            const imageDataUrl = `data:image/png;base64,${actualResult.imageData}`;
            addImageToCanvas(canvas, imageDataUrl, { mode: 'fillViewport' });

            const imageMessage = createNewMessage(currentId, imageDataUrl, false, true);
            setMessages(prevMessages => [...prevMessages, imageMessage]);
            
            console.log('AI 生成的圖片已添加到聊天室');
            currentId++;

        } catch (error) {
            console.error('Error adding image to canvas:', error);
        }
    }
    
    if (setDisabled) setDisabled(false);

    if (updateCache) {
        setMessages(prevMessages => {
            updateCache(prevMessages);
            return prevMessages;
        });
    }

    return currentId;
};

// 文字訊息串流處理
export const handleSendTextMessageStream = async (messageText, messages, setMessages, setLoading, setDisabled, chatroomId, updateCacheOnly) => {
    return handleStreamMessage(
        messageText,
        null,
        messages,
        setMessages,
        setLoading,
        setDisabled,
        chatroomId,
        updateCacheOnly,
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

// 圖片訊息串流處理
export const handleSendImageMessageStream = async (messageText, messageImage, messages, setMessages, setLoading, setDisabled, chatroomId, updateCacheOnly) => {
    return handleStreamMessage(
        messageText,
        messageImage,
        messages,
        setMessages,
        setLoading,
        setDisabled,
        chatroomId,
        updateCacheOnly,
        (text, image, chatroomId, onToken, onComplete, onError) => {
            sendImageToBackendStreamService(text, image, chatroomId, onToken, onComplete, onError);
        },
        '發送圖片失敗'
    );
};

// 畫布分析流式處理
export const handleSendCanvasAnalysisStream = async (canvasImage, messageText, messages, setMessages, setLoading, setDisabled, chatroomId, updateCacheOnly) => {
    return handleStreamMessage(
        messageText,
        canvasImage,
        messages,
        setMessages,
        setLoading,
        setDisabled,
        chatroomId,
        updateCacheOnly,
        (text, image, chatroomId, onToken, onComplete, onError) => {
            sendCanvasAnalysisToBackendStreamService(text, image, chatroomId, onToken, onComplete, onError);
        },
        '分析畫布失敗'
    );
};

export const handleSendAIDrawingStream = async (canvasImage, messageText, messages, setMessages, setLoading, setDisabled, canvas, chatroomId, updateCache) => {
    return handleAIDrawingStream(messageText, canvasImage, messages, setMessages, setLoading, setDisabled, canvas, chatroomId, updateCache);
};

const handleAIDrawingWithTypewriter = async (messageText, canvasImage, messages, setMessages, setLoading, setDisabled, canvas, chatroomId, updateCache) => {
    console.log('handleAIDrawingWithTypewriter called with chatroomId:', chatroomId);
    if (!canvasImage) return;
    if (!chatroomId) {
        console.error('chatroomId is required for AI drawing');
        return;
    }
    
    const canvasData = await convertBlobToBase64(canvasImage);

    await runMessageTaskWithTypewriter({
        messageText,
        image: canvasImage,
        messages,
        setMessages,
        setLoading,
        setDisabled,
        chatroomId,
        generatePayload: () => Promise.resolve({ text: messageText, imageData: canvasData }),
        sendFunction: ({ text, imageData }, chatroomId) => sendAIDrawingToBackend(text, imageData, chatroomId),
        onSuccess: (result, finalId) => {
            return processDrawingResultWithTypewriter(result, finalId, messages, setMessages, canvas, setLoading, setDisabled, updateCache);
        },
        onErrorMessage: 'AI 畫圖失敗',
    });
};

export const handleSendAIDrawingWithTypewriter = async (canvasImage, messageText, messages, setMessages, setLoading, setDisabled, canvas, chatroomId, updateCache) => {
    return handleAIDrawingWithTypewriter(messageText, canvasImage, messages, setMessages, setLoading, setDisabled, canvas, chatroomId, updateCache);
};

// 一般文字訊息處理
export const handleSendTextMessage = async (messageText, messages, setMessages, setLoading, setDisabled, chatroomId, defaultQuestion = "", conversationCount = 1) => {
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
        setDisabled,
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

// 圖片訊息處理
export const handleSendImageMessage = async (messageText, messageImage, messages, setMessages, setLoading, setDisabled, chatroomId) => {
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
        setDisabled,
        chatroomId,
        generatePayload: () => Promise.resolve({ text: messageText, image: messageImage }),
        sendFunction: (payload, chatroomId) => sendImageToBackend(payload.text, payload.image, chatroomId),
        onSuccess: (res, finalId) => appendMessage(finalId, res.content, setMessages),
        onErrorMessage: '發送圖片失敗',
    });
};

// 畫布分析處理
export const handleSendCanvasAnalysis = async (canvasImage, messageText, messages, setMessages, setLoading, setDisabled, chatroomId) => {
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
        setDisabled,
        chatroomId,
        generatePayload: () => Promise.resolve({ text: messageText, image: canvasImage }),
        sendFunction: (payload, chatroomId) => sendCanvasAnalysisToBackend(payload.text, payload.image, chatroomId),
        onSuccess: (res, finalId) => appendMessage(finalId, res.content, setMessages),
        onErrorMessage: '分析畫布失敗',
    });
};


export const handleSendAIDrawing = async (canvasImage, messageText, messages, setMessages, setLoading, setDisabled, canvas, chatroomId) => {
    return handleSendAIDrawingWithTypewriter(canvasImage, messageText, messages, setMessages, setLoading, setDisabled, canvas, chatroomId);
};

// 物件生成功能
export const handleSendGenerateObject = async (canvasImage, messageText, messages, setMessages, setLoading, setDisabled, canvas, chatroomId, updateCache) => {
    if (!canvasImage) return;
    if (!chatroomId) {
        console.error('chatroomId is required for object generation');
        return;
    }
    
    const canvasData = await convertBlobToBase64(canvasImage);

    await runMessageTask({
        messageText,
        image: canvasImage,
        messages,
        setMessages,
        setLoading,
        setDisabled,
        chatroomId,
        generatePayload: () => Promise.resolve({ text: messageText, imageData: canvasData, mode: 'generateObject' }),
        sendFunction: ({ text, imageData, mode }, chatroomId) => sendAIDrawingToBackend(text, imageData, chatroomId, mode),
        onSuccess: (result, finalId) => {
            return processGenerateObjectResult(result, finalId, messages, setMessages, canvas, setLoading, setDisabled, updateCache);
        },
        onErrorMessage: 'AI 生成物件失敗',
    });
};

// 通用訊息處理函數
const runMessageTask = async ({messageText, image = null, messages, setMessages, setLoading, setDisabled, chatroomId, generatePayload, sendFunction, onSuccess, onErrorMessage}) => {
    try {
        setLoading(true);
        if (setDisabled) setDisabled(true);

        const { finalId, payload } = await prepareMessageAndPayload(messageText, image, messages, setMessages, generatePayload);

        const result = await sendFunction(payload, chatroomId);
        
        if (result.success) {
            // 將控制權交給 onSuccess，不在這裡解除狀態
            await onSuccess(result, finalId);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        setLoading(false);
        if (setDisabled) setDisabled(false);
        handleError(error, onErrorMessage, messages, setMessages);
    }
};

// 保持不變的輔助函數
const prepareMessageAndPayload = async (messageText, image, messages, setMessages, generatePayloadFn) => {
    const currentId = getNewId(messages);
    const finalId = addMessages(messageText, image, currentId, messages, setMessages);
    const payload = await generatePayloadFn();
    return { finalId, payload };
};

const processGenerateObjectResult = async (result, currentId, messages, setMessages, canvas, setLoading, setDisabled, updateCache) => {
    let actualResult = result;
    if (result.success && result.content) {
        actualResult = result.content;
        console.log('Found nested content:', actualResult); 
    }
    setLoading(false);
    
    // 處理文字回應
    if (actualResult.message) {
        const textResponseMessage = createNewMessage(currentId, "", false, false);
        setMessages(prevMessages => [...prevMessages, textResponseMessage]);
        
        let displayedContent = "";
        for (let i = 0; i < actualResult.message.length; i++) {
            displayedContent += actualResult.message[i];
            const currentContent = displayedContent;
            const messageId = currentId;
            setMessages(prevMessages => {
                return prevMessages.map(msg => {
                    if (msg.id === messageId) {
                        return {...msg, message: currentContent};
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
            
            // 更新畫布
            addImageToCanvas(canvas, imageDataUrl, { 
                mode: 'originalSize', 
                targetPosition: targetPosition,
                maxSize: 200 
            });
            
            // 添加圖片訊息到聊天室（base64 直接放在 message 字段）
            const imageMessage = createNewMessage(currentId, imageDataUrl, false, true);
            setMessages(prevMessages => [...prevMessages, imageMessage]);
            console.log('生成的物件圖片已添加到聊天室');
            
            // 清除儲存的位置
            delete canvas._generateObjectPosition;
            
            // 恢復畫布交互功能
            canvas.selection = true;
            canvas.getObjects().forEach(obj => {
                obj.selectable = true;
                obj.evented = true;
            });
            
            currentId++;
            
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
    
    if (updateCache) {
        setMessages(prevMessages => {
            updateCache(prevMessages);
            return prevMessages;
        });
    }

    return currentId;
};