import { Box, TextField, Button, IconButton } from "@mui/material";
import { 
    AutoAwesomeOutlined as AutoAwesomeOutlinedIcon, 
    BrokenImageOutlined as BrokenImageOutlinedIcon, 
    Send as SendIcon 
} from "@mui/icons-material";
import { useTextInput } from "../hooks/UseTextInput";
import { isValidMessage } from "../helpers/TextInputHandlers";
import { 
    containerStyle, 
    inputContainer, 
    textFieldStyle, 
    sendButtonStyle, 
    quickActionButton 
} from "../styles/TextInputStyles";
import PropTypes from "prop-types";

export default function TextInputArea({ onSendMessage, onSendImage, onAnalyzeCanvas, onAIDrawing, disabled }) {
	const {
		message,
		textInputRef,
		imageInputRef,
		sendText,
		sendImage,
		messageChange,
		imageChange,
		handleAnalyzeCanvas,
		handleAIDrawing,
		handleKeyDown,
	} = useTextInput(onSendMessage, onSendImage, onAnalyzeCanvas, onAIDrawing, disabled);

	return (
		<Box sx={containerStyle}>
			{/* 輸入框 */}
			<Box sx={inputContainer}>
				<input 
					type="file" 
					accept="image/*" 
					ref={imageInputRef} 
					style={{ display: "none" }} 
					onChange={imageChange} 
				/>
				<TextField
					ref={textInputRef}
					fullWidth
					multiline
					maxRows={3}
					placeholder="與 AI 助手對話..."
					value={message}
					onChange={messageChange}
					onKeyDown={handleKeyDown}
					disabled={disabled}
					sx={textFieldStyle}
				/>
			</Box>
			
			{/* 快速操作按鈕和發送按鈕 */}
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
				{/* 左側：快速操作按鈕 */}
				<Box sx={{ display: "flex", gap: "8px" }}>
					<Button
						size="small"
						variant="outlined"
						startIcon={<AutoAwesomeOutlinedIcon />}
						onClick={handleAnalyzeCanvas}
						disabled={disabled}
						sx={quickActionButton}
					>
						分析畫布
					</Button>
					<Button
						size="small"
						variant="outlined"
						startIcon={<BrokenImageOutlinedIcon />}
						onClick={handleAIDrawing}
						disabled={disabled}
						sx={quickActionButton}
					>
						生成圖像
					</Button>
				</Box>
				
				{/* 右側：發送按鈕 */}
				<IconButton
					onClick={sendText}
					disabled={disabled || !isValidMessage(message)}
					sx={sendButtonStyle}
				>
					<SendIcon sx={{ fontSize: 18 }} />
				</IconButton>
			</Box>
		</Box>
	);
}

TextInputArea.propTypes = {
	onSendMessage: PropTypes.func.isRequired,
	onSendImage: PropTypes.func.isRequired,
	onAnalyzeCanvas: PropTypes.func.isRequired,
	onAIDrawing: PropTypes.func.isRequired,
	disabled: PropTypes.bool,
};
