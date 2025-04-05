import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import "./Canvas.css";
import { initializeCanvas, resizeCanvas, clearCanvas, setDrawingMode } from "../../helpers/canvas/CanvasOperations";
import { setPanningMode } from "../../helpers/canvas/PanHelper";
import { createBrush, setupBrushEventListeners } from "../../helpers/brush/BrushTools";
import { setupShapeDrawing, disableShapeDrawing } from "../../helpers/shape/ShapeTools";
import { setupEraser, disableEraser } from "../../helpers/eraser/ObjectEraserTools";
import { setupPathEraser, disablePathEraser } from "../../helpers/eraser/PathEraserTools";
import { setupPaintBucket, disablePaintBucket } from "../../helpers/paint-bucket/PaintBucketTools";
import CanvasControls from "./CanvasControls";
import createHistoryManager from "../../helpers/history/HistoryManager";

const Canvas = ({ 
	activeTool, 
	brushSettings, 
	shapeSettings, 
	eraserSettings, 
	paintBucketSettings,
	clearTrigger, 
	onCanvasInit 
}) => {
	const canvasRef = useRef(null);
	const fabricCanvasRef = useRef(null);
	const eraserRef = useRef(null);
	const pathEraserRef = useRef(null);
	const paintBucketRef = useRef(null);
	const historyManagerRef = useRef(null);

	useEffect(() => {
		const container = document.querySelector(".canvas-container");
		const containerWidth = container ? container.clientWidth : window.innerWidth - 60;
		const containerHeight = container ? container.clientHeight : window.innerHeight;

		fabricCanvasRef.current = initializeCanvas(canvasRef.current, containerWidth, containerHeight);

		historyManagerRef.current = createHistoryManager(fabricCanvasRef.current);

		fabricCanvasRef.current.historyManager = historyManagerRef.current;

		console.log("Canvas initialized with history manager:", {
			canvas: fabricCanvasRef.current,
			historyManager: historyManagerRef.current,
		});

		// 保存初始狀態
		if (fabricCanvasRef.current.historyManager) {
			fabricCanvasRef.current.historyManager.saveState();
		}

		if (onCanvasInit && typeof onCanvasInit === "function") {
			onCanvasInit(fabricCanvasRef.current);
		}

		// 立即渲染畫布
		fabricCanvasRef.current.renderAll();

		// 處理視窗大小變化
		const handleResize = () => {
			const container = document.querySelector(".canvas-container");
			const containerWidth = container ? container.clientWidth : window.innerWidth - 60;
			const containerHeight = container ? container.clientHeight : window.innerHeight;

			resizeCanvas(fabricCanvasRef.current, containerWidth, containerHeight);

			// 確保調整大小後重新渲染
			fabricCanvasRef.current.renderAll();
		};

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
			if (fabricCanvasRef.current) {
				fabricCanvasRef.current.dispose();
			}
			if (historyManagerRef.current) {
				historyManagerRef.current.clear();
			}
		};
	}, [onCanvasInit]);

	// 根據當前工具設置畫布模式
	useEffect(() => {
		if (!fabricCanvasRef.current) return;

		const canvas = fabricCanvasRef.current;

		// 根據當前工具設置繪圖模式
		if (activeTool === "pencil") {
			setDrawingMode(canvas, true);
			disableShapeDrawing(canvas);
			disableEraser(canvas);
			disablePathEraser(canvas);
			disablePaintBucket(canvas);
			setPanningMode(canvas, false);

			// 創建並設置畫筆
			canvas.freeDrawingBrush = createBrush(canvas, brushSettings.type, brushSettings);

			// 設置畫筆事件監聽器
			setupBrushEventListeners(canvas, brushSettings);
		} else if (activeTool === "shape") {
			setDrawingMode(canvas, false);
			disableEraser(canvas);
			disablePathEraser(canvas);
			disablePaintBucket(canvas);
			setPanningMode(canvas, false);

			// 設置圖形繪製
			setupShapeDrawing(canvas, shapeSettings);
		} else if (activeTool === "eraser") {
			setDrawingMode(canvas, false);
			disableShapeDrawing(canvas);
			disablePathEraser(canvas);
			disablePaintBucket(canvas);
			setPanningMode(canvas, false);

			// 根據橡皮擦類型選擇不同的橡皮擦實現
			if (eraserSettings.type === "path") {
				// 設置筆跡橡皮擦
				pathEraserRef.current = setupPathEraser(canvas, eraserSettings);
			} else {
				// 設置物件橡皮擦
				eraserRef.current = setupEraser(canvas, eraserSettings);
			}
		} else if (activeTool === "paintBucket") {
			setDrawingMode(canvas, false);
			disableShapeDrawing(canvas);
			disableEraser(canvas);
			disablePathEraser(canvas);
			setPanningMode(canvas, false);

			// 設置填充工具
			paintBucketRef.current = setupPaintBucket(canvas, paintBucketSettings);
		} else if (activeTool === "pan") {
			// 啟用平移模式
			setDrawingMode(canvas, false);
			disableShapeDrawing(canvas);
			disableEraser(canvas);
			disablePathEraser(canvas);
			disablePaintBucket(canvas);
			setPanningMode(canvas, true);
		} else {
			setDrawingMode(canvas, false);
			disableShapeDrawing(canvas);
			disableEraser(canvas);
			disablePathEraser(canvas);
			disablePaintBucket(canvas);
			setPanningMode(canvas, false);
		}
	}, [activeTool, brushSettings, shapeSettings, eraserSettings, paintBucketSettings]);

	useEffect(() => {
		if (clearTrigger > 0 && fabricCanvasRef.current) {
			if (historyManagerRef.current) {
				historyManagerRef.current.clear();
			}
			clearCanvas(fabricCanvasRef.current);
		}
	}, [clearTrigger]);

	// 當橡皮擦設置變化時更新橡皮擦大小
	useEffect(() => {
		if (activeTool === "eraser" && eraserSettings) {
			if (eraserSettings.type === "path" && pathEraserRef.current) {
				pathEraserRef.current.updateSize(eraserSettings.size);
			} else if (eraserRef.current) {
				eraserRef.current.updateSize(eraserSettings.size);
			}
		}
	}, [eraserSettings, activeTool]);

	// 當填充工具設置變化時更新填充工具
	useEffect(() => {
		if (activeTool === "paintBucket" && paintBucketSettings && paintBucketRef.current) {
			paintBucketRef.current.updateColor(paintBucketSettings.color);
			paintBucketRef.current.updateTolerance(paintBucketSettings.tolerance);
		}
	}, [paintBucketSettings, activeTool]);

	return (
		<div className="canvas-wrapper">
			<canvas ref={canvasRef} />
			<CanvasControls canvas={fabricCanvasRef.current} />
		</div>
	);
};

Canvas.propTypes = {
	activeTool: PropTypes.string.isRequired,
	brushSettings: PropTypes.object.isRequired,
	shapeSettings: PropTypes.object.isRequired,
	eraserSettings: PropTypes.object.isRequired,
	paintBucketSettings: PropTypes.object.isRequired,
	clearTrigger: PropTypes.number.isRequired,
	onCanvasInit: PropTypes.func,
};

export default Canvas;
