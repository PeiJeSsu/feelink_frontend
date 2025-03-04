import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, Paper } from "@mui/material";
import "./TopToolbar.css";
import TopToolbarButtons from "./TopToolbarButtons";
import { handleSaveFile, handleLoadFile, handleFileInputChange } from "../../file/FileOperations";

const TopToolbar = ({ onClearClick, canvas, canvasReady }) => {
	const fileInputRef = useRef(null);
	const historyManager = useRef(null);

	// 設置歷史管理器引用
	useEffect(() => {
		if (canvas?.historyManager) {
			historyManager.current = canvas.historyManager;
			console.log("History manager reference updated:", historyManager.current);
		}
	}, [canvas]);

	const handleCut = () => {
		console.log("剪下");
		// 剪下功能實現todo
	};

	const handleCopy = () => {
		console.log("複製");
		// 複製功能實現todo
	};

	const handlePaste = () => {
		console.log("貼上");
		// 貼上功能實現todo
	};

	const handleUndo = () => {
		console.log("Undo button clicked");
		if (historyManager.current) {
			console.log("History manager found, executing undo");
			historyManager.current.undo();
		} else {
			console.log("No history manager available");
		}
	};

	const handleRedo = () => {
		console.log("Redo button clicked");
		if (historyManager.current) {
			console.log("History manager found, executing redo");
			historyManager.current.redo();
		} else {
			console.log("No history manager available");
		}
	};

	return (
		<Box className="top-toolbar-container">
			<Paper className="top-toolbar" elevation={3}>
				<TopToolbarButtons
					onClearClick={onClearClick}
					onSaveClick={() => handleSaveFile(canvas)}
					onLoadClick={() => handleLoadFile(fileInputRef, canvasReady)}
					onCutClick={handleCut}
					onCopyClick={handleCopy}
					onPasteClick={handlePaste}
					onUndoClick={handleUndo}
					onRedoClick={handleRedo}
				/>
			</Paper>

			<input
				type="file"
				ref={fileInputRef}
				style={{ display: "none" }}
				accept=".feelink"
				onChange={(e) => handleFileInputChange(e, canvas, canvasReady)}
			/>
		</Box>
	);
};

TopToolbar.propTypes = {
	onClearClick: PropTypes.func.isRequired,
	canvas: PropTypes.object,
	canvasReady: PropTypes.bool,
};

export default TopToolbar;
