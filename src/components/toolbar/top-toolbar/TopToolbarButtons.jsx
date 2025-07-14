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
	Download,
	AddPhotoAlternate,
	GroupAdd,
	GroupRemove,
	Undo,
	Redo,
} from "@mui/icons-material";
import ToolbarButtonGroup from "./ToolbarButtonGroup";

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
	canvas,
	hasSelectedObject,
	canPaste,
	availableWidth = Infinity,
	onGroupClick,
	onUngroupClick,
	canGroup,
	canUngroup,
}) => {
	return (
		<Box
			className="top-toolbar-tools"
			sx={{
				display: "flex",
				gap: 1,
				alignItems: "center",
				position: "relative",
				"&::-webkit-scrollbar": { display: "none" },
				msOverflowStyle: "none",
				scrollbarWidth: "none",
				width: "100%",
				height: 48,
				justifyContent: "flex-start",
			}}
		>
			<ToolbarButtonGroup label="復原與重做" index={0} totalGroups={6} availableWidth={availableWidth}>
				<Tooltip title="復原" placement="bottom">
					<IconButton onClick={onUndoClick}>
						<Undo />
					</IconButton>
				</Tooltip>

				<Tooltip title="重做" placement="bottom">
					<IconButton onClick={onRedoClick}>
						<Redo />
					</IconButton>
				</Tooltip>
			</ToolbarButtonGroup>
			<Divider orientation="vertical" sx={{ height: "auto", minHeight: 30 }} />
			<ToolbarButtonGroup label="剪貼簿" index={1} totalGroups={6} availableWidth={availableWidth}>
				<Tooltip title="剪下" placement="bottom">
					<IconButton onClick={onCutClick} disabled={!hasSelectedObject}>
						<ContentCut />
					</IconButton>
				</Tooltip>

				<Tooltip title="複製" placement="bottom">
					<IconButton onClick={onCopyClick} disabled={!hasSelectedObject}>
						<ContentCopy />
					</IconButton>
				</Tooltip>

				<Tooltip title="貼上" placement="bottom">
					<IconButton onClick={onPasteClick} disabled={!canvas || !canPaste}>
						<ContentPaste />
					</IconButton>
				</Tooltip>
			</ToolbarButtonGroup>
			<Divider orientation="vertical" sx={{ height: "auto", minHeight: 30 }} />
			<ToolbarButtonGroup label="群組功能" index={2} totalGroups={6} availableWidth={availableWidth}>
				<Tooltip title="成為群組" placement="bottom">
					<IconButton onClick={onGroupClick} disabled={!canGroup}>
						<GroupAdd />
					</IconButton>
				</Tooltip>
				<Tooltip title="解散群組" placement="bottom">
					<IconButton onClick={onUngroupClick} disabled={!canUngroup}>
						<GroupRemove />
					</IconButton>
				</Tooltip>
			</ToolbarButtonGroup>
			<Divider orientation="vertical" sx={{ height: "auto", minHeight: 30 }} />
			<ToolbarButtonGroup label="檔案操作" index={3} totalGroups={6} availableWidth={availableWidth}>
				<Tooltip title="保存檔案" placement="bottom">
					<IconButton onClick={onSaveClick}>
						<Save />
					</IconButton>
				</Tooltip>

				<Tooltip title="開啟檔案" placement="bottom">
					<IconButton onClick={onLoadClick}>
						<FileOpen />
					</IconButton>
				</Tooltip>
			</ToolbarButtonGroup>
			<Divider orientation="vertical" sx={{ height: "auto", minHeight: 30 }} />
			<ToolbarButtonGroup label="圖片操作" index={4} totalGroups={6} availableWidth={availableWidth}>
				<Tooltip title="匯入圖片" placement="bottom">
					<IconButton onClick={onImportClick}>
						<AddPhotoAlternate />
					</IconButton>
				</Tooltip>

				<Tooltip title="匯出圖片" placement="bottom">
					<IconButton onClick={onExportClick}>
						<Download />
					</IconButton>
				</Tooltip>
			</ToolbarButtonGroup>
			<Divider orientation="vertical" sx={{ height: "auto", minHeight: 30 }} />
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
	canvas: PropTypes.object,
	hasSelectedObject: PropTypes.bool,
	canPaste: PropTypes.bool,
	chatWidth: PropTypes.number,
	availableWidth: PropTypes.number,
	onGroupClick: PropTypes.func.isRequired,
	onUngroupClick: PropTypes.func.isRequired,
	canGroup: PropTypes.bool,
	canUngroup: PropTypes.bool,
};

export default TopToolbarButtons;
