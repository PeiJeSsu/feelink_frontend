import { useState, useRef, useEffect, useCallback } from "react";
import { createNewMessage } from "../helpers/usage/MessageFactory";
import { handleSendImageMessage, handleSendTextMessage, handleSendCanvasAnalysis, handleSendAIDrawing, handleSendTextMessageStream, handleSendImageMessageStream, handleSendCanvasAnalysisStream} from "../helpers/MessageController";

const predefinedQuestions = [
    "最近過得如何，有沒有發生甚麼有趣或難過的事？",
    "今天的心情如何呢",
    "最近有沒有讓你開心或困擾的事呢？"
];

export default function useChatMessages(canvas) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [conversationCount, setConversationCount] = useState(0);
    const questionAdded = useRef(false);

    const sendTextMessageStream = useCallback((messageText, defaultQuestion = "", conversationCount = 1) => {
        return handleSendTextMessageStream(messageText, messages, setMessages, setLoading, defaultQuestion, conversationCount);
    }, [messages, setMessages, setLoading]);

    const sendImageMessageStream = useCallback((messageText, messageImage) => {
        return handleSendImageMessageStream(messageText, messageImage, messages, setMessages, setLoading);
    }, [messages, setMessages, setLoading]);

    const sendCanvasAnalysisStream = useCallback(async (messageText) => {
        try {
            const blob = await convertCanvasToBlob();
            await handleSendCanvasAnalysisStream(blob, messageText, messages, setMessages, setLoading);
        } catch (error) {
            console.error(error.message);
        }
    }, [messages, setMessages, setLoading, canvas]);

    const sendTextMessage = (messageText) => {
        const nextCount = conversationCount + 1; 
        setConversationCount(nextCount); 
        handleSendTextMessage(messageText, messages, setMessages, setLoading, currentQuestion, nextCount);
    };

    const sendImageMessage = (messageText, messageImage) => {
        handleSendImageMessage(messageText, messageImage, messages, setMessages, setLoading);
    };

    const sendCanvasAnalysis = async (messageText) => {
        try {
            const blob = await convertCanvasToBlob();
            await handleSendCanvasAnalysis(blob, messageText, messages, setMessages, setLoading);
        } catch (error) {
            console.error(error.message);
        }
    };

    const sendAIDrawing = async (messageText) => {
        try {
            const blob = await convertCanvasToBlob();
            await handleSendAIDrawing(blob, messageText, messages, setMessages, setLoading, canvas);
        } catch (error) {
            console.error(error.message);
        }
    };

    const addSystemMessage = useCallback((text) => {
        setCurrentQuestion(text);
        setMessages((prevMessages) => [
            ...prevMessages,
            createNewMessage(Date.now(), text, false, false)
        ]);
    }, []);

    useEffect(() => {
        if (messages.length === 0 && !questionAdded.current) {
            const randomQuestion = predefinedQuestions[Math.floor(Math.random() * predefinedQuestions.length)];
            addSystemMessage(randomQuestion);
            questionAdded.current = true;
        }
    }, [messages, addSystemMessage]);

    const convertCanvasToBlob = useCallback(async () => {
        if (!canvas) {
            throw new Error('沒有可用的畫布');
        }
        const dataUrl = canvas.toDataURL('image/png');
        return await (await fetch(dataUrl)).blob();
    }, [canvas]);

    return { 
        messages, 
        loading, 
        predefinedQuestions, 
        sendTextMessage, 
        sendImageMessage, 
        sendCanvasAnalysis, 
        sendAIDrawing, 
        addSystemMessage,
        sendTextMessageStream,
        sendImageMessageStream,
        sendCanvasAnalysisStream
    };
}