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

// 將資料庫的 ChatMessage 轉換為前端使用的訊息格式
export const convertDBMessageToUIMessage = (dbMessage) => {
    if (!dbMessage) return null;
    
    const content = dbMessage.content || '';
    const isImageContent = isBase64Image(content);
    
    return {
        id: dbMessage.messageId || Date.now().toString(),
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
        .map(convertDBMessageToUIMessage)
        .filter(message => message !== null) // 過濾掉無效的訊息
        .sort((a, b) => {
            // 依照時間戳記排序（舊到新）
            const timeA = a.originalTimestamp ? new Date(a.originalTimestamp).getTime() : 0;
            const timeB = b.originalTimestamp ? new Date(b.originalTimestamp).getTime() : 0;
            return timeA - timeB;
        });
};

// 格式化時間戳記顯示
export const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        // 如果是今天
        if (diffDays === 0) {
            if (diffMins < 1) return '剛剛';
            if (diffMins < 60) return `${diffMins} 分鐘前`;
            if (diffHours < 24) return `${diffHours} 小時前`;
        }
        
        // 如果是昨天
        if (diffDays === 1) {
            return `昨天 ${date.toLocaleTimeString('zh-TW', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            })}`;
        }
        
        // 如果是更早的日期
        if (diffDays < 7) {
            return `${diffDays} 天前`;
        }
        
        // 超過一週，顯示完整日期
        return date.toLocaleString('zh-TW', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } catch (error) {
        console.error('格式化時間戳記失敗:', error);
        return '';
    }
};

// 將 Blob 轉換為 Base64（保持原有功能）
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
    
    const hasValidId = message.id || message.messageId;
    const hasContent = message.message || message.content;
    
    return !!(hasValidId && hasContent);
};

// 清理重複的訊息（基於 ID 和時間戳記）
export const removeDuplicateMessages = (messages) => {
    if (!Array.isArray(messages)) return [];
    
    const seen = new Set();
    return messages.filter(message => {
        const key = `${message.id}_${message.originalTimestamp}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
};