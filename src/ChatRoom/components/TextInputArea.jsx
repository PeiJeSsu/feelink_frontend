import * as React from 'react';
import { Box, TextField } from '@mui/material';
import FunctionButton from './FunctionButton';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InputIcon from '@mui/icons-material/Input';
import { useTextInput } from '../hooks/UseTextInput';
import { isValidMessage } from '../helpers/HandleTextInput';
import { containerStyle, buttonContainerStyle, textFieldStyle } from '../styles/TextInputStyles';

export default function TextInputArea({ onSendMessage, onSendImage, disabled }) {
	const{
		message,
		textInputRef,
		imageInputRef,
		sendText,
		sendImage,
		messageChange,
		imageChange
	} = useTextInput(onSendMessage, onSendImage, disabled);

	return (
		<Box sx={containerStyle}>
			<Box sx={buttonContainerStyle}>
				<input
					type="file"
					accept="image/*"
					ref={imageInputRef}
					style={{ display: 'none' }}
					onChange={imageChange}
				/>
				<FunctionButton
					aria-label="上傳圖片"
					icon={<AssignmentIcon />}
					onClick={sendImage}
					disabled={disabled}
				/>
				<FunctionButton
					aria-label="輸入"
					icon={<InputIcon />}
					onClick={sendText}
					disabled={disabled || !isValidMessage(message)}
				/>
			</Box>
			<TextField
				ref={textInputRef}
				multiline
				minRows={1}
				maxRows={3}
				variant="standard"
				value={message}
				onChange={messageChange}
				placeholder="輸入訊息..."
				disabled={disabled}
				sx={textFieldStyle}
			/>
		</Box>
	);
}
