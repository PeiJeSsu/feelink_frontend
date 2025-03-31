import { useState } from "react";
import { handleSendImageMessage, handleSendTextMessage, handleSendCanvasAnalysis } from "../helpers/HandleSendMessage";

export default function useChatMessages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const sendTextMessage = (messageText) => {
        handleSendTextMessage(messageText, messages, setMessages, setLoading);
    };

    const sendImageMessage = (messageText, messageImage) => {
        handleSendImageMessage(messageText, messageImage, messages, setMessages, setLoading);
    };

    const sendCanvasAnalysis = async (canvasImage, messageText) => {
        handleSendCanvasAnalysis(canvasImage, messageText, messages, setMessages, setLoading);
    };

    return { messages, loading, sendTextMessage, sendImageMessage, sendCanvasAnalysis };
}