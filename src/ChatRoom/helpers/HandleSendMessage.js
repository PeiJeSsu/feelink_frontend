import {sendMessage} from "./HandleSendMessageApiConn";

export const handleSendTextMessage = (messageText, messages, setMessages, setLoading) => {
    if (!messageText) return;

    const sendId = getNewId(messages);
    saveSendTextMessage(sendId, messageText, setMessages, setLoading);
    const receiveId = sendId+1;
    saveReceiveMessage(receiveId, messageText, null, setMessages, setLoading);
};

export const handleSendImageMessage = (messageText, messageImage, messages, setMessages, setLoading) =>{
    if (!messageText && !messageImage) return;

    const sendTextId = getNewId(messages);
    saveSendTextMessage(sendTextId, messageText, setMessages, setLoading);
    const sendImageId = sendTextId + (messageText ? 1 : 0);
    saveSendImageMessage(sendImageId, messageImage, setMessages, setLoading);
    const receiveId = sendImageId+1;
    saveReceiveMessage(receiveId, messageText, messageImage, setMessages, setLoading);
};

const getNewId = (messages) => {
    return messages.length > 0
        ? Math.max(...messages.map(m => m.id)) + 1
        : 1;
};

const saveSendTextMessage = (id, messageText, setMessages, setLoading) => {
    if (!messageText) return;

    const sendTextMessage = createNewMessage(id, messageText, true, false);
    setMessage(sendTextMessage, setMessages, setLoading, true);
};

const saveSendImageMessage = (id, messageImage, setMessages, setLoading) => {
    const reader = new FileReader();

    reader.onload = (e) => {
        const imageDataUrl = e.target.result;
        const sendImage = createNewMessage(id, imageDataUrl, true, true);
        setMessage(sendImage, setMessages, setLoading, true);
    }

    reader.readAsDataURL(messageImage);
};

const saveReceiveMessage = (id, messageText, messageImage, setMessages, setLoading) => {
    sendMessage(messageText, messageImage)
        .then(response => {
            const receiveMessage = createNewMessage(id, response.content, false, false);
            setMessage(receiveMessage, setMessages, setLoading, false);
        })
        .catch(error => {
            console.error('發送訊息錯誤:', error);
            setLoading(false);
        });
};

const createNewMessage = (id, message, isUser, isImage) => {
    return {
        id: id,
        message: message,
        isUser: isUser,
        isImage: isImage
    };
};

const setMessage = (newMessage, setMessages, setLoading, isLoading) => {
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setLoading(isLoading);
};