import { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import TopToolbarButtons from "./TopToolbarButtons";
import { handleSaveFile, handleLoadFile, handleFileInputChange } from "../../../helpers/file/FileOperationHandlers";
import { importImage } from "../../../helpers/image/ImageImport";
import ImageExportDialog from "../../image/ImageExportDialog";

const TopToolbar = ({ onClearClick, canvas, chatWidth = 0 }) => {
	const fileInputRef = useRef(null);
	const imageInputRef = useRef(null);
	const historyManager = useRef(null);
	const [exportDialogOpen, setExportDialogOpen] = useState(false);
	const RESERVED_LAST_BUTTON_WIDTH = 72; // 與 TopToolbarButtons 保持一致

	// 監聽工具欄容器寬度變化
	const containerRef = useRef(null);

	useEffect(() => {
		const updateAvailableWidth = () => {
			// 目前不需要計算可用寬度
		};
		updateAvailableWidth();
		const resizeObserver = new ResizeObserver(updateAvailableWidth);
		const refCurrent = containerRef.current;
		if (refCurrent) {
			resizeObserver.observe(refCurrent);
		}
		return () => {
			resizeObserver.disconnect();
		};
	}, [chatWidth, RESERVED_LAST_BUTTON_WIDTH]);

	// 設置歷史管理器引用
	useEffect(() => {
		if (canvas?.historyManager) {
			historyManager.current = canvas.historyManager;
			console.log("History manager reference updated:", historyManager.current);
		}
	}, [canvas]);

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
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: "8px",
			}}
		>
			<TopToolbarButtons
				onClearClick={onClearClick}
				onSaveClick={() => handleSaveFile(canvas)}
				onLoadClick={() => handleLoadFile(fileInputRef)}
				onUndoClick={handleUndo}
				onRedoClick={handleRedo}
				onExportClick={handleExportClick}
				onImportClick={handleImportClick}
				canvas={canvas}
			/>

			<input
				type="file"
				ref={fileInputRef}
				style={{ display: "none" }}
				accept=".feelink"
				onChange={(e) => handleFileInputChange(e, canvas)}
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
	chatWidth: PropTypes.number,
};

export default TopToolbar;
