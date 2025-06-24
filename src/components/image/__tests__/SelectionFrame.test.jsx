import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SelectionFrame from "../SelectionFrame";

// 模擬 @mui/material 組件
jest.mock("@mui/material", () => {
	return {
		Box: function Box(props) {
			// 為調整大小手柄使用特定的 data-testid
			const dataTestId =
				props.sx?.position === "absolute" && props.sx?.right === -5 && props.sx?.bottom === -5
					? "resize-handle"
					: props["data-testid"] || "selection-frame";

			// 判斷是否為調整大小手柄
			const isResizeHandle = dataTestId === "resize-handle";

			return (
				<div
					ref={props.ref}
					data-testid={dataTestId}
					style={{
						position: props.sx?.position,
						left: props.sx?.left,
						top: props.sx?.top,
						width: props.sx?.width,
						height: props.sx?.height,
						border: props.sx?.border,
						cursor: props.sx?.cursor,
						right: props.sx?.right,
						bottom: props.sx?.bottom,
						backgroundColor: props.sx?.backgroundColor,
					}}
					onMouseDown={props.onMouseDown}
					// 添加無障礙性支援
					role={isResizeHandle ? "button" : "application"}
					tabIndex={isResizeHandle ? 0 : undefined}
					onKeyDown={
						isResizeHandle
							? (e) => {
									if (e.key === "Enter" || e.key === " ") {
										props.onMouseDown && props.onMouseDown(e);
									}
								}
							: undefined
					}
					aria-label={isResizeHandle ? "調整選擇框大小" : undefined}
				>
					{props.children}
				</div>
			);
		},
	};
});

describe("SelectionFrame 組件測試", () => {
	// 測試所需的常用變數
	const defaultPosition = { x: 50, y: 50, width: 200, height: 150 };
	const mockOnPositionChange = jest.fn();
	let containerRef;

	// 在每個測試之前重置模擬函數和DOM
	beforeEach(() => {
		jest.clearAllMocks();
		containerRef = { current: document.createElement("div") };

		// 設置容器的 getBoundingClientRect
		containerRef.current.getBoundingClientRect = jest.fn().mockReturnValue({
			left: 100,
			top: 100,
			width: 800,
			height: 600,
		});

		// 添加到 document 方便事件測試
		document.body.appendChild(containerRef.current);
	});

	// 測試後清理
	afterEach(() => {
		if (containerRef.current && containerRef.current.parentNode) {
			containerRef.current.parentNode.removeChild(containerRef.current);
		}
	});

	test("應正確渲染選擇框和調整大小手柄", () => {
		render(
			<SelectionFrame
				position={defaultPosition}
				onPositionChange={mockOnPositionChange}
				containerRef={containerRef}
				maxWidth={800}
				maxHeight={600}
			/>
		);

		// 檢查選擇框是否存在且樣式正確
		const frame = screen.getByTestId("selection-frame");
		expect(frame).toBeInTheDocument();
		expect(frame).toHaveStyle(`
      position: absolute;
      left: 50px;
      top: 50px;
      width: 200px;
      height: 150px;
    `);

		// 檢查調整大小手柄是否存在
		const resizeHandle = screen.getByTestId("resize-handle");
		expect(resizeHandle).toBeInTheDocument();
	});

	test("拖動選擇框應呼叫 onPositionChange", () => {
		render(
			<SelectionFrame
				position={defaultPosition}
				onPositionChange={mockOnPositionChange}
				containerRef={containerRef}
				maxWidth={800}
				maxHeight={600}
			/>
		);

		const frame = screen.getByTestId("selection-frame");

		// 模擬滑鼠按下事件
		fireEvent.mouseDown(frame, { clientX: 150, clientY: 150 });

		// 模擬滑鼠移動事件
		fireEvent.mouseMove(document, { clientX: 170, clientY: 160 });

		// 驗證 onPositionChange 被呼叫，傳入新的位置
		expect(mockOnPositionChange).toHaveBeenCalledWith(
			expect.objectContaining({
				x: expect.any(Number),
				y: expect.any(Number),
				width: 200,
				height: 150,
			})
		);

		// 模擬滑鼠釋放
		fireEvent.mouseUp(document);
	});

	test("調整選擇框大小應呼叫 onPositionChange 並更新尺寸", () => {
		render(
			<SelectionFrame
				position={defaultPosition}
				onPositionChange={mockOnPositionChange}
				containerRef={containerRef}
				maxWidth={800}
				maxHeight={600}
			/>
		);

		// 獲取調整大小手柄
		const resizeHandle = screen.getByTestId("resize-handle");

		// 模擬滑鼠按下手柄
		fireEvent.mouseDown(resizeHandle, { clientX: 250, clientY: 200 });

		// 模擬滑鼠移動來調整大小
		fireEvent.mouseMove(document, { clientX: 300, clientY: 230 });

		// 驗證 onPositionChange 被呼叫，更新尺寸
		expect(mockOnPositionChange).toHaveBeenCalledWith(
			expect.objectContaining({
				width: expect.any(Number),
				height: expect.any(Number),
			})
		);

		// 模擬滑鼠釋放
		fireEvent.mouseUp(document);
	});

	test("應不超過最大寬度和高度限制", () => {
		// 測試最大限制的邊界情況
		const nearMaxPosition = { x: 700, y: 500, width: 50, height: 50 };

		render(
			<SelectionFrame
				position={nearMaxPosition}
				onPositionChange={mockOnPositionChange}
				containerRef={containerRef}
				maxWidth={800}
				maxHeight={600}
			/>
		);

		const frame = screen.getByTestId("selection-frame");

		// 嘗試拖動超出邊界
		fireEvent.mouseDown(frame, { clientX: 750, clientY: 550 });
		fireEvent.mouseMove(document, { clientX: 850, clientY: 650 });

		// 驗證 onPositionChange 被呼叫，但位置受到限制
		const calls = mockOnPositionChange.mock.calls;
		if (calls.length) {
			const lastCall = calls[calls.length - 1][0];
			expect(lastCall.x).toBeLessThanOrEqual(750); // 800 - 50 (maxWidth - width)
			expect(lastCall.y).toBeLessThanOrEqual(550); // 600 - 50 (maxHeight - height)
		}

		fireEvent.mouseUp(document);
	});

	test("自定義顏色屬性應正確套用", () => {
		const customColor = "#ff0000";

		render(
			<SelectionFrame
				position={defaultPosition}
				onPositionChange={mockOnPositionChange}
				containerRef={containerRef}
				maxWidth={800}
				maxHeight={600}
				color={customColor}
			/>
		);

		const frame = screen.getByTestId("selection-frame");
		expect(frame).toHaveStyle(`border: 2px dashed ${customColor}`);
	});
});
