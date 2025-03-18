import React from "react";
import PropTypes from "prop-types";
import { Box, IconButton, Tooltip, Divider } from "@mui/material";
import {
	Delete,
	Save,
	FileOpen,
	ContentCut,
	ContentCopy,
	ContentPaste,
	Image,
	FileUpload,
} from "@mui/icons-material";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";

const TopToolbarButtons = ({
	onClearClick,
	onSaveClick,
	onLoadClick,
	onCutClick,
	onCopyClick,
	onPasteClick,
	onUndoClick,
	onRedoClick,
	onExportClick,
	onImportClick,
}) => {
	return (
		<Box className="top-toolbar-tools">
			<Tooltip title="復原" placement="bottom">
				<IconButton onClick={onUndoClick}>
					<UndoIcon />
				</IconButton>
			</Tooltip>

			<Tooltip title="重做" placement="bottom">
				<IconButton onClick={onRedoClick}>
					<RedoIcon />
				</IconButton>
			</Tooltip>

			<Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

			<Tooltip title="剪下" placement="bottom">
				<IconButton onClick={onCutClick}>
					<ContentCut />
				</IconButton>
			</Tooltip>

			<Tooltip title="複製" placement="bottom">
				<IconButton onClick={onCopyClick}>
					<ContentCopy />
				</IconButton>
			</Tooltip>

			<Tooltip title="貼上" placement="bottom">
				<IconButton onClick={onPasteClick}>
					<ContentPaste />
				</IconButton>
			</Tooltip>

			<Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

			<Tooltip title="保存" placement="bottom">
				<IconButton onClick={onSaveClick}>
					<Save />
				</IconButton>
			</Tooltip>

			<Tooltip title="開啟" placement="bottom">
				<IconButton onClick={onLoadClick}>
					<FileOpen />
				</IconButton>
			</Tooltip>

			<Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

			<Tooltip title="匯入圖片" placement="bottom">
				<IconButton onClick={onImportClick}>
					<FileUpload />
				</IconButton>
			</Tooltip>

			<Tooltip title="匯出圖片" placement="bottom">
				<IconButton onClick={onExportClick}>
					<Image />
				</IconButton>
			</Tooltip>

			<Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

			<Tooltip title="清除畫布" placement="bottom">
				<IconButton onClick={onClearClick}>
					<Delete />
				</IconButton>
			</Tooltip>
		</Box>
	);
};

TopToolbarButtons.propTypes = {
	onClearClick: PropTypes.func.isRequired,
	onSaveClick: PropTypes.func.isRequired,
	onLoadClick: PropTypes.func.isRequired,
	onCutClick: PropTypes.func.isRequired,
	onCopyClick: PropTypes.func.isRequired,
	onPasteClick: PropTypes.func.isRequired,
	onUndoClick: PropTypes.func,
	onRedoClick: PropTypes.func,
	onExportClick: PropTypes.func.isRequired,
	onImportClick: PropTypes.func.isRequired,
};

export default TopToolbarButtons;
