import * as React from "react";
import { Box } from "@mui/material";
import {chatRoomStyles} from "../styles/ChatRoomStyles";
import useChatMessages from "../hooks/UseChatMessages";
import ChatMessage from "./ChatMessage";
import TextInputArea from "./TextInputArea";

export default function ChatRoom() {
    const { messages, loading, sendTextMessage, sendImageMessage } = useChatMessages();

    return (
        <Box sx={chatRoomStyles.container}>
            <Box sx={chatRoomStyles.chatArea}>
                {messages.map((message) => (
                    <ChatMessage
                        key={message.id}
                        message={message.message}
                        isUser={message.isUser}
                        isImage={message.isImage}
                    />
                ))}
                {loading && <div>載入中...</div>}
            </Box>

            <TextInputArea
                onSendMessage={sendTextMessage}
                onSendImage={sendImageMessage}
                disabled={loading}
            />
        </Box>
    );
}
