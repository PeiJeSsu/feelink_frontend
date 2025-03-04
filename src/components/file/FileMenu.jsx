import React, { useRef } from "react";
import PropTypes from "prop-types";
import { Menu, MenuItem } from "@mui/material";
import { handleSaveFile, handleLoadFile, handleFileInputChange } from "./FileOperations";

const FileMenu = ({ anchorEl, open, onClose, canvas, canvasReady }) => {
	const fileInputRef = useRef(null);

	const handleMenuClose = () => {
		onClose();
	};

	const handleSaveClick = () => {
		handleMenuClose();
		handleSaveFile(canvas);
	};

	const handleLoadClick = () => {
		handleMenuClose();
		handleLoadFile(fileInputRef, canvasReady);
	};

	return (
		<>
			<Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
				<MenuItem onClick={handleSaveClick}>保存檔案</MenuItem>
				<MenuItem onClick={handleLoadClick}>開啟檔案</MenuItem>
			</Menu>

			<input
				type="file"
				ref={fileInputRef}
				style={{ display: "none" }}
				accept=".feelink"
				onChange={(e) => {
					handleFileInputChange(e, canvas, canvasReady);
					handleMenuClose();
				}}
			/>
		</>
	);
};

FileMenu.propTypes = {
	anchorEl: PropTypes.object,
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	canvas: PropTypes.object,
	canvasReady: PropTypes.bool,
};

export default FileMenu;
