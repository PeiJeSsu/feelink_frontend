import {addMessages, appendMessage, getNewId, createNewMessage} from "./usage/MessageFactory";
import {sendAIDrawingToBackend, sendAIDrawingToBackendStream, sendCanvasAnalysisToBackend, sendCanvasAnalysisToBackendStreamService, sendImageToBackend, sendImageToBackendStreamService, sendTextToBackend, sendTextToBackendStream} from './MessageService';
import {convertBlobToBase64} from './usage/MessageHelpers'
import {handleError} from "./usage/MessageError";
import {clearCanvas, addImageToCanvas} from "../../helpers/canvas/CanvasOperations";

// 流式訊息處理函數
const handleStreamMessage = async (messageText, image, messages, setMessages, setLoading, setDisabled, chatroomId, streamFunction, errorMessage) => {
    console.log('handleStreamMessage called with chatroomId:', chatroomId);
    if (!messageText && !image) return;
    if (!chatroomId) {
        console.error('chatroomId is required for sending messages');
        return;
    }

    // 確保獲得有效的 ID
    const currentId = getNewId(messages);
    const finalId = addMessages(messageText, image, currentId, messages, setMessages);
    
    setLoading(true);
    if (setDisabled) setDisabled(true);
    
    // 修復串流回應處理邏輯
    let responseMessageAdded = false;
    let displayedContent = "";
    let pendingQueue = [];
    let typewriterTimer = null;
    let isTypewriting = false;
    let streamCompleted = false;
    let aiResponseId = finalId; // AI 回應的 ID

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
                if (setDisabled) setDisabled(false);
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
        
        // 收到第一個字符時，創建 AI 回應訊息
        if (!responseMessageAdded) {
            const responseMessage = createNewMessage(aiResponseId, "", false, false);
            setMessages(prevMessages => [...prevMessages, responseMessage]);
            setLoading(false); // 收到第一個字符時關閉載入狀態
            responseMessageAdded = true;
            console.log('AI 回應訊息已創建，ID:', aiResponseId);
        }
        
        // 將 token 加入佇列
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
        
        // 清理定時器
        if (typewriterTimer) {
            clearTimeout(typewriterTimer);
            typewriterTimer = null;
        }
        
        // 確保所有剩餘內容都顯示出來
        if (pendingQueue.length > 0) {
            displayedContent += pendingQueue.join('');
            pendingQueue = [];
            
            if (responseMessageAdded) {
                setMessages(prevMessages => {
                    return prevMessages.map(msg => {
                        if (msg.id === aiResponseId) {
                            return {...msg, message: displayedContent};
                        }
                        return msg;
                    });
                });
            }
        }
        
        if (!isTypewriting && setDisabled) {
            setDisabled(false);
        }
    };

    const onError = (error) => {
        console.error('Stream error:', error);
        
        // 清理定時器
        if (typewriterTimer) {
            clearTimeout(typewriterTimer);
            typewriterTimer = null;
        }
        isTypewriting = false;
        streamCompleted = true;
        
        // 如果還沒有加入 AI 回應訊息，在錯誤時加入錯誤訊息
        if (!responseMessageAdded) {
            const errorMessageObj = createNewMessage(aiResponseId, "抱歉，發生了錯誤", false, false);
            setMessages(prevMessages => [...prevMessages, errorMessageObj]);
            responseMessageAdded = true;
        } else if (pendingQueue.length > 0) {
            // 顯示所有剩餘內容
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
        
        setLoading(false);
        if (setDisabled) setDisabled(false);
        handleError(error, errorMessage, messages, setMessages);
    };
    
    try {
        await streamFunction(messageText, image, chatroomId, onToken, onComplete, onError);
    } catch (error) {
        onError(error);
    }
};

// 處理 AI 繪圖串流的特殊函數
const handleAIDrawingStream = async (messageText, canvasImage, messages, setMessages, setLoading, setDisabled, canvas, chatroomId) => {
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
                    return prevMessages.map(msg => {
                        if (msg.id === textResponseId) {
                            return {...msg, message: displayedContent};
                        }
                        return msg;
                    });
                });
            }
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
        handleResult(result, res => onSuccess(res, finalId));
    } catch (error) {
        handleError(error, onErrorMessage, messages, setMessages);
    } finally {
        setLoading(false);
        if (setDisabled) setDisabled(false);
    }
};

