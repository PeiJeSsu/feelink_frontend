import React from "react";
import { render, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import PanControls from "../PanControls";
import { handleMiddleButtonPan, setupMiddleButtonPan } from "../../../helpers/canvas/PanHelper";

// 模擬 PanHelper 模組
jest.mock("../../../helpers/canvas/PanHelper", () => ({
	handleMiddleButtonPan: jest.fn().mockReturnValue({ x: 50, y: 50 }),
	setupMiddleButtonPan: jest.fn().mockReturnValue(jest.fn()),
}));

describe("PanControls 測試", () => {
	let mockCanvas;
	let mockSetState;
	let mockUseStateSpy;
	let mockUseEffectSpy;

	beforeEach(() => {
		mockCanvas = {
			renderAll: jest.fn(),
			setViewportTransform: jest.fn(),
		};

		// 重置所有模擬函數
		jest.clearAllMocks();

		// 使用 spyOn 代替直接替換 React hooks
		mockSetState = jest.fn();
		mockUseStateSpy = jest.spyOn(React, "useState").mockImplementation((initialValue) => [initialValue, mockSetState]);
		mockUseEffectSpy = jest.spyOn(React, "useEffect").mockImplementation((cb) => cb());
	});

	afterEach(() => {
		// 確保每個測試後正確還原 hooks
		mockUseStateSpy.mockRestore();
		mockUseEffectSpy.mockRestore();
	});

	test("應正確渲染並不拋出錯誤", () => {
		expect(() => render(<PanControls canvas={mockCanvas} />)).not.toThrow();
	});

	test("當 canvas 為 null 時不應拋出錯誤", () => {
		expect(() => render(<PanControls canvas={null} />)).not.toThrow();
	});

	test("應正確設置中鍵拖曳事件處理", () => {
		// 自定義 useState 的實現，用於此測試
		mockUseStateSpy.mockImplementation((initialValue) => {
			if (initialValue === false) return [false, jest.fn()];
			if (typeof initialValue === "object") return [{ x: 0, y: 0 }, jest.fn()];
			return [initialValue, jest.fn()];
		});

		render(<PanControls canvas={mockCanvas} />);

		// 驗證 setupMiddleButtonPan 被正確調用
		expect(setupMiddleButtonPan).toHaveBeenCalledWith(
			mockCanvas,
			expect.any(Function),
			expect.any(Function),
			expect.any(Function),
			expect.any(Function)
		);
	});

	test("當 canvas 為 null 時，useEffect 中應提前返回", () => {
		// 模擬 useEffect
		mockUseEffectSpy.mockImplementation((cb, deps) => {
			// 執行回調
			const cleanup = cb();
			// 確保回調沒有返回清理函數
			expect(cleanup).toBeUndefined();
		});

		// 模擬 useState
		mockUseStateSpy.mockImplementation((initialValue) => {
			if (initialValue === false) return [false, jest.fn()];
			if (typeof initialValue === "object") return [{ x: 0, y: 0 }, jest.fn()];
			return [initialValue, jest.fn()];
		});

		// 渲染組件，傳入 null 作為 canvas
		render(<PanControls canvas={null} />);

		// 驗證 setupMiddleButtonPan 未被調用
		expect(setupMiddleButtonPan).not.toHaveBeenCalled();
	});

	test("handleMouseMove 應處理拖曳狀態", () => {
		// 使 setupMiddleButtonPan 返回我們需要的函數
		setupMiddleButtonPan.mockImplementation((canvas, setIsDragging, setDragStart, handleMouseMove, handleMouseUp) => {
			if (handleMouseMove) {
				const mockEvent = { e: { clientX: 150, clientY: 120 } };
				handleMouseMove(mockEvent);
			}
			return jest.fn();
		});

		// 模擬 useState 實現
		mockUseStateSpy.mockImplementation((initialValue) => {
			if (initialValue === false) return [true, jest.fn()]; // isDragging 為 true
			if (typeof initialValue === "object") return [{ x: 100, y: 100 }, jest.fn()];
			return [initialValue, jest.fn()];
		});

		// 渲染組件
		render(<PanControls canvas={mockCanvas} />);

		// 驗證 handleMiddleButtonPan 被調用
		expect(handleMiddleButtonPan).toHaveBeenCalledWith(
			mockCanvas,
			expect.objectContaining({ e: expect.objectContaining({ clientX: 150, clientY: 120 }) }),
			{ x: 100, y: 100 }
		);
	});

	test("當 isDragging 為 false 時，handleMouseMove 應提前返回", () => {
		let handleMouseMove;

		// 模擬 React 的 useState 和 useEffect 以獲取 handleMouseMove 函數
		mockUseStateSpy.mockImplementation((initialValue) => {
			if (initialValue === false) return [false, jest.fn()];
			if (typeof initialValue === "object") return [{ x: 100, y: 100 }, jest.fn()];
			return [initialValue, jest.fn()];
		});

		mockUseEffectSpy.mockImplementation((cb, deps) => {
			// 執行回調
			cb();

			// 從 setupMiddleButtonPan 的調用中獲取 handleMouseMove 函數
			if (setupMiddleButtonPan.mock.calls.length > 0) {
				handleMouseMove = setupMiddleButtonPan.mock.calls[0][3];
			}
		});

		render(<PanControls canvas={mockCanvas} />);

		// 恢復原始 React 鉤子
		mockUseEffectSpy.mockRestore();
		mockUseStateSpy.mockRestore();

		// 確保獲取到了 handleMouseMove
		expect(handleMouseMove).toBeDefined();

		// 模擬滑鼠移動事件
		const mockEvent = { clientX: 150, clientY: 120 };
		act(() => {
			handleMouseMove({ e: mockEvent });
		});

		// 驗證 handleMiddleButtonPan 未被調用
		expect(handleMiddleButtonPan).not.toHaveBeenCalled();
	});

	test("應返回清理函數", () => {
		// 獲取由 setupMiddleButtonPan 返回的清理函數
		const mockCleanup = jest.fn();
		setupMiddleButtonPan.mockReturnValue(mockCleanup);

		// 模擬 useEffect
		let effectCallback;
		let returnedCleanup;

		mockUseEffectSpy.mockImplementation((cb, deps) => {
			effectCallback = cb;
			returnedCleanup = effectCallback();
		});

		// 模擬 useState
		mockUseStateSpy.mockImplementation((initialValue) => {
			if (initialValue === false) return [false, jest.fn()];
			if (typeof initialValue === "object") return [{ x: 0, y: 0 }, jest.fn()];
			return [initialValue, jest.fn()];
		});

		render(<PanControls canvas={mockCanvas} />);

		// 驗證清理函數是否被正確返回
		expect(returnedCleanup).toBe(mockCleanup);

		// 恢復原始 React 鉤子
		mockUseEffectSpy.mockRestore();
		mockUseStateSpy.mockRestore();
	});

	test("組件應該渲染為 null", () => {
		const { container } = render(<PanControls canvas={mockCanvas} />);
		expect(container.firstChild).toBeNull();
	});
});
