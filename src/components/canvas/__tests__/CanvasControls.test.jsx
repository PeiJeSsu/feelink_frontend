import React from "react";
import { render, screen } from "@testing-library/react";
import CanvasControls from "../CanvasControls";

// 模擬子組件
jest.mock("../ZoomControls", () => {
	const MockZoomControls = (_props) => <div data-testid="zoom-controls">縮放控制項</div>;
	MockZoomControls.displayName = "ZoomControls";
	return MockZoomControls;
});

jest.mock("../PanControls", () => {
	const MockPanControls = (_props) => <div data-testid="pan-controls">平移控制項</div>;
	MockPanControls.displayName = "PanControls";
	return MockPanControls;
});

describe("CanvasControls 測試", () => {
	test("應正確渲染控制項容器", () => {
		render(<CanvasControls />);
		const containerElement = screen.getByTestId("zoom-controls").closest(".canvas-controls-container");
		expect(containerElement).not.toBeNull();
	});

	test("應正確渲染縮放和平移控制項", () => {
		render(<CanvasControls />);
		expect(screen.getByTestId("zoom-controls")).toBeTruthy();
		expect(screen.getByTestId("pan-controls")).toBeTruthy();
	});

	test("當未設置 zoomLevel 時應初始化為 1", () => {
		const mockCanvas = {};
		render(<CanvasControls canvas={mockCanvas} />);
		expect(mockCanvas.zoomLevel).toBe(1);
	});

	test("當已設置 zoomLevel 時應保留原值", () => {
		const mockCanvas = { zoomLevel: 2 };
		render(<CanvasControls canvas={mockCanvas} />);
		expect(mockCanvas.zoomLevel).toBe(2);
	});

	test("當 canvas 為 null 時不應拋出錯誤", () => {
		expect(() => render(<CanvasControls canvas={null} />)).not.toThrow();
	});
});
