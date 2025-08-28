import PropTypes from "prop-types";
import { Box, IconButton, Tooltip, Divider } from "@mui/material";
import {
	Delete,
	Save,
	FileOpen,
	Download,
	AddPhotoAlternate,
	Undo,
	Redo,
} from "@mui/icons-material";

const TopToolbarButtons = ({
	onClearClick,
	onSaveClick,
	onLoadClick,
	onUndoClick,
	onRedoClick,
	onExportClick,
	onImportClick,
	canvas,
}) => {
	const buttonStyle = {
		width: 40,
		height: 40,
		borderRadius: "8px",
		color: "#64748b",
		transition: "all 0.2s ease-in-out",
		"&:hover": {
			backgroundColor: "#f1f5f9",
			color: "#2563eb",
			transform: "translateY(-1px)",
			boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
		},
		"&:disabled": {
			color: "#cbd5e1",
			backgroundColor: "transparent",
		},
	};

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: "4px",
			}}
		>
			{/* 復原與重做 */}
			<Tooltip title="復原" placement="bottom">
				<IconButton onClick={onUndoClick} sx={buttonStyle}>
					<Undo sx={{ fontSize: 18 }} />
				</IconButton>
			</Tooltip>

			<Tooltip title="重做" placement="bottom">
				<IconButton onClick={onRedoClick} sx={buttonStyle}>
					<Redo sx={{ fontSize: 18 }} />
				</IconButton>
			</Tooltip>

			<Divider orientation="vertical" sx={{ height: 32, mx: 1, borderColor: "#e2e8f0" }} />

			{/* 檔案操作 */}
			<Tooltip title="保存檔案" placement="bottom">
				<IconButton onClick={onSaveClick} sx={buttonStyle}>
					<Save sx={{ fontSize: 18 }} />
				</IconButton>
			</Tooltip>

			<Tooltip title="開啟檔案" placement="bottom">
				<IconButton onClick={onLoadClick} sx={buttonStyle}>
					<FileOpen sx={{ fontSize: 18 }} />
				</IconButton>
			</Tooltip>

			<Divider orientation="vertical" sx={{ height: 32, mx: 1, borderColor: "#e2e8f0" }} />

			{/* 圖片操作 */}
			<Tooltip title="匯入圖片" placement="bottom">
				<IconButton onClick={onImportClick} sx={buttonStyle}>
					<AddPhotoAlternate sx={{ fontSize: 18 }} />
				</IconButton>
			</Tooltip>

			<Tooltip title="匯出圖片" placement="bottom">
				<IconButton onClick={onExportClick} sx={buttonStyle}>
					<Download sx={{ fontSize: 18 }} />
				</IconButton>
			</Tooltip>

			<Divider orientation="vertical" sx={{ height: 32, mx: 1, borderColor: "#e2e8f0" }} />

			{/* 清除畫布 */}
			<Tooltip title="清除畫布" placement="bottom">
				<IconButton 
					onClick={onClearClick} 
					sx={buttonStyle}
				>
					<Delete sx={{ fontSize: 18 }} />
				</IconButton>
			</Tooltip>
		</Box>
	);
};

TopToolbarButtons.propTypes = {
	onClearClick: PropTypes.func.isRequired,
	onSaveClick: PropTypes.func.isRequired,
	onLoadClick: PropTypes.func.isRequired,
	onUndoClick: PropTypes.func,
	onRedoClick: PropTypes.func,
	onExportClick: PropTypes.func.isRequired,
	onImportClick: PropTypes.func.isRequired,
	canvas: PropTypes.object,
};

export default TopToolbarButtons;
