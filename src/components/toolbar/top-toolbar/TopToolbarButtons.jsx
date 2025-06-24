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
	chatWidth = 0,
	availableWidth = Infinity,
}) => {
	// 移除本地 availableWidth 狀態與 useEffect

	return (
		<Box 
			className="top-toolbar-tools"
			sx={{
				display: 'flex',
				gap: 1,
				alignItems: 'center',
				position: 'relative',
				'&::-webkit-scrollbar': { display: 'none' },
				msOverflowStyle: 'none',
				scrollbarWidth: 'none',
				width: '100%',
				height: 48,
				justifyContent: 'flex-start',
			}}
		><ToolbarButtonGroup 
				label="編輯操作" 
				index={0} 
				totalGroups={5} 
				availableWidth={availableWidth}
			>
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
			</ToolbarButtonGroup>

			<Divider orientation="vertical" flexItem />			<ToolbarButtonGroup 
				label="剪貼功能" 
				index={1} 
				totalGroups={5} 
				availableWidth={availableWidth}
			>
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

			<Divider orientation="vertical" flexItem />			<ToolbarButtonGroup 
				label="檔案操作"
				index={2}
				totalGroups={5}
				availableWidth={availableWidth}
			>
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
			</ToolbarButtonGroup>

			<Divider orientation="vertical" flexItem />

			<ToolbarButtonGroup 
				label="圖片操作"
				index={3}
				totalGroups={5}
				availableWidth={availableWidth}
			>
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
			</ToolbarButtonGroup>

			<Divider orientation="vertical" flexItem />

			<ToolbarButtonGroup 
				label="其他功能"
				index={4}
				totalGroups={5}
				availableWidth={availableWidth}
			>
				<Tooltip title="清除畫布" placement="bottom">
					<IconButton onClick={onClearClick}>
						<Delete />
					</IconButton>
				</Tooltip>
			</ToolbarButtonGroup>
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
};

export default TopToolbarButtons;
