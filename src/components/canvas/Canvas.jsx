import PropTypes from "prop-types";
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
}) => {
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

	return (
		<div className="canvas-wrapper">
			<canvas ref={canvasRef} />
			<CanvasControls canvas={fabricCanvasRef.current} />
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
			"SpraypaintBrush"
		]).isRequired,
		color: PropTypes.string.isRequired,
		width: PropTypes.number.isRequired,
		opacity: PropTypes.number.isRequired,
		shadow: PropTypes.shape({
			blur: PropTypes.number,
			offsetX: PropTypes.number,
			offsetY: PropTypes.number,
			color: PropTypes.string
		})
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
};

export default Canvas;
