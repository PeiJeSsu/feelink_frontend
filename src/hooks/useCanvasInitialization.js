import { useRef, useEffect, useCallback } from "react";
import { initializeCanvas, resizeCanvas, clearCanvas } from "../helpers/canvas/CanvasOperations";
import { setupPinchZoom } from "../helpers/canvas/ZoomHelper";
import createHistoryManager from "../helpers/history/HistoryManager";

/**
 * 處理畫布初始化和清理的 Hook
 * @param {Object} options - 初始化選項
 * @returns {Object} 畫布相關的 refs
 */
export const useCanvasInitialization = ({ onCanvasInit, clearTrigger, chatWidth = 0, isChatOpen = false }) => {
	const canvasRef = useRef(null);
	const fabricCanvasRef = useRef(null);
	const historyManagerRef = useRef(null);
	const pinchZoomCleanupRef = useRef(null);

	// 處理視窗大小變化
	const handleResize = useCallback(() => {
		if (!fabricCanvasRef.current) return;

		try {
			const container = document.querySelector(".canvas-container");
			if (!container) return;

			const containerWidth = container.clientWidth;
			const containerHeight = container.clientHeight;

			resizeCanvas(fabricCanvasRef.current, containerWidth, containerHeight);
			fabricCanvasRef.current.renderAll();
		} catch (error) {
			console.error("調整畫布大小時發生錯誤:", error);
		}
	}, []);

	// 初始化畫布
	useEffect(() => {
		try {
			const container = document.querySelector(".canvas-container");
			if (!container) {
				console.error("找不到畫布容器");
				return;
			}

			const containerWidth = container.clientWidth;
			const containerHeight = container.clientHeight;

			fabricCanvasRef.current = initializeCanvas(canvasRef.current, containerWidth, containerHeight);

			historyManagerRef.current = createHistoryManager(fabricCanvasRef.current);
			fabricCanvasRef.current.historyManager = historyManagerRef.current;

			if (historyManagerRef.current) {
				historyManagerRef.current.saveState();
			}

			// 通知父組件畫布已初始化
			if (onCanvasInit && typeof onCanvasInit === "function") {
				onCanvasInit(fabricCanvasRef.current);
			}

			fabricCanvasRef.current.renderAll();

			// 設置兩指縮放功能 (移動設備)
			pinchZoomCleanupRef.current = setupPinchZoom(fabricCanvasRef.current);

			// 添加視窗大小變化監聽器
			window.addEventListener("resize", handleResize);

			console.log("畫布初始化完成:", {
				canvas: fabricCanvasRef.current,
				historyManager: historyManagerRef.current,
			});
		} catch (error) {
			console.error("初始化畫布時發生錯誤:", error);
		}

		// 清理函數
		return () => {
			window.removeEventListener("resize", handleResize);

			try {
				if (pinchZoomCleanupRef.current) {
					pinchZoomCleanupRef.current();
					pinchZoomCleanupRef.current = null;
				}

				if (fabricCanvasRef.current) {
					fabricCanvasRef.current.dispose();
				}
				if (historyManagerRef.current) {
					historyManagerRef.current.dispose();
				}
			} catch (error) {
				console.error("清理畫布資源時發生錯誤:", error);
			}
		};
	}, [onCanvasInit, handleResize]);

	// 監聽聊天室寬度變化並調整畫布尺寸
	useEffect(() => {
		if (fabricCanvasRef.current) {
			handleResize();
		}
	}, [chatWidth, isChatOpen, handleResize]);

	// 處理清除畫布
	useEffect(() => {
		if (clearTrigger > 0 && fabricCanvasRef.current) {
			try {
				if (historyManagerRef.current) {
					historyManagerRef.current.clear();
				}
				clearCanvas(fabricCanvasRef.current);
			} catch (error) {
				console.error("清除畫布時發生錯誤:", error);
			}
		}
	}, [clearTrigger]);

	return {
		canvasRef,
		fabricCanvasRef,
	};
};
