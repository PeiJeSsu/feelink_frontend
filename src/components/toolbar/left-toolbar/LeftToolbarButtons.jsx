import React from "react";
import PropTypes from "prop-types";
import { Box, IconButton, Tooltip, Badge } from "@mui/material";
import { Brush, FormatShapes, AdsClick, AutoFixHigh, PanTool } from "@mui/icons-material";

const LeftToolbarButtons = ({ activeTool, onToolClick }) => {
	return (
		<Box className="left-toolbar-tools">
			<Tooltip title="選擇工具" placement="right" arrow>
				<IconButton
					onClick={() => onToolClick("select")}
					className={activeTool === "select" ? "Mui-selected" : ""}
				>
					<AdsClick />
				</IconButton>
			</Tooltip>
			<Tooltip title="畫筆工具" placement="right" arrow>
				<Badge color="secondary" variant="dot" invisible={activeTool !== "pencil"} overlap="circular">
					<IconButton
						id="brush-button"
						onClick={() => onToolClick("pencil")}
						className={activeTool === "pencil" ? "Mui-selected" : ""}
					>
						<Brush />
					</IconButton>
				</Badge>
			</Tooltip>
			<Tooltip title="圖形工具" placement="right" arrow>
				<Badge color="secondary" variant="dot" invisible={activeTool !== "shape"} overlap="circular">
					<IconButton
						id="shape-button"
						onClick={() => onToolClick("shape")}
						className={activeTool === "shape" ? "Mui-selected" : ""}
					>
						<FormatShapes />
					</IconButton>
				</Badge>
			</Tooltip>
			<Tooltip title="橡皮擦工具" placement="right" arrow>
				<Badge color="secondary" variant="dot" invisible={activeTool !== "eraser"} overlap="circular">
					<IconButton
						id="eraser-button"
						onClick={() => onToolClick("eraser")}
						className={activeTool === "eraser" ? "Mui-selected" : ""}
					>
						<AutoFixHigh />
					</IconButton>
				</Badge>
			</Tooltip>
			<Tooltip title="移動畫布工具" placement="right" arrow>
				<IconButton
					id="pan-button"
					onClick={() => onToolClick("pan")}
					className={activeTool === "pan" ? "Mui-selected" : ""}
				>
					<PanTool />
				</IconButton>
			</Tooltip>
		</Box>
	);
};

LeftToolbarButtons.propTypes = {
	activeTool: PropTypes.string.isRequired,
	onToolClick: PropTypes.func.isRequired,
};

export default LeftToolbarButtons;
