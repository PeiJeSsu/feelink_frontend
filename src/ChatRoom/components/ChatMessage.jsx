import { Box, Paper, Typography, Avatar } from "@mui/material";
import { chatMessageStyles } from "../styles/ChatMessageStyles";
import PropTypes from "prop-types";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({
    html: false,
    breaks: true,
    linkify: true,
});

export default function ChatMessage({ message, isUser, isImage, timestamp }) {
    const textMessage = message || "";
    const isMarkdown = /[*_#\-`]/.test(textMessage);

    const renderMessageContent = () => {
        if (isImage) {
            return (
                <img
                    src={textMessage}
                    alt="上傳的圖片"
                    style={chatMessageStyles.image}
                />
            );
        }

        if (isMarkdown) {
            return renderMarkdown();
        }

        return (
            <Typography sx={chatMessageStyles.text}>{textMessage}</Typography>
        );
    };

    const renderMarkdown = () => {
        if (!isMarkdown) return textMessage;
        const html = md.render(textMessage);
        return (
            <div
                dangerouslySetInnerHTML={{ __html: html }}
                style={chatMessageStyles.markdown}
            />
        );
    };

    // 取得頭像內容
    const getAvatarContent = () => {
        if (isUser) return null;
        return "🤖";
    };

    return (
        <Box sx={chatMessageStyles.container(isUser)}>
            {!isUser && (
                <Avatar sx={chatMessageStyles.avatar}>
                    {getAvatarContent()}
                </Avatar>
            )}
            <Box sx={chatMessageStyles.messageBox}>
                <Paper sx={chatMessageStyles.paper(isUser)}>
                    {renderMessageContent()}
                </Paper>
                <Typography sx={chatMessageStyles.timeStamp}>
                    {timestamp}
                </Typography>
            </Box>
        </Box>
    );
}

ChatMessage.propTypes = {
    message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    isUser: PropTypes.bool.isRequired,
    isImage: PropTypes.bool.isRequired,
    timestamp: PropTypes.string.isRequired,
};
