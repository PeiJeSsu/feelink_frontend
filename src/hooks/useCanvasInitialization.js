import { useRef, useEffect, useCallback } from "react";
import { initializeCanvas, resizeCanvas, clearCanvas } from "../helpers/canvas/CanvasOperations";
import createHistoryManager from "../helpers/history/HistoryManager";

/**
 * 處理畫布初始化和清理的 Hook
 * @param {Object} options - 初始化選項
 * @returns {Object} 畫布相關的 refs
 */
export const useCanvasInitialization = ({ onCanvasInit, clearTrigger }) => {
	const canvasRef = useRef(null);
	const fabricCanvasRef = useRef(null);
	// 使用 useRef 來保存歷史管理器實例，但不在外部暴露
	const historyManagerRef = useRef(null);

	// 處理視窗大小變化
	const handleResize = useCallback(() => {
		if (!fabricCanvasRef.current) return;

		try {
			const container = document.querySelector(".canvas-container");
			const containerWidth = container ? container.clientWidth : window.innerWidth - 60;
			const containerHeight = container ? container.clientHeight : window.innerHeight;

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
			const containerWidth = container ? container.clientWidth : window.innerWidth - 60;
			const containerHeight = container ? container.clientHeight : window.innerHeight;

			// 初始化 Fabric.js 畫布
			fabricCanvasRef.current = initializeCanvas(canvasRef.current, containerWidth, containerHeight);

			// 初始化歷史管理器
			historyManagerRef.current = createHistoryManager(fabricCanvasRef.current);
			fabricCanvasRef.current.historyManager = historyManagerRef.current;

			if (historyManagerRef.current) {
				historyManagerRef.current.saveState();
			}

			// 通知父組件畫布已初始化
			if (onCanvasInit && typeof onCanvasInit === "function") {
				onCanvasInit(fabricCanvasRef.current);
			}

			// 立即渲染畫布
			fabricCanvasRef.current.renderAll();

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

	// 只返回必要的 refs
	return {
		canvasRef,
		fabricCanvasRef,
	};
};
