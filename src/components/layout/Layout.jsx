import { useState, useCallback, useRef } from "react";
import { Box } from "@mui/material";
import LeftToolbar from "../toolbar/left-toolbar/LeftToolbar";
import TopToolbar from "../toolbar/top-toolbar/TopToolbar";
import Canvas from "../canvas/Canvas";
import "./Layout.css";

const Layout = () => {
	const [activeTool, setActiveTool] = useState("select");
	const [brushSettings, setBrushSettings] = useState({
		size: 5,
		opacity: 1,
		color: "#000000",
		type: "PencilBrush",
	});

	const [shapeSettings, setShapeSettings] = useState({
		type: "RECT",
		color: "#000000",
		stroke: "#000000",
		strokeWidth: 2,
		fill: "transparent",
		opacity: 1,
		showStroke: true,
	});

	const [eraserSettings, setEraserSettings] = useState({
		size: 20,
		type: "path",
	});

	const [clearTrigger, setClearTrigger] = useState(0);

	const canvasRef = useRef(null);

	const [canvasReady, setCanvasReady] = useState(false);

	const handleClearCanvas = useCallback(() => {
		setClearTrigger((prev) => prev + 1);
	}, []);

	const setCanvasInstance = useCallback((canvas) => {
		canvasRef.current = canvas;
		setCanvasReady(true);
	}, []);

	return (
		<Box className="layout-container">
			<LeftToolbar
				setActiveTool={setActiveTool}
				activeTool={activeTool}
				setBrushSettings={setBrushSettings}
				brushSettings={brushSettings}
				setShapeSettings={setShapeSettings}
				shapeSettings={shapeSettings}
				setEraserSettings={setEraserSettings}
				eraserSettings={eraserSettings}
				onClearCanvas={handleClearCanvas}
			/>
			<TopToolbar onClearClick={handleClearCanvas} canvas={canvasRef.current} canvasReady={canvasReady} />
			<Canvas
				activeTool={activeTool}
				brushSettings={brushSettings}
				shapeSettings={shapeSettings}
				eraserSettings={eraserSettings}
				clearTrigger={clearTrigger}
				onCanvasInit={setCanvasInstance}
			/>
		</Box>
	);
};

export default Layout;
