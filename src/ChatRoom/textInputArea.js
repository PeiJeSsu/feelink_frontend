import * as React from 'react';
import { Box, TextField } from '@mui/material';
import FunctionButton from './functionButton';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InputIcon from '@mui/icons-material/Input';
import PropTypes from 'prop-types';
export default function TextInputArea({ onSendMessage, onUploadImage, disabled, onHeightChange }) {
    const [message, setMessage] = React.useState('');
    const [lineCount, setLineCount] = React.useState(1);
    const textFieldRef = React.useRef(null);
    const fileInputRef = React.useRef(null);
    const textAreaRef = React.useRef(null);


    const calculateLines = React.useCallback(() => {
        if (!textAreaRef.current) return 1;
        
        const textArea = textAreaRef.current;
        const computedStyle = window.getComputedStyle(textArea);
        const lineHeight = parseInt(computedStyle.lineHeight) || 20;
        const paddingTop = parseInt(computedStyle.paddingTop) || 0;
        const paddingBottom = parseInt(computedStyle.paddingBottom) || 0;
        

        const contentHeight = textArea.scrollHeight - paddingTop - paddingBottom;
        const calculatedLines = Math.ceil(contentHeight / lineHeight);
        

        return Math.min(calculatedLines, 3);
    }, []);

    const handleMessageChange = (e) => {
        const newMessage = e.target.value;
        setMessage(newMessage);
        

        setTimeout(() => {
            const newLineCount = calculateLines();
            if (newLineCount !== lineCount) {
                setLineCount(newLineCount);
                if (onHeightChange) {
                    onHeightChange(newLineCount);
                }
            }
        }, 0);
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

    const handleImageUpload = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file?.type?.startsWith('image/')) {

            onUploadImage(file, message);
            

            setMessage('');
            setLineCount(1);
            if (onHeightChange) {
                onHeightChange(1);
            }
            e.target.value = '';
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };


    const inputHeight = `${Math.min(lineCount * 20 + 40, 100)}px`;


    React.useEffect(() => {
        if (!textAreaRef.current) return;


        const resizeObserver = new ResizeObserver(() => {
            const newLineCount = calculateLines();
            if (newLineCount !== lineCount) {
                setLineCount(newLineCount);
                if (onHeightChange) {
                    onHeightChange(newLineCount);
                }
            }
        });

        resizeObserver.observe(textAreaRef.current);
        
        return () => {
            resizeObserver.disconnect();
        };
    }, [calculateLines, lineCount, onHeightChange]);

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
                maxRows={3}
                variant="standard"
                value={message}
                onChange={handleMessageChange}
                onKeyDown={handleKeyPress}
                placeholder="輸入訊息..."
                disabled={disabled}
                inputRef={textAreaRef}
                sx={{
                    position: "absolute",
                    bottom: "40px",
                    left: "5px",
                    width: "65%",
                }}
            />
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <FunctionButton  aria-label="上傳圖片"
                icon={<AssignmentIcon />}
                displayName={"上傳圖片"}
                onClick={handleImageUpload}
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
            <FunctionButton  aria-label="輸入" data-testid="send-button" 
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
TextInputArea.propTypes = {
    onSendMessage: PropTypes.func.isRequired, 
    onUploadImage: PropTypes.func.isRequired, 
    disabled: PropTypes.bool, 
    onHeightChange: PropTypes.func, 
  };
  
  TextInputArea.defaultProps = {
    disabled: false,
    onHeightChange: null,
  };