import { Box, TextField, Button, IconButton, Alert, Collapse } from "@mui/material";
import {
    AutoAwesomeOutlined,
    BrokenImageOutlined,
    Send,
    FaceRetouchingNaturalOutlined,
    Close,
} from "@mui/icons-material";
import { useTextInput } from "../hooks/UseTextInput";
import { isValidMessage } from "../helpers/TextInputHandlers";
import {
    containerStyle,
    inputContainer,
    textFieldStyle,
    sendButtonStyle,
    quickActionButton,
} from "../styles/TextInputStyles";
import PropTypes from "prop-types";

export default function TextInputArea({
    onSendMessage,
    onSendImage,
    onAnalyzeCanvas,
    onAIDrawing,
    onGenerateObject,
    disabled,
    inputNotification,
    onClearNotification,
}) {
    const {
        message,
        textInputRef,
        imageInputRef,
        sendText,
        messageChange,
        imageChange,
        handleAnalyzeCanvas,
        handleAIDrawing,
        handleGenerateObject,
        handleKeyDown,
    } = useTextInput(
        onSendMessage,
        onSendImage,
        onAnalyzeCanvas,
        onAIDrawing,
        onGenerateObject,
        disabled
    );

    return (
        <Box sx={containerStyle}>
            {/* 通知區域 */}
            <Collapse in={!!inputNotification}>
                {inputNotification && (
                    <Alert
                        severity={inputNotification.severity || "info"}
                        onClose={onClearNotification}
                        action={
                            <IconButton
                                size="small"
                                onClick={onClearNotification}
                                sx={{ color: "inherit" }}
                            >
                                <Close fontSize="small" />
                            </IconButton>
                        }
                        sx={{
                            marginBottom: "12px",
                            fontSize: "14px",
                            borderRadius: "8px",
                            "& .MuiAlert-message": {
                                fontFamily: '"Noto Sans TC", sans-serif',
                            },
                        }}
                    >
                        {inputNotification.message}
                    </Alert>
                )}
            </Collapse>

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
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "8px",
                }}
            >
                {/* 左側：快速操作按鈕 */}
                <Box sx={{ display: "flex", gap: "8px" }}>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AutoAwesomeOutlined />}
                        onClick={handleAnalyzeCanvas}
                        disabled={disabled}
                        sx={quickActionButton}
                    >
                        分析畫布
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<BrokenImageOutlined />}
                        onClick={handleAIDrawing}
                        disabled={disabled}
                        sx={quickActionButton}
                    >
                        畫畫接龍
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<FaceRetouchingNaturalOutlined />}
                        onClick={handleGenerateObject}
                        disabled={disabled}
                        sx={quickActionButton}
                    >
                        生成物件
                    </Button>
                </Box>

                {/* 右側：發送按鈕 */}
                <IconButton
                    onClick={sendText}
                    disabled={disabled || !isValidMessage(message)}
                    sx={sendButtonStyle}
                >
                    <Send sx={{ fontSize: 18 }} />
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
    onGenerateObject: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    inputNotification: PropTypes.shape({
        message: PropTypes.string.isRequired,
        severity: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
    }),
    onClearNotification: PropTypes.func,
};
