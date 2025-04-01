import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Paper } from "@mui/material";
import "./LeftToolbar.css";
import LeftToolbarButtons from "./LeftToolbarButtons";
import SettingsPopover from "./SettingsPopover";
import BrushSettings from "../../brush/BrushSettings";
import ShapeSettings from "../../shape/ShapeSettings";
import EraserSettings from "../../eraser/EraserSettings";

const LeftToolbar = ({
	setActiveTool,
	activeTool,
	setBrushSettings,
	brushSettings,
	setShapeSettings,
	shapeSettings,
	setEraserSettings,
	eraserSettings,
}) => {
	const [anchorEl, setAnchorEl] = useState(null);
	const [popoverVisible, setPopoverVisible] = useState(false);
	const [shapeAnchorEl, setShapeAnchorEl] = useState(null);
	const [shapePopoverVisible, setShapePopoverVisible] = useState(false);
	const [eraserAnchorEl, setEraserAnchorEl] = useState(null);
	const [eraserPopoverVisible, setEraserPopoverVisible] = useState(false);

	useEffect(() => {
		if (activeTool === "pencil") {
			const brushButton = document.getElementById("brush-button");
			setAnchorEl(brushButton);
			setPopoverVisible(true);
		} else if (activeTool === "shape") {
			const shapeButton = document.getElementById("shape-button");
			setShapeAnchorEl(shapeButton);
			setShapePopoverVisible(true);
		} else if (activeTool === "eraser") {
			const eraserButton = document.getElementById("eraser-button");
			setEraserAnchorEl(eraserButton);
			setEraserPopoverVisible(true);
		}
	}, [activeTool]);

	const handleToolClick = (tool) => {
		setActiveTool(tool);

		if (tool === "pencil") {
			const brushButton = document.getElementById("brush-button");
			setAnchorEl(brushButton);
			setPopoverVisible(true);
		} else if (tool === "shape") {
			const shapeButton = document.getElementById("shape-button");
			setShapeAnchorEl(shapeButton);
			setShapePopoverVisible(true);
		} else if (tool === "eraser") {
			const eraserButton = document.getElementById("eraser-button");
			setEraserAnchorEl(eraserButton);
			setEraserPopoverVisible(true);
		}
	};

	const handleClose = () => {
		setPopoverVisible(false);
	};

	const handleShapeClose = () => {
		setShapePopoverVisible(false);
	};

	const handleEraserClose = () => {
		setEraserPopoverVisible(false);
	};

	return (
		<Paper className="left-toolbar-container" elevation={8}>
			<LeftToolbarButtons activeTool={activeTool} onToolClick={handleToolClick} />

			<SettingsPopover
				open={popoverVisible && activeTool === "pencil"}
				anchorEl={anchorEl}
				onClose={handleClose}
				title="畫筆設置"
			>
				<BrushSettings brushSettings={brushSettings} onBrushSettingsChange={setBrushSettings} />
			</SettingsPopover>

			<SettingsPopover
				open={shapePopoverVisible && activeTool === "shape"}
				anchorEl={shapeAnchorEl}
				onClose={handleShapeClose}
				title="圖形設置"
			>
				<ShapeSettings shapeSettings={shapeSettings} onShapeSettingsChange={setShapeSettings} />
			</SettingsPopover>

			<SettingsPopover
				open={eraserPopoverVisible && activeTool === "eraser"}
				anchorEl={eraserAnchorEl}
				onClose={handleEraserClose}
				title="橡皮擦設置"
			>
				<EraserSettings eraserSettings={eraserSettings} onEraserSettingsChange={setEraserSettings} />
			</SettingsPopover>
		</Paper>
	);
};

LeftToolbar.propTypes = {
	setActiveTool: PropTypes.func.isRequired,
	activeTool: PropTypes.string.isRequired,
	setBrushSettings: PropTypes.func.isRequired,
	brushSettings: PropTypes.object.isRequired,
	setShapeSettings: PropTypes.func.isRequired,
	shapeSettings: PropTypes.object.isRequired,
	setEraserSettings: PropTypes.func.isRequired,
	eraserSettings: PropTypes.object.isRequired,
};

export default LeftToolbar;
