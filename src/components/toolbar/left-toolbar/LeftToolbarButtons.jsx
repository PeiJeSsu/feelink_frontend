import React from "react";
import PropTypes from "prop-types";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Brush, FormatShapes, AdsClick, AutoFixHigh, PanTool } from "@mui/icons-material";

const LeftToolbarButtons = ({ activeTool, onToolClick }) => {
	return (
		<Box className="left-toolbar-tools">
			<Tooltip title="選擇" placement="right">
				<IconButton
					onClick={() => onToolClick("select")}
					color={activeTool === "select" ? "primary" : "default"}
				>
					<AdsClick />
				</IconButton>
			</Tooltip>
			<Tooltip title="畫筆" placement="right">
				<IconButton
					id="brush-button"
					onClick={() => onToolClick("pencil")}
					color={activeTool === "pencil" ? "primary" : "default"}
				>
					<Brush />
				</IconButton>
			</Tooltip>
			<Tooltip title="圖形" placement="right">
				<IconButton
					id="shape-button"
					onClick={() => onToolClick("shape")}
					color={activeTool === "shape" ? "primary" : "default"}
				>
					<FormatShapes />
				</IconButton>
			</Tooltip>
			<Tooltip title="橡皮擦" placement="right">
				<IconButton
					id="eraser-button"
					onClick={() => onToolClick("eraser")}
					color={activeTool === "eraser" ? "primary" : "default"}
				>
					<AutoFixHigh />
				</IconButton>
			</Tooltip>
			<Tooltip title="移動畫布" placement="right">
				<IconButton
					id="pan-button"
					onClick={() => onToolClick("pan")}
					color={activeTool === "pan" ? "primary" : "default"}
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
