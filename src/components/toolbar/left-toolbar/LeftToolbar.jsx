import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Paper } from "@mui/material";
import "./LeftToolbar.css";
import LeftToolbarButtons from "./LeftToolbarButtons";
import SettingsPopover from "./SettingsPopover";
import BrushSettings from "../../brush/BrushSettings";
import ShapeSettings from "../../shape/ShapeSettings";
import EraserSettings from "../../eraser/EraserSettings";
import PaintBucketSettings from "../../paint-bucket/PaintBucketSettings";
import TextSettings from "../../text/TextSettings";

const LeftToolbar = ({
	setActiveTool,
	activeTool,
	setBrushSettings,
	brushSettings,
	setShapeSettings,
	shapeSettings,
	setEraserSettings,
	eraserSettings,
	setPaintBucketSettings,
	paintBucketSettings,
	setTextSettings,
	textSettings,
	onClearCanvas
}) => {
	const [anchorEl, setAnchorEl] = useState(null);
	const [popoverVisible, setPopoverVisible] = useState(false);
	const [shapeAnchorEl, setShapeAnchorEl] = useState(null);
	const [shapePopoverVisible, setShapePopoverVisible] = useState(false);
	const [eraserAnchorEl, setEraserAnchorEl] = useState(null);
	const [eraserPopoverVisible, setEraserPopoverVisible] = useState(false);
	const [paintBucketAnchorEl, setPaintBucketAnchorEl] = useState(null);
	const [paintBucketPopoverVisible, setPaintBucketPopoverVisible] = useState(false);
	const [textAnchorEl, setTextAnchorEl] = useState(null);
	const [textPopoverVisible, setTextPopoverVisible] = useState(false);

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
		} else if (activeTool === "paintBucket") {
			const paintBucketButton = document.getElementById("paint-bucket-button");
			setPaintBucketAnchorEl(paintBucketButton);
			setPaintBucketPopoverVisible(true);
		} else if (activeTool === "text") {
			const textButton = document.getElementById("text-button");
			setTextAnchorEl(textButton);
			setTextPopoverVisible(true);
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
		} else if (tool === "paintBucket") {
			const paintBucketButton = document.getElementById("paint-bucket-button");
			setPaintBucketAnchorEl(paintBucketButton);
			setPaintBucketPopoverVisible(true);
		} else if (tool === "text") {
			const textButton = document.getElementById("text-button");
			setTextAnchorEl(textButton);
			setTextPopoverVisible(true);
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

	const handlePaintBucketClose = () => {
		setPaintBucketPopoverVisible(false);
	};

	const handleTextClose = () => {
		setTextPopoverVisible(false);
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

			<SettingsPopover
				open={paintBucketPopoverVisible && activeTool === "paintBucket"}
				anchorEl={paintBucketAnchorEl}
				onClose={handlePaintBucketClose}
				title="填充工具設置"
			>
				<PaintBucketSettings 
					paintBucketSettings={paintBucketSettings} 
					onPaintBucketSettingsChange={setPaintBucketSettings} 
				/>
			</SettingsPopover>

			<SettingsPopover
				open={textPopoverVisible && activeTool === "text"}
				anchorEl={textAnchorEl}
				onClose={handleTextClose}
				title="文字設置"
			>
				<TextSettings textSettings={textSettings} onTextSettingsChange={setTextSettings} />
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
	setPaintBucketSettings: PropTypes.func.isRequired,
	paintBucketSettings: PropTypes.object.isRequired,
	setTextSettings: PropTypes.func.isRequired,
	textSettings: PropTypes.object.isRequired,
	onClearCanvas: PropTypes.func.isRequired,
};

export default LeftToolbar;
