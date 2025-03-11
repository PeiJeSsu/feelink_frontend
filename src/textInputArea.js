import * as React from 'react';
import { Box, TextField } from '@mui/material';
import FunctionButton from './functionButton';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InputIcon from '@mui/icons-material/Input';
export default function TextInputArea({ onSendMessage, onAnalyze, disabled, onHeightChange }) {
    const [message, setMessage] = React.useState('');
    const [lineCount, setLineCount] = React.useState(1);
    const textFieldRef = React.useRef(null);

    const calculateLines = (text) => {
        // 計算文字行數
        if (!text) return 1;
        const lines = text.split('\n').length;
        return lines;
    };

    const handleMessageChange = (e) => {
        const newMessage = e.target.value;
        setMessage(newMessage);
        
        // 計算行數
        const newLineCount = calculateLines(newMessage);
        if (newLineCount !== lineCount) {
            setLineCount(newLineCount);
            // 通知父組件行數已變更
            if (onHeightChange) {
                onHeightChange(newLineCount);
            }
        }
    };

    const handleSend = () => {
        if (!disabled && message.trim()) {
            onSendMessage(message);
            setMessage('');
            setLineCount(1);
            if (onHeightChange) {
                onHeightChange(1);
            }
        }
    };

    const handleAnalyze = () => {
        if (!disabled && message.trim()) {
            onAnalyze(message);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // 根據行數動態調整高度
    const inputHeight = `${Math.min(lineCount * 20 + 40, 100)}px`;

return (
    <Box sx={{ 
        position: "fixed",
        bottom: "5px",
        right: "5px",
        width: "20%",
        height: inputHeight,
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '8px',
        transition: 'height 0.3s ease'
    }}>
        <TextField 
            ref={textFieldRef}
            multiline 
            minRows={1} 
            maxRows={3} // 確保最大行數為3
            variant="standard"
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder="輸入訊息..."
            disabled={disabled}
            sx={{
                position: "absolute",
                bottom: "40px",
                left: "5px",
                width: "65%",
            }}
        />
           <FunctionButton 
                icon={<AssignmentIcon />}
                displayName={"分析"}
                onClick={handleAnalyze}
                sx={{
                    position:"absolute",
                    left:"5px",
                    bottom:"5px",
                    width: "30%",
                    minWidth: "unset",
                    padding: "4px 8px",
                    borderColor: "gray",
                    color: "black",
                    "&:hover": {
                        borderColor: "black",
                        backgroundColor: "rgba(0, 0, 0, 0.1)",
                    },
                }} 
            />
            <FunctionButton 
                icon={<InputIcon />}
                displayName={"輸入"}
                onClick={handleSend}
                disabled={disabled || !message.trim()}
                sx={{
                    position:"absolute",
                    right:"5px",
                    bottom:"5px",
                    width: "30%",
                    minWidth: "unset",
                    padding: "4px 8px",
                    borderColor: "black",
                    color: "black",
                    "&:hover": {
                        borderColor: "black",
                        backgroundColor: "rgba(0, 0, 0, 0.1)",
                    },
                }} 
            />
            <FunctionButton 
                icon={<KeyboardVoiceIcon />}
                displayName={"語音"}
                sx={{
                    position:"absolute",
                    right:"5px",
                    bottom:"40px",
                    width: "30%",
                    minWidth: "unset",
                    padding: "4px 8px",                           
                    borderColor: "black",
                    color: "black",
                    "&:hover": {
                        borderColor: "black",
                        backgroundColor: "rgba(0, 0, 0, 0.1)",
                    },  
                }} 
            />
        </Box>
    );
}