import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Box, Paper } from "@mui/material";
import "./TopToolbar.css";
import TopToolbarButtons from "./TopToolbarButtons";
import { handleSaveFile, handleLoadFile, handleFileInputChange } from "../../../helpers/file/FileOperationHandlers";
import { importImage } from "../../../helpers/image/ImageImport";
import ImageExportDialog from "../../image/ImageExportDialog";
import { cut, copy, paste, hasClipboardContent } from '../../../helpers/clipboard/ClipboardOperations';

const TopToolbar = ({ onClearClick, canvas, canvasReady }) => {
	const fileInputRef = useRef(null);
	const imageInputRef = useRef(null);
	const historyManager = useRef(null);
	const [exportDialogOpen, setExportDialogOpen] = useState(false);
	const [hasSelectedObject, setHasSelectedObject] = useState(false);
	const [canPaste, setCanPaste] = useState(false);

	// 設置歷史管理器引用和選取狀態監聽
	useEffect(() => {
		if (canvas?.historyManager) {
			historyManager.current = canvas.historyManager;
			console.log("History manager reference updated:", historyManager.current);
		}

		// 監聽選取狀態變化
		const handleSelection = () => {
			setHasSelectedObject(!!canvas?.getActiveObject());
		};

		if (canvas) {
			canvas.on('selection:created', handleSelection);
			canvas.on('selection:updated', handleSelection);
			canvas.on('selection:cleared', handleSelection);
		}

		return () => {
			if (canvas) {
				canvas.off('selection:created', handleSelection);
				canvas.off('selection:updated', handleSelection);
				canvas.off('selection:cleared', handleSelection);
			}
		};
	}, [canvas]);

	// 監聽剪貼簿狀態
	useEffect(() => {
		const checkClipboard = () => {
			setCanPaste(hasClipboardContent());
		};

		// 初始檢查
		checkClipboard();

		// 定期檢查剪貼簿狀態
		const interval = setInterval(checkClipboard, 100);

		return () => clearInterval(interval);
	}, []);

	const handleCut = () => {
		cut(canvas);
	};

	const handleCopy = () => {
		copy(canvas);
	};

	const handlePaste = () => {
		paste(canvas);
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

	const handleExportClick = () => {
		setExportDialogOpen(true);
	};

	const handleImportClick = () => {
		imageInputRef.current?.click();
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
					onExportClick={handleExportClick}
					onImportClick={handleImportClick}
					canvas={canvas}
					hasSelectedObject={hasSelectedObject}
					canPaste={canPaste}
				/>
			</Paper>

			<input
				type="file"
				ref={fileInputRef}
				style={{ display: "none" }}
				accept=".feelink"
				onChange={(e) => handleFileInputChange(e, canvas, canvasReady)}
			/>

			<input
				type="file"
				ref={imageInputRef}
				style={{ display: "none" }}
				accept="image/*"
				onChange={(e) => {
					if (e.target.files?.[0]) {
						importImage(e.target.files[0], canvas, () => {
							e.target.value = "";
						});
					}
				}}
			/>

			<ImageExportDialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} canvas={canvas} />
		</Box>
	);
};

TopToolbar.propTypes = {
	onClearClick: PropTypes.func.isRequired,
	canvas: PropTypes.object,
	canvasReady: PropTypes.bool,
};

export default TopToolbar;
