import { useState, useRef } from 'react';
import {
	handleSendText,
	handleSendImage,
	handleMessageChange,
	handleImageChange
} from "../helpers/HandleTextInput";

export function useTextInput(onSendMessage, onUploadImage, disabled) {
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

	return {
		message,
		textInputRef,
		imageInputRef,
		sendText,
		sendImage,
		messageChange,
		imageChange,
		setMessage
	};
}
