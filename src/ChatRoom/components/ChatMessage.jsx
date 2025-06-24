import * as React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { chatMessageStyles } from '../styles/ChatMessageStyles';
import PropTypes from "prop-types";
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: false,       
  breaks: true,      
  linkify: true     
});

export default function ChatMessage({ message, isUser, isImage }) {
  const textMessage = message || "";
  const isMarkdown = /[*_#\-`]/.test(textMessage);
  
  const renderMessageContent = () => {
      if (isImage) {
        return <img src={textMessage} alt="上傳的圖片" style={chatMessageStyles.image} />;
      }
      
      if (isMarkdown) {
        return renderMarkdown();
      }
      
      return (
        <Typography variant='body2' sx={chatMessageStyles.text}>
          {textMessage}
        </Typography>
      );
  };

  const renderMarkdown = () => {
    if (!isMarkdown) return textMessage;
    const html = md.render(textMessage);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  

  return (
    <Box sx={chatMessageStyles.container(isUser)}>
      <Box sx={chatMessageStyles.messageBox}>
        <Paper sx={chatMessageStyles.paper(isUser)}>
          {renderMessageContent()}
        </Paper>
      </Box>
    </Box>
  );
}

ChatMessage.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  isUser: PropTypes.bool.isRequired,
  isImage: PropTypes.bool.isRequired,
};