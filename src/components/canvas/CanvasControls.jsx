import React from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import ZoomControls from "./ZoomControls";
import PanControls from "./PanControls";
import "./CanvasControls.css";

const CanvasControls = ({ canvas }) => {
	if (canvas) {
		canvas.zoomLevel = canvas.zoomLevel || 1;
	}

	return (
		<Box className="canvas-controls-container">
			<ZoomControls canvas={canvas} />
			<PanControls canvas={canvas} />
		</Box>
	);
};

CanvasControls.propTypes = {
	canvas: PropTypes.object,
};

export default CanvasControls;
