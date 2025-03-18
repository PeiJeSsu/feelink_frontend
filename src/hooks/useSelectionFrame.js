import { useState, useEffect } from "react";

export const useSelectionFrame = (initialPosition, containerRef, maxWidth, maxHeight, onPositionChange) => {
	const [position, setPosition] = useState(initialPosition);
	const [isDragging, setIsDragging] = useState(false);
	const [isResizing, setIsResizing] = useState(false);
	const [resizeHandle, setResizeHandle] = useState("");
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

	// 處理滑鼠按下事件
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

	// 設置位置並觸發回調
	const updatePosition = (newPosition) => {
		setPosition(newPosition);
		if (onPositionChange) {
			onPositionChange(newPosition);
		}
	};

	// 處理滑鼠移動事件
	useEffect(() => {
		const handleMouseMove = (e) => {
			if (!containerRef.current || (!isDragging && !isResizing)) return;

			const container = containerRef.current.getBoundingClientRect();
			const mouseX = e.clientX - container.left;
			const mouseY = e.clientY - container.top;

			// 計算移動距離
			const deltaX = mouseX - dragStart.x;
			const deltaY = mouseY - dragStart.y;

			if (isDragging) {
				// 拖動模式
				const newX = Math.max(0, Math.min(maxWidth - position.width, position.x + deltaX));
				const newY = Math.max(0, Math.min(maxHeight - position.height, position.y + deltaY));

				updatePosition({
					...position,
					x: newX,
					y: newY,
				});
			} else if (isResizing) {
				// 調整大小模式
				const minSize = 50; // 最小尺寸

				if (resizeHandle === "se") {
					const newWidth = Math.max(minSize, Math.min(maxWidth - position.x, position.width + deltaX));
					const newHeight = Math.max(minSize, Math.min(maxHeight - position.y, position.height + deltaY));

					updatePosition({
						...position,
						width: newWidth,
						height: newHeight,
					});
				}
			}

			setDragStart({ x: mouseX, y: mouseY });
		};

		const handleMouseUp = () => {
			setIsDragging(false);
			setIsResizing(false);
		};

		if (isDragging || isResizing) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, isResizing, dragStart, position, onPositionChange, resizeHandle, containerRef, maxWidth, maxHeight]);

	return {
		position,
		isDragging,
		handleMouseDown,
		handleResizeMouseDown,
	};
};
