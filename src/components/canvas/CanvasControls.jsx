import PropTypes from "prop-types";
import { Box } from "@mui/material";
import ZoomControls from "./ZoomControls";
import PanControls from "./PanControls";
import "./CanvasControls.css";

const CanvasControls = ({ canvas, chatWidth = 0, isChatOpen = false }) => {
	if (canvas) {
		canvas.zoomLevel = canvas.zoomLevel || 1;
	}

	return (
		<Box
			className="canvas-controls-container"
			sx={{
				width: "100%",
				transition: "width 0.3s ease-in-out",
			}}
		>
			<ZoomControls canvas={canvas} isChatOpen={isChatOpen} chatWidth={chatWidth} />
			<PanControls canvas={canvas} />
		</Box>
	);
};

CanvasControls.propTypes = {
	canvas: PropTypes.object,
	chatWidth: PropTypes.number,
	isChatOpen: PropTypes.bool,
};

export default CanvasControls;
