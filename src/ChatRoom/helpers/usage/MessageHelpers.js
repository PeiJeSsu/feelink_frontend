// MessageHelpers.js - 修復版本

// 檢查內容是否為 Base64 圖片格式
export const isBase64Image = (content) => {
    if (!content || typeof content !== 'string') return false;
    
    // 檢查是否為 data URI 格式
    const dataURIPattern = /^data:image\/(png|jpeg|jpg|gif|bmp|webp);base64,/i;
    if (dataURIPattern.test(content)) return true;
    
    // 檢查是否為純 Base64 字串（可能需要添加 data URI 前綴）
    const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;
    if (base64Pattern.test(content) && content.length > 100) {
        return true;
    }
    
    return false;
};

// 將 Base64 字串轉換為完整的圖片 Data URI
export const convertToImageDataURI = (content) => {
    if (!content) return content;
    
    // 如果已經是完整的 data URI，直接返回
    if (content.startsWith('data:image/')) {
        return content;
    }
    
    // 如果是純 Base64 字串，添加 data URI 前綴
    if (isBase64Image(content)) {
        return `data:image/png;base64,${content}`;
    }
    
    return content;
};

// 改進的 ID 生成邏輯
export const generateUniqueMessageId = (dbMessage, fallbackId) => {
    // 優先使用資料庫的 messageId
    if (dbMessage.messageId && !isNaN(dbMessage.messageId)) {
        return Number(dbMessage.messageId);
    }
    
    // 如果有 sentAt，使用時間戳
    if (dbMessage.sentAt) {
        const timestamp = new Date(dbMessage.sentAt).getTime();
        if (!isNaN(timestamp)) {
            return timestamp;
        }
    }
    
    // 使用 fallback ID 或當前時間戳
    return fallbackId || Date.now();
};

// 將資料庫的 ChatMessage 轉換為前端使用的訊息格式
export const convertDBMessageToUIMessage = (dbMessage, index = 0) => {
    if (!dbMessage) return null;
    
    const content = dbMessage.content || '';
    const isImageContent = isBase64Image(content);
    
    // 使用改進的 ID 生成邏輯
    const messageId = generateUniqueMessageId(dbMessage, Date.now() + index);
    
    return {
        id: messageId,
        message: isImageContent ? convertToImageDataURI(content) : content,
        isUser: dbMessage.isUser || false,
        isImage: isImageContent,
        isDrawingData: dbMessage.isDrawingData || false,
        timestamp: formatTimestamp(dbMessage.sentAt),
        originalTimestamp: dbMessage.sentAt
    };
};

// 批量轉換資料庫訊息
export const convertDBMessagesToUIMessages = (dbMessages) => {
    if (!Array.isArray(dbMessages)) return [];
    
    return dbMessages
        .map((dbMessage, index) => convertDBMessageToUIMessage(dbMessage, index))
        .filter(message => message !== null) // 過濾掉無效的訊息
        .sort((a, b) => {
            const timeA = a.originalTimestamp ? new Date(a.originalTimestamp).getTime() : 0;
            const timeB = b.originalTimestamp ? new Date(b.originalTimestamp).getTime() : 0;
            return timeA - timeB;
        });
};

export const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return '';
        
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        
        if (isToday) {
            return date.toLocaleTimeString('zh-TW', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }
        
        return date.toLocaleString('zh-TW', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error('格式化時間戳記失敗:', error);
        return '';
    }
};

// 將 Blob 轉換為 Base64
export const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // 移除 data:image/... 前綴
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// 驗證訊息資料的完整性
export const validateMessageData = (message) => {
    if (!message) return false;
    
    const hasValidId = message.id && !isNaN(message.id);
    const hasContent = message.message || message.content;
    
    return !!(hasValidId && hasContent);
};

export const removeDuplicateMessages = (messages) => {
    if (!Array.isArray(messages)) return [];
    
    const seen = new Map();
    const validMessages = messages.filter(message => {
        // 先驗證訊息是否有效
        if (!validateMessageData(message)) {
            console.warn('發現無效訊息，已過濾:', message);
            return false;
        }
        
        return true;
    });
    
    return validMessages.filter(message => {
        const contentKey = typeof message.message === 'string' ? 
            message.message.substring(0, 50) : String(message.message);
        const key = `${message.id}_${contentKey}_${message.originalTimestamp || ''}`;
        
        if (seen.has(key)) {
            console.warn('發現重複訊息，已過濾:', message);
            return false;
        }
        
        seen.set(key, true);
        return true;
    });
};


export const ensureValidMessageIds = (messages) => {
    if (!Array.isArray(messages)) return [];
    
    return messages.map((message, index) => {
        if (!message.id || isNaN(message.id)) {
            console.warn('修復無效的訊息 ID:', message.id, '-> 使用時間戳 + index');
            return {
                ...message,
                id: Date.now() + index
            };
        }
        return message;
    });
};

// Debug 用的訊息檢查函數
export const debugMessages = (messages, context = '') => {
    console.group(`🔍 Debug Messages - ${context}`);
    console.log('訊息總數:', messages.length);
    
    const duplicateIds = [];
    const idMap = new Map();
    
    messages.forEach((msg, index) => {
        if (idMap.has(msg.id)) {
            duplicateIds.push({ id: msg.id, indices: [idMap.get(msg.id), index] });
        } else {
            idMap.set(msg.id, index);
        }
        
        if (isNaN(msg.id)) {
            console.error(`第 ${index} 條訊息 ID 為 NaN:`, msg);
        }
    });
    
    if (duplicateIds.length > 0) {
        console.error('發現重複 ID:', duplicateIds);
    }
    
    console.log(' ID 檢查完成');
    console.groupEnd();
    
    return messages;
};