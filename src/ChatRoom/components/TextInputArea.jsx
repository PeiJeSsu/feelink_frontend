import * as React from "react";
import { Box, TextField, Tooltip } from "@mui/material";
import FunctionButton from "./FunctionButton";
import AssignmentIcon from "@mui/icons-material/Assignment";
import InputIcon from "@mui/icons-material/Input";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import AssistantIcon from "@mui/icons-material/Assistant";
import { useTextInput } from "../hooks/UseTextInput";
import { isValidMessage } from "../helpers/TextInputHandlers";
import { containerStyle, buttonContainerStyle, textFieldStyle, buttonGroupResponsive } from "../styles/TextInputStyles";
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
	} = useTextInput(onSendMessage, onSendImage, onAnalyzeCanvas, onAIDrawing, disabled);

	return (
		<Box sx={containerStyle}>
			<Box sx={buttonContainerStyle}>
				<input type="file" accept="image/*" ref={imageInputRef} style={{ display: "none" }} onChange={imageChange} />
				<Box sx={{ display: "flex", gap: "8px", ...buttonGroupResponsive }}>
					<Tooltip title="上傳圖片">
						<FunctionButton aria-label="上傳圖片" icon={<AssignmentIcon />} onClick={sendImage} disabled={disabled} />
					</Tooltip>
					<Tooltip title="分析畫布">
						<FunctionButton
							aria-label="分析畫布"
							icon={<AnalyticsIcon />}
							onClick={handleAnalyzeCanvas}
							disabled={disabled}
						/>
					</Tooltip>
					<Tooltip title="AI 畫圖">
						<FunctionButton
							aria-label="AI 畫圖"
							icon={<AssistantIcon />}
							onClick={handleAIDrawing}
							disabled={disabled}
						/>
					</Tooltip>
				</Box>
				<Tooltip title="輸入">
					<FunctionButton
						aria-label="輸入"
						icon={<InputIcon />}
						onClick={sendText}
						disabled={disabled || !isValidMessage(message)}
					/>
				</Tooltip>
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
	onAIDrawing: PropTypes.func.isRequired,
	disabled: PropTypes.bool,
};
