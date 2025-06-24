import React, { useState, useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Box, IconButton, Slider, Typography, useTheme, useMediaQuery } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { zoomIn, zoomOut, setZoomLevel, handleWheelZoom, resetCanvasView } from "../../helpers/canvas/ZoomHelper";
import "./CanvasControls.css";

const ZoomControls = ({ canvas, chatWidth = 0, isChatOpen = false }) => {
	const [zoomLevelState, setZoomLevelState] = useState(1);
	const [isDragging, setIsDragging] = useState(false);
	const [showSlider, setShowSlider] = useState(true);
	const zoomUpdateTimer = useRef(null);
	const controlsRef = useRef(null);
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

	useEffect(() => {
		const updateLayout = () => {
			const windowWidth = window.innerWidth;
			const leftToolbarWidth = 64;
			const chatOffset = isChatOpen ? chatWidth : 0;
			const availableSpace = windowWidth - leftToolbarWidth - chatOffset;

			// 如果可用空間小於 350px 或在移動裝置上，則隱藏slider
			setShowSlider(availableSpace > 350 && !isMobile);
		};

		updateLayout();
		window.addEventListener("resize", updateLayout);
		return () => window.removeEventListener("resize", updateLayout);
	}, [isChatOpen, chatWidth, isMobile]);

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
		<Box ref={controlsRef} className="canvas-controls-panel">
			<IconButton onClick={handleZoomOut} title="縮小">
				<ZoomOutIcon />
			</IconButton>

			{showSlider ? (
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
						sx={{
							"& .MuiSlider-track": {
								backgroundColor: "#f7cac9",
							},
							"& .MuiSlider-rail": {
								backgroundColor: "rgba(92, 92, 92, 0.2)",
							},
						}}
					/>
					<Typography
						variant="caption"
						sx={{
							color: "#333333",
							fontWeight: "medium",
							minWidth: 40,
							textAlign: "center",
							mx: 1,
						}}
					>
						{Math.round(zoomLevelState * 100)}%
					</Typography>
				</Box>
			) : (
				<Typography
					variant="caption"
					sx={{
						color: "#333333",
						fontWeight: "medium",
						minWidth: 40,
						textAlign: "center",
						mx: 1,
					}}
				>
					{Math.round(zoomLevelState * 100)}%
				</Typography>
			)}

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
	chatWidth: PropTypes.number,
	isChatOpen: PropTypes.bool,
};

export default ZoomControls;
