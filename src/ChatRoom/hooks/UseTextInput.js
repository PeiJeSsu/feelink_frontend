import { useState, useRef } from 'react';
import {
	handleSendText,
	handleSendImage,
	handleMessageChange,
	handleImageChange,
	handleAnalyzeCanvas,
	handleAIDrawing,
	handleGenerateObject,
	handleKeyDown
} from "../helpers/TextInputHandlers";

export function useTextInput(onSendMessage, onUploadImage, onAnalyzeCanvas, onAIDrawing, onGenerateObject, disabled) {
	const [message, setMessage] = useState('');
	const textInputRef = useRef(null);
	const imageInputRef = useRef(null);

	const sendText = () => {
		handleSendText(message, setMessage, onSendMessage, disabled);
	};

	const sendImage = () => {
		handleSendImage(imageInputRef);
	};

	const messageChange = (e) => {
		handleMessageChange(e, setMessage);
	};

	const imageChange = (e) => {
		handleImageChange(e, message, setMessage, onUploadImage);
	};

	const analyzeCanvas = () => {
		handleAnalyzeCanvas(message, setMessage, onAnalyzeCanvas);
	};

	const aiDrawing = () => {
		handleAIDrawing(message, setMessage, onAIDrawing);
	};

	const generateObject = () => {
		handleGenerateObject(message, setMessage, onGenerateObject);
	};

	const keyDown = (e) => {
		handleKeyDown(e, message, setMessage, onSendMessage, disabled);
	};

	return {
		message,
		textInputRef,
		imageInputRef,
		sendText,
		sendImage,
		messageChange,
		imageChange,
		setMessage,
		handleAnalyzeCanvas: analyzeCanvas,
		handleAIDrawing: aiDrawing,
		handleGenerateObject: generateObject,
		handleKeyDown: keyDown
	};
}
