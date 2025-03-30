import { useState } from "react";
import { handleSendImageMessage, handleSendTextMessage } from "../helpers/HandleSendMessage";

export default function useChatMessages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const sendTextMessage = (messageText) => {
        handleSendTextMessage(messageText, messages, setMessages, setLoading);
    };

    const sendImageMessage = (messageText, messageImage) => {
        handleSendImageMessage(messageText, messageImage, messages, setMessages, setLoading);
    };

    return { messages, loading, sendTextMessage, sendImageMessage };
}