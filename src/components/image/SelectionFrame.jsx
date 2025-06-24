import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";

const SelectionFrame = ({ position, onPositionChange, containerRef, maxWidth, maxHeight, color = "#1976d2" }) => {
	const frameRef = useRef(null);
	const [isDragging, setIsDragging] = useState(false);
	const [isResizing, setIsResizing] = useState(false);
	const [resizeHandle, setResizeHandle] = useState("");
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

	const handleMouseDown = (e) => {
		if (!containerRef.current) return;

		const container = containerRef.current.getBoundingClientRect();
		const mouseX = e.clientX - container.left;
		const mouseY = e.clientY - container.top;

		setDragStart({ x: mouseX, y: mouseY });
		setIsDragging(true);
	};

	// 處理調整大小的滑鼠按下事件
	const handleResizeMouseDown = (e, handle) => {
		e.stopPropagation();
		if (!containerRef.current) return;

		const container = containerRef.current.getBoundingClientRect();
		const mouseX = e.clientX - container.left;
		const mouseY = e.clientY - container.top;

		setDragStart({ x: mouseX, y: mouseY });
		setIsResizing(true);
		setResizeHandle(handle);
	};

	// 處理滑鼠移動事件
	useEffect(() => {
		const handleMouseMove = (e) => {
			if (!containerRef.current || (!isDragging && !isResizing)) return;

			const container = containerRef.current.getBoundingClientRect();
			const mouseX = e.clientX - container.left;
			const mouseY = e.clientY - container.top;

			if (isDragging) {
				const deltaX = mouseX - dragStart.x;
				const deltaY = mouseY - dragStart.y;

				let newX = position.x + deltaX;
				let newY = position.y + deltaY;

				newX = Math.max(0, Math.min(newX, maxWidth - position.width));
				newY = Math.max(0, Math.min(newY, maxHeight - position.height));

				onPositionChange({
					...position,
					x: newX,
					y: newY,
				});

				setDragStart({ x: mouseX, y: mouseY });
			} else if (isResizing) {
				const deltaX = mouseX - dragStart.x;
				const deltaY = mouseY - dragStart.y;

				let newPosition = { ...position };

				if (resizeHandle === "se") {
					newPosition.width = Math.max(50, Math.min(position.width + deltaX, maxWidth - position.x));
					newPosition.height = Math.max(50, Math.min(position.height + deltaY, maxHeight - position.y));
				}
				onPositionChange(newPosition);
				setDragStart({ x: mouseX, y: mouseY });
			}
		};

		const handleMouseUp = () => {
			setIsDragging(false);
			setIsResizing(false);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, isResizing, dragStart, position, onPositionChange, resizeHandle, containerRef, maxWidth, maxHeight]);

	return (
		<Box
			ref={frameRef}
			onMouseDown={handleMouseDown}
			sx={{
				position: "absolute",
				left: position.x,
				top: position.y,
				width: position.width,
				height: position.height,
				border: `2px dashed ${color}`,
				cursor: isDragging ? "grabbing" : "grab",
				boxSizing: "border-box",
			}}
		>
			<Box
				onMouseDown={(e) => handleResizeMouseDown(e, "se")}
				sx={{
					position: "absolute",
					right: -5,
					bottom: -5,
					width: 10,
					height: 10,
					backgroundColor: color,
					cursor: "nwse-resize",
				}}
			/>
		</Box>
	);
};

SelectionFrame.propTypes = {
	position: PropTypes.shape({
		x: PropTypes.number.isRequired,
		y: PropTypes.number.isRequired,
		width: PropTypes.number.isRequired,
		height: PropTypes.number.isRequired,
	}).isRequired,
	onPositionChange: PropTypes.func.isRequired,
	containerRef: PropTypes.object.isRequired,
	maxWidth: PropTypes.number.isRequired,
	maxHeight: PropTypes.number.isRequired,
	color: PropTypes.string,
};

export default SelectionFrame;
