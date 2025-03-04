import React, { useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, IconButton, Slider, Typography } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { zoomCanvas, resetCanvasView } from "./CanvasOperations";
import * as fabric from "fabric";
import "./CanvasControls.css";

const CanvasControls = ({ canvas }) => {
	const [zoomLevel, setZoomLevel] = useState(1);
	const [isDragging, setIsDragging] = useState(false);

	// 處理縮放控制
	const handleZoomIn = useCallback(() => {
		if (canvas) {
			const newZoomLevel = Math.min(zoomLevel + 0.1, 5);
			applyZoom(newZoomLevel);
		}
	}, [canvas, zoomLevel]);

	const handleZoomOut = useCallback(() => {
		if (canvas) {
			const newZoomLevel = Math.max(zoomLevel - 0.1, 0.1);
			applyZoom(newZoomLevel);
		}
	}, [canvas, zoomLevel]);

	// 滑塊開始拖動
	const handleSliderStart = useCallback(() => {
		setIsDragging(true);
	}, []);

	// 滑塊拖動中
	const handleZoomSliderChange = useCallback(
		(event, newValue) => {
			if (canvas) {
				// 立即更新顯示的縮放級別
				setZoomLevel(newValue);

				// 如果正在拖動，則立即應用縮放
				if (isDragging) {
					applyZoomDirectly(newValue);
				}
			}
		},
		[canvas, isDragging]
	);

	// 滑塊拖動結束
	const handleSliderEnd = useCallback(() => {
		setIsDragging(false);
		// 確保最終縮放級別被正確應用
		if (canvas) {
			applyZoomDirectly(zoomLevel);
		}
	}, [canvas, zoomLevel]);

	// 直接應用縮放，不考慮相對變化
	const applyZoomDirectly = useCallback(
		(newZoomLevel) => {
			if (canvas) {
				// 計算縮放比例
				const zoomRatio = newZoomLevel / canvas.zoomLevel;
				const center = new fabric.Point(canvas.width / 2, canvas.height / 2);

				// 應用縮放
				zoomCanvas(canvas, zoomRatio, center);

				// 強制重新渲染
				canvas.renderAll();
			}
		},
		[canvas]
	);

	// 相對縮放（用於按鈕點擊）
	const applyZoom = useCallback(
		(newZoomLevel) => {
			if (canvas) {
				const center = new fabric.Point(canvas.width / 2, canvas.height / 2);
				const updatedZoom = zoomCanvas(canvas, newZoomLevel / zoomLevel, center);
				setZoomLevel(updatedZoom || newZoomLevel);
			}
		},
		[canvas, zoomLevel]
	);

	const handleResetView = useCallback(() => {
		if (canvas) {
			const newZoom = resetCanvasView(canvas);
			setZoomLevel(newZoom);
		}
	}, [canvas]);

	// 同步畫布的縮放級別
	useEffect(() => {
		if (canvas && !isDragging && canvas.zoomLevel !== zoomLevel) {
			setZoomLevel(canvas.zoomLevel);
		}
	}, [canvas, isDragging, zoomLevel]);

	return (
		<Box className="canvas-controls-container">
			<Box className="canvas-controls-panel">
				<IconButton onClick={handleZoomOut} title="縮小">
					<ZoomOutIcon />
				</IconButton>
				<Box className="zoom-slider-container">
					<Slider
						value={zoomLevel}
						min={0.1}
						max={5}
						step={0.1}
						onChange={handleZoomSliderChange}
						onChangeCommitted={handleSliderEnd}
						onMouseDown={handleSliderStart}
						onTouchStart={handleSliderStart}
						aria-labelledby="zoom-slider"
					/>
					<Typography variant="caption">{Math.round(zoomLevel * 100)}%</Typography>
				</Box>
				<IconButton onClick={handleZoomIn} title="放大">
					<ZoomInIcon />
				</IconButton>
				<IconButton onClick={handleResetView} title="重置視圖">
					<RestartAltIcon />
				</IconButton>
			</Box>
		</Box>
	);
};

CanvasControls.propTypes = {
	canvas: PropTypes.object,
};

export default CanvasControls;
