import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import "./Canvas.css";
import CanvasControls from "./CanvasControls";
import { useCanvasInitialization } from "../../hooks/useCanvasInitialization";
import { useCanvasTools } from "../../hooks/useCanvasTools";

const Canvas = ({
	activeTool,
	brushSettings,
	shapeSettings,
	eraserSettings,
	paintBucketSettings,
	textSettings,
	clearTrigger,
	onCanvasInit,
	chatWidth = 0,
	isChatOpen = false,
}) => {
	// 創建容器的 ref
	const containerRef = useRef(null);

	// 初始化畫布
	const { canvasRef, fabricCanvasRef } = useCanvasInitialization({
		onCanvasInit,
		clearTrigger,
	});

	// 設置工具
	useCanvasTools(fabricCanvasRef.current, {
		activeTool,
		brushSettings,
		shapeSettings,
		eraserSettings,
		paintBucketSettings,
		textSettings,
	});

	// 動態設置平移模式的 CSS 類
	useEffect(() => {
		if (containerRef.current) {
			if (activeTool === 'pan') {
				containerRef.current.classList.add('pan-mode');
			} else {
				containerRef.current.classList.remove('pan-mode');
			}
		}
	}, [activeTool]);

	return (
		<div ref={containerRef} className="canvas-container">
			<div className="canvas-wrapper" style={{ position: "relative", flex: 1 }}>
				<canvas ref={canvasRef} />
				<CanvasControls canvas={fabricCanvasRef.current} chatWidth={chatWidth} isChatOpen={isChatOpen} />
			</div>
		</div>
	);
};

Canvas.propTypes = {
	activeTool: PropTypes.string.isRequired,
	brushSettings: PropTypes.shape({
		type: PropTypes.oneOf([
			"PencilBrush",
			"PatternBrush",
			"VLineBrush",
			"HLineBrush",
			"MarkerBrush",
			"ShadedBrush",
			"RibbonBrush",
			"LongfurBrush",
			"InkBrush",
			"FurBrush",
			"CrayonBrush",
			"SketchyBrush",
			"WebBrush",
			"SquaresBrush",
			"SpraypaintBrush",
		]).isRequired,
		color: PropTypes.string.isRequired,
		width: PropTypes.number.isRequired,
		opacity: PropTypes.number.isRequired,
		shadow: PropTypes.shape({
			blur: PropTypes.number,
			offsetX: PropTypes.number,
			offsetY: PropTypes.number,
			color: PropTypes.string,
		}),
	}).isRequired,
	shapeSettings: PropTypes.shape({
		type: PropTypes.string.isRequired,
		fill: PropTypes.string,
		stroke: PropTypes.string,
		strokeWidth: PropTypes.number,
	}).isRequired,
	eraserSettings: PropTypes.shape({
		type: PropTypes.oneOf(["object", "path"]).isRequired,
		size: PropTypes.number.isRequired,
	}).isRequired,
	paintBucketSettings: PropTypes.shape({
		color: PropTypes.string.isRequired,
		tolerance: PropTypes.number.isRequired,
	}).isRequired,
	textSettings: PropTypes.shape({
		fontFamily: PropTypes.string.isRequired,
		fontSize: PropTypes.number.isRequired,
		fill: PropTypes.string.isRequired,
		textAlign: PropTypes.string.isRequired,
	}).isRequired,
	clearTrigger: PropTypes.number.isRequired,
	onCanvasInit: PropTypes.func,
	chatWidth: PropTypes.number,
	isChatOpen: PropTypes.bool,
};

export default Canvas;
