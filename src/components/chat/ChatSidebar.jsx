import React, { useState } from "react";
import { Box, IconButton, Paper } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import "./ChatSidebar.css";

const ChatSidebar = () => {
	const [isOpen, setIsOpen] = useState(false);

	const toggleSidebar = () => {
		setIsOpen(!isOpen);
	};

	return (
		<div className={`chat-sidebar ${isOpen ? "open" : ""}`}>
			<Paper className="chat-content" elevation={3}>
				<IconButton className="toggle-button" onClick={toggleSidebar} size="small">
					{isOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
				</IconButton>
				<Box className="chat-container">
					{/* 聊天室內容將在這裡 */}
					<div style={{ padding: "20px" }}>聊天室內容</div>
				</Box>
			</Paper>
		</div>
	);
};

export default ChatSidebar;