// 帶打字機效果的繪圖結果處理器
const processDrawingResultWithTypewriter = async (result, currentId, messages, setMessages, canvas, setLoading, setDisabled) => {
    let actualResult = result;
    if (result.success && result.content) {
        actualResult = result.content;
    }

    // 處理文字回應 - 使用打字機效果
    if (actualResult.message) {
        const textResponseMessage = createNewMessage(currentId, "", false, false);
        setMessages(prevMessages => [...prevMessages, textResponseMessage]);
        setLoading(false); // 開始顯示文字時關閉載入狀態
        
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
            await new Promise(resolve => setTimeout(resolve, 30)); // 30ms 延遲
        }
        currentId++;
    }

    // 處理圖片 - 直接更新畫布
    if (actualResult.imageData && canvas) {
        try {
            await new Promise(resolve => setTimeout(resolve, 500)); // 等待文字顯示完成
            
            clearCanvas(canvas);
            const imageDataUrl = `data:image/png;base64,${actualResult.imageData}`;
            addImageToCanvas(canvas, imageDataUrl, { mode: 'fillViewport' });

            // 更新訊息以包含圖片數據（供歷史記錄使用）
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

// 文字訊息串流處理
export const handleSendTextMessageStream = async (messageText, messages, setMessages, setLoading, setDisabled, chatroomId) => {
    return handleStreamMessage(
        messageText,
        null,
        messages,
        setMessages,
        setLoading,
        setDisabled,
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

// 圖片訊息串流處理
export const handleSendImageMessageStream = async (messageText, messageImage, messages, setMessages, setLoading, setDisabled, chatroomId) => {
    return handleStreamMessage(
        messageText,
        messageImage,
        messages,
        setMessages,
        setLoading,
        setDisabled,
        chatroomId,
        (text, image, chatroomId, onToken, onComplete, onError) => {
            sendImageToBackendStreamService(text, image, chatroomId, onToken, onComplete, onError);
        },
        '發送圖片失敗'
    );
};

// 畫布分析流式處理
export const handleSendCanvasAnalysisStream = async (canvasImage, messageText, messages, setMessages, setLoading, setDisabled, chatroomId) => {
    return handleStreamMessage(
        messageText,
        canvasImage,
        messages,
        setMessages,
        setLoading,
        setDisabled,
        chatroomId,
        (text, image, chatroomId, onToken, onComplete, onError) => {
            sendCanvasAnalysisToBackendStreamService(text, image, chatroomId, onToken, onComplete, onError);
        },
        '分析畫布失敗'
    );
};

export const handleSendAIDrawingStream = async (canvasImage, messageText, messages, setMessages, setLoading, setDisabled, canvas, chatroomId) => {
    return handleAIDrawingStream(messageText, canvasImage, messages, setMessages, setLoading, setDisabled, canvas, chatroomId);
};

// 修復：帶打字機效果的AI繪圖處理函數
const handleAIDrawingWithTypewriter = async (messageText, canvasImage, messages, setMessages, setLoading, setDisabled, canvas, chatroomId) => {
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
            return processDrawingResultWithTypewriter(result, finalId, messages, setMessages, canvas, setLoading, setDisabled);
        },
        onErrorMessage: 'AI 畫圖失敗',
    });
};

export const handleSendAIDrawingWithTypewriter = async (canvasImage, messageText, messages, setMessages, setLoading, setDisabled, canvas, chatroomId) => {
    return handleAIDrawingWithTypewriter(messageText, canvasImage, messages, setMessages, setLoading, setDisabled, canvas, chatroomId);
};

// 修復：一般文字訊息處理
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

// 修復：圖片訊息處理
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

// 修復：畫布分析處理
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

// AI 繪圖功能（使用模擬打字機效果版本）
export const handleSendAIDrawing = async (canvasImage, messageText, messages, setMessages, setLoading, setDisabled, canvas, chatroomId) => {
    // 使用帶打字機效果的版本（非串流 API + 前端打字機模擬）
    return handleSendAIDrawingWithTypewriter(canvasImage, messageText, messages, setMessages, setLoading, setDisabled, canvas, chatroomId);
};

// 物件生成功能
export const handleSendGenerateObject = async (canvasImage, messageText, messages, setMessages, setLoading, setDisabled, canvas, chatroomId) => {
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
            return processGenerateObjectResult(result, finalId, messages, setMessages, canvas, setLoading, setDisabled);
        },
        onErrorMessage: 'AI 生成物件失敗',
    });
};

// 修復：通用訊息處理函數
const runMessageTask = async ({messageText, image = null, messages, setMessages, setLoading, setDisabled, chatroomId, generatePayload, sendFunction, onSuccess, onErrorMessage}) => {
    try {
        setLoading(true);
        if (setDisabled) setDisabled(true);

        const { finalId, payload } = await prepareMessageAndPayload(messageText, image, messages, setMessages, generatePayload);

        const result = await sendFunction(payload, chatroomId);
        handleResult(result, res => onSuccess(res, finalId));
    } catch (error) {
        handleError(error, onErrorMessage, messages, setMessages);
    } finally {
        setLoading(false);
        if (setDisabled) setDisabled(false);
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

const processDrawingResult = async (result, currentId, messages, setMessages, canvas, setLoading, setDisabled) => {
    let actualResult = result;
    if (result.success && result.content) {
        actualResult = result.content;
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