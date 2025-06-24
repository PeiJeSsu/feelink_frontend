import { useState, useEffect } from "react";

/**
 * 處理圖像拖動和縮放
 * @param {Object} initialOffset - 初始偏移量 {x, y}
 * @param {number} initialScale - 初始縮放比例
 * @returns {Object} - 包含拖動和縮放狀態及處理函數的對象
 */
export const useImageInteraction = (initialOffset = { x: 0, y: 0 }, initialScale = 1) => {
	const [offset, setOffset] = useState(initialOffset);
	const [scale, setScale] = useState(initialScale);
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

	const handleMouseDown = (e) => {
		if (e.button === 1) {
			// 中鍵
			e.preventDefault();
			setIsDragging(true);
			setDragStart({ x: e.clientX, y: e.clientY });
		}
	};

	const handleWheel = (e, containerRef) => {
		if (!containerRef.current) return;
		e.preventDefault();

		const delta = e.deltaY < 0 ? 1.1 : 0.9;
		const newScale = Math.max(0.1, Math.min(5, scale * delta));

		const rect = containerRef.current.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		// 計算鼠標相對於圖像的位置
		const relativeX = (mouseX - offset.x) / scale;
		const relativeY = (mouseY - offset.y) / scale;

		// 保持鼠標位置不變的新偏移
		const newOffsetX = mouseX - relativeX * newScale;
		const newOffsetY = mouseY - relativeY * newScale;

		setScale(newScale);
		setOffset({ x: newOffsetX, y: newOffsetY });
	};

	// 滑鼠移動事件處理
	useEffect(() => {
		const handleMouseMove = (e) => {
			if (!isDragging) return;

			const deltaX = e.clientX - dragStart.x;
			const deltaY = e.clientY - dragStart.y;

			setOffset({
				x: offset.x + deltaX,
				y: offset.y + deltaY,
			});

			setDragStart({ x: e.clientX, y: e.clientY });
		};

		const handleMouseUp = () => {
			setIsDragging(false);
		};

		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, dragStart, offset]);

	return {
		offset,
		setOffset,
		scale,
		setScale,
		isDragging,
		handleMouseDown,
		handleWheel,
	};
};
