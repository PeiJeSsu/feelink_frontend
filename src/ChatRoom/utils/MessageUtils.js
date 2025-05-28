// 取得新訊息的 ID
export const getNewId = (messages) => {
    return messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 0;
};

// 創建新訊息物件
export const createNewMessage = (id, message, isUser, isImage) => {
    return {
        id,
        message,
        isUser,
        isImage
    };
};

// 處理訊息錯誤
export const handleError = (error, errorPrefix, messages, setMessages) => {
    console.error(`${errorPrefix}:`, error);
    const errorMessage = createNewMessage(
        getNewId(messages) + 1,
        "抱歉，處理訊息時發生錯誤。",
        false,
        false
    );
    setMessages(prevMessages => [...prevMessages, errorMessage]);
};

// 添加使用者訊息到聊天
export const addMessages = (messageText, messageImage, currentId, messages, setMessages) => {
    let newId = currentId;

    // 如果有文字訊息，先發送文字
    if (messageText) {
        const textMessage = createNewMessage(newId, messageText, true, false);
        setMessages(prevMessages => [...prevMessages, textMessage]);
        newId++;
    }

    // 發送圖片
    if (messageImage) {
        const imageUrl = URL.createObjectURL(messageImage);
        const imageMessage = createNewMessage(newId, imageUrl, true, true);
        setMessages(prevMessages => [...prevMessages, imageMessage]);
        newId++;
    }

    return newId;
};

// 將 Blob 轉換為 base64
export const convertBlobToBase64 = async (blob) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};