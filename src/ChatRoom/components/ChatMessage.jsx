import * as React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { chatMessageStyles } from '../styles/ChatMessageStyles';
import PropTypes from "prop-types";
import MarkdownIt from 'markdown-it';

// 初始化 markdown-it 實例
const md = new MarkdownIt({
  html: false,       // 禁用 HTML 標籤
  breaks: true,      // 將換行符號轉換為 <br>
  linkify: true      // 自動將 URL 轉為連結
});

export default function ChatMessage({ message, isUser, isImage }) {
  const textMessage = message || "";
  const isMarkdown = /[*_#\-`]/.test(textMessage);

  // 渲染 Markdown 為 HTML
  const renderMarkdown = () => {
    if (!isMarkdown) return textMessage;
    const html = md.render(textMessage);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <Box sx={chatMessageStyles.container(isUser)}>
      <Box sx={chatMessageStyles.messageBox}>
        <Paper sx={chatMessageStyles.paper(isUser)}>
          {isImage ? (
            <img src={textMessage} alt="上傳的圖片" style={chatMessageStyles.image} />
          ) : isMarkdown ? (
            renderMarkdown()
          ) : (
            <Typography variant='body2' sx={chatMessageStyles.text}>
              {textMessage}
            </Typography>
          )}
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