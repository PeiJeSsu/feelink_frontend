import * as React from 'react';
import { Box, TextField } from '@mui/material';
import FunctionButton from './FunctionButton';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InputIcon from '@mui/icons-material/Input';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { useTextInput } from '../hooks/UseTextInput';
import { isValidMessage } from '../helpers/HandleTextInput';
import { containerStyle, buttonContainerStyle, textFieldStyle } from '../styles/TextInputStyles';
import PropTypes from "prop-types";

export default function TextInputArea({ onSendMessage, onSendImage, onAnalyzeCanvas, disabled }) {
	const{
		message,
		textInputRef,
		imageInputRef,
		sendText,
		sendImage,
		messageChange,
		imageChange,
		setMessage
	} = useTextInput(onSendMessage, onSendImage, disabled);

	const handleAnalyzeCanvas = () => {
		onAnalyzeCanvas(message);
		setMessage('');
	};

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
				<Box sx={{ display: 'flex', gap: '8px' }}>
					<FunctionButton
						aria-label="上傳圖片"
						icon={<AssignmentIcon />}
						onClick={sendImage}
						disabled={disabled}
					/>
					<FunctionButton
						aria-label="分析畫布"
						icon={<AnalyticsIcon />}
						onClick={handleAnalyzeCanvas}
						disabled={disabled}
						sx={{ 
							borderColor: '#6D28D9',
							color: '#6D28D9',
							'&:hover': {
								borderColor: '#5B21B6',
								backgroundColor: 'rgba(109, 40, 217, 0.04)',
							}
						}}
					/>
				</Box>
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

TextInputArea.propTypes = {
	onSendMessage: PropTypes.func.isRequired,
	onSendImage: PropTypes.func.isRequired,
	onAnalyzeCanvas: PropTypes.func.isRequired,
	disabled: PropTypes.bool
};
