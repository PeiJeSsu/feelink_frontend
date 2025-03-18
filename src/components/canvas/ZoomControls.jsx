import React, { useState, useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Box, IconButton, Slider, Typography } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { zoomIn, zoomOut, setZoomLevel, handleWheelZoom, resetCanvasView } from "../../helpers/canvas/ZoomHelper";
import "./CanvasControls.css";

const ZoomControls = ({ canvas }) => {
	const [zoomLevelState, setZoomLevelState] = useState(1);
	const [isDragging, setIsDragging] = useState(false);
	const zoomUpdateTimer = useRef(null);

	// 設置滾輪縮放 - 獨立的 effect，只依賴於 canvas
	useEffect(() => {
		if (!canvas) return;

		// 自定義滾輪縮放事件
		canvas.off("mouse:wheel");

		const wheelHandler = (opt) => {
			const newZoom = handleWheelZoom(canvas, opt);
			if (newZoom) {
				setZoomLevelState(newZoom);
			}
		};

		canvas.on("mouse:wheel", wheelHandler);

		// 清理函數
		return () => {
			if (canvas) {
				canvas.off("mouse:wheel", wheelHandler);
			}
		};
	}, [canvas]);

	// 設置畫布同步 - 獨立的 effect
	useEffect(() => {
		if (!canvas) return;

		// 添加滾輪縮放事件監聽器
		const handleCanvasZoom = () => {
			if (canvas.zoomLevel !== zoomLevelState) {
				const roundedZoom = Math.round(canvas.zoomLevel * 10) / 10;
				if (roundedZoom !== zoomLevelState) {
					canvas.zoomLevel = roundedZoom;
					setZoomLevelState(roundedZoom);
					canvas.renderAll();
				}
			}
		};

		// 輪詢更新縮放級別
		zoomUpdateTimer.current = setInterval(handleCanvasZoom, 100);

		return () => {
			if (zoomUpdateTimer.current) {
				clearInterval(zoomUpdateTimer.current);
			}
		};
	}, [canvas, zoomLevelState]);

	// 處理縮放控制
	const handleZoomIn = useCallback(() => {
		if (canvas) {
			const newZoomLevel = zoomIn(canvas, zoomLevelState);
			setZoomLevelState(newZoomLevel);
		}
	}, [canvas, zoomLevelState]);

	const handleZoomOut = useCallback(() => {
		if (canvas) {
			const newZoomLevel = zoomOut(canvas, zoomLevelState);
			setZoomLevelState(newZoomLevel);
		}
	}, [canvas, zoomLevelState]);

	const handleResetView = useCallback(() => {
		if (canvas) {
			resetCanvasView(canvas);
			setZoomLevelState(1);
		}
	}, [canvas]);

	const handleSliderStart = useCallback(() => {
		setIsDragging(true);
	}, []);

	const handleZoomSliderChange = useCallback(
		(event, newValue) => {
			if (canvas) {
				const roundedValue = Math.round(newValue * 10) / 10;
				setZoomLevelState(roundedValue);

				if (isDragging) {
					setZoomLevel(canvas, roundedValue);
				}
			}
		},
		[canvas, isDragging]
	);

	const handleSliderEnd = useCallback(() => {
		setIsDragging(false);
		if (canvas) {
			const roundedZoom = Math.round(zoomLevelState * 10) / 10;
			setZoomLevel(canvas, roundedZoom);
			setZoomLevelState(roundedZoom);
		}
	}, [canvas, zoomLevelState]);

	return (
		<Box className="canvas-controls-panel">
			<IconButton onClick={handleZoomOut} title="縮小">
				<ZoomOutIcon />
			</IconButton>

			<Box className="zoom-slider-container">
				<Slider
					value={zoomLevelState}
					min={0.1}
					max={5}
					step={0.1}
					onChange={handleZoomSliderChange}
					onChangeCommitted={handleSliderEnd}
					onMouseDown={handleSliderStart}
					onTouchStart={handleSliderStart}
					aria-labelledby="zoom-slider"
				/>
				<Typography variant="caption">{Math.round(zoomLevelState * 100)}%</Typography>
			</Box>

			<IconButton onClick={handleZoomIn} title="放大">
				<ZoomInIcon />
			</IconButton>

			<IconButton onClick={handleResetView} title="重置視圖">
				<RestartAltIcon />
			</IconButton>
		</Box>
	);
};

ZoomControls.propTypes = {
	canvas: PropTypes.object,
};

export default ZoomControls;
