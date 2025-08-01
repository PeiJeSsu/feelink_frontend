import { useCallback, useRef, useEffect } from "react";
import { setDrawingMode } from "../helpers/canvas/CanvasOperations";
import { setPanningMode } from "../helpers/canvas/PanHelper";
import { createBrush, setupBrushEventListeners } from "../helpers/brush/BrushTools";
import { setupShapeDrawing, disableShapeDrawing } from "../helpers/shape/ShapeTools";
import { setupEraser, disableEraser } from "../helpers/eraser/ObjectEraserTools";
import { setupPathEraser, disablePathEraser } from "../helpers/eraser/PathEraserTools";
import { setupPaintBucket, disablePaintBucket } from "../helpers/paint-bucket/PaintBucketTools";
import { setupTextTool, updateActiveTextbox } from "../helpers/text/TextTools";

/**
 * 管理畫布工具的 Hook
 * @param {Object} canvas - Fabric.js 畫布實例
 * @param {Object} options - 工具設定選項
 */
export const useCanvasTools = (
	canvas,
	{ activeTool, brushSettings, shapeSettings, eraserSettings, paintBucketSettings, textSettings }
) => {
	const eraserRef = useRef(null);
	const pathEraserRef = useRef(null);
	const paintBucketRef = useRef(null);

	// 禁用所有工具
	const disableAllTools = useCallback(() => {
		if (!canvas) return;

		setDrawingMode(canvas, false);
		disableShapeDrawing(canvas);
		disableEraser(canvas);
		disablePathEraser(canvas);
		disablePaintBucket(canvas);
		setPanningMode(canvas, false);
	}, [canvas]);

	// 設置畫筆工具
	const setupBrushTool = useCallback(() => {
		if (!canvas) return;

		setDrawingMode(canvas, true);
		canvas.freeDrawingBrush = createBrush(canvas, brushSettings.type, brushSettings);
		setupBrushEventListeners(canvas, brushSettings);
	}, [canvas, brushSettings]);

	// 設置文字工具
	const setupTextToolHandler = useCallback(() => {
		if (!canvas) return;

		setupTextTool(canvas, textSettings);
	}, [canvas, textSettings]);

	// 設置圖形工具
	const setupShapeTool = useCallback(() => {
		if (!canvas) return;

		setupShapeDrawing(canvas, shapeSettings);
	}, [canvas, shapeSettings]);

	// 設置橡皮擦工具
	const setupEraserTool = useCallback(() => {
		if (!canvas) return;

		if (eraserSettings.type === "path") {
			pathEraserRef.current = setupPathEraser(canvas, eraserSettings);
		} else {
			eraserRef.current = setupEraser(canvas, eraserSettings);
		}
	}, [canvas, eraserSettings]);

	// 設置填充工具
	const setupPaintBucketTool = useCallback(() => {
		if (!canvas) return;

		paintBucketRef.current = setupPaintBucket(canvas, paintBucketSettings);
	}, [canvas, paintBucketSettings]);

	// 設置平移工具
	const setupPanTool = useCallback(() => {
		if (!canvas) return;

		setPanningMode(canvas, true);
	}, [canvas]);

	// 根據當前工具更新畫布模式
	useEffect(() => {
		if (!canvas) return;

		try {
			// 先禁用所有工具
			disableAllTools();

			// 根據當前工具設置相應的模式
			switch (activeTool) {
				case "select":
					// 選擇工具不需要特別設置，保持預設的選擇模式
					canvas.isDrawingMode = false;
					canvas.selection = true;
					canvas.defaultCursor = "default";
					break;
				case "pencil":
					setupBrushTool();
					break;
				case "text":
					setupTextToolHandler();
					break;
				case "shape":
					setupShapeTool();
					break;
				case "eraser":
					setupEraserTool();
					break;
				case "paintBucket":
					setupPaintBucketTool();
					break;
				case "pan":
					setupPanTool();
					break;
				default:
					break;
			}
		} catch (error) {
			console.error("設置工具時發生錯誤:", error);
		}
	}, [
		canvas,
		activeTool,
		disableAllTools,
		setupBrushTool,
		setupTextToolHandler,
		setupShapeTool,
		setupEraserTool,
		setupPaintBucketTool,
		setupPanTool,
	]);

	// 更新橡皮擦大小
	useEffect(() => {
		if (activeTool === "eraser" && eraserSettings) {
			try {
				if (eraserSettings.type === "path" && pathEraserRef.current) {
					pathEraserRef.current.updateSize(eraserSettings.size);
				} else if (eraserRef.current) {
					eraserRef.current.updateSize(eraserSettings.size);
				}
			} catch (error) {
				console.error("更新橡皮擦大小時發生錯誤:", error);
			}
		}
	}, [eraserSettings, activeTool]);

	// 更新填充工具設定
	useEffect(() => {
		if (activeTool === "paintBucket" && paintBucketSettings && paintBucketRef.current) {
			try {
				paintBucketRef.current.updateColor(paintBucketSettings.color);
				paintBucketRef.current.updateTolerance(paintBucketSettings.tolerance);
			} catch (error) {
				console.error("更新填充工具設定時發生錯誤:", error);
			}
		}
	}, [paintBucketSettings, activeTool]);

	// 更新文字設定
	useEffect(() => {
		if (!canvas || activeTool !== "text") return;

		try {
			updateActiveTextbox(canvas, textSettings);
		} catch (error) {
			console.error("更新文字設定時發生錯誤:", error);
		}
	}, [canvas, textSettings, activeTool]);
};
