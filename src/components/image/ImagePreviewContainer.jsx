import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, Typography, CircularProgress } from "@mui/material";
import SelectionFrame from "./SelectionFrame";
import { useImageInteraction } from "../../hooks/useImageInteraction";
import {
	calculateImageDisplayProps,
	calculateInitialSelection,
	convertSelectionToImageCoordinates,
} from "../../helpers/image/ImagePreview";

const ImagePreviewContainer = ({
	previewImage,
	loading,
	onSelectionChange,
	initialSelection = { x: 0, y: 0, width: 500, height: 500 },
}) => {
	const containerRef = useRef(null);
	const imageRef = useRef(null);

	const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
	const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
	const [selectionPosition, setSelectionPosition] = useState(initialSelection);

	const {
		offset: previewOffset,
		setOffset: setPreviewOffset,
		scale: previewScale,
		setScale: setPreviewScale,
		handleMouseDown: handleCanvasMouseDown,
		handleWheel,
	} = useImageInteraction();

	useEffect(() => {
		if (!previewImage || !containerRef.current) return;

		const img = new Image();
		img.onload = () => {
			if (!containerRef.current) return;

			const containerRect = containerRef.current.getBoundingClientRect();
			const newContainerSize = {
				width: containerRect.width,
				height: containerRect.height,
			};
			setContainerSize(newContainerSize);

			const newImageSize = { width: img.width, height: img.height };
			setImageSize(newImageSize);

			// 計算最佳顯示屬性
			const displayProps = calculateImageDisplayProps(newContainerSize, newImageSize);
			setPreviewScale(displayProps.scale);
			setPreviewOffset(displayProps.offset);

			// 設置初始選區
			const scaledImageSize = {
				width: newImageSize.width * displayProps.scale,
				height: newImageSize.height * displayProps.scale,
			};
			const initialSelectionPos = calculateInitialSelection(scaledImageSize, displayProps.offset);
			setSelectionPosition(initialSelectionPos);
		};
		img.src = previewImage;
	}, [previewImage, setPreviewOffset, setPreviewScale]);

	// 更新選區位置後觸發上層事件
	useEffect(() => {
		if (!imageRef.current || !previewImage) return;

		// 將選區位置轉換為相對於原始圖像的比例位置
		const relativeSelection = convertSelectionToImageCoordinates(selectionPosition, previewOffset, previewScale);

		onSelectionChange(relativeSelection);
	}, [selectionPosition, previewScale, previewOffset, onSelectionChange, previewImage]);

	const handleImageWheel = (e) => {
		handleWheel(e, containerRef);
	};

	return (
		<Box
			ref={containerRef}
			onMouseDown={handleCanvasMouseDown}
			onWheel={handleImageWheel}
			sx={{
				position: "relative",
				width: "100%",
				height: "450px",
				overflow: "hidden",
				backgroundColor: "#f5f5f5",
				borderRadius: 1,
				userSelect: "none",
			}}
		>
			{loading && (
				<Box
					sx={{
						position: "absolute",
						left: 0,
						top: 0,
						right: 0,
						bottom: 0,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<CircularProgress />
				</Box>
			)}

			{previewImage && !loading && (
				<>
					<img
						ref={imageRef}
						src={previewImage}
						alt="Canvas Preview"
						style={{
							position: "absolute",
							left: previewOffset.x,
							top: previewOffset.y,
							width: `${imageSize.width * previewScale}px`,
							height: `${imageSize.height * previewScale}px`,
							pointerEvents: "none",
						}}
					/>

					<SelectionFrame
						position={selectionPosition}
						onPositionChange={setSelectionPosition}
						containerRef={containerRef}
						maxWidth={containerSize.width}
						maxHeight={containerSize.height}
					/>
				</>
			)}

			{!previewImage && !loading && (
				<Typography align="center" sx={{ mt: 10 }}>
					無法生成預覽
				</Typography>
			)}
		</Box>
	);
};

ImagePreviewContainer.propTypes = {
	previewImage: PropTypes.string,
	loading: PropTypes.bool.isRequired,
	onSelectionChange: PropTypes.func.isRequired,
	initialSelection: PropTypes.shape({
		x: PropTypes.number,
		y: PropTypes.number,
		width: PropTypes.number,
		height: PropTypes.number,
	}),
};

export default ImagePreviewContainer;
