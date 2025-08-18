import React from "react";
import { render, screen } from "@testing-library/react";
import CanvasControls from "../CanvasControls";

// 模擬子組件
jest.mock("../ZoomControls", () => {
	const PropTypes = require("prop-types");
	const MockZoomControls = (props) => (
		<div data-testid="zoom-controls" data-chat-width={props.chatWidth} data-is-chat-open={props.isChatOpen}>
			縮放控制項
		</div>
	);
	MockZoomControls.displayName = "ZoomControls";
	MockZoomControls.propTypes = {
		chatWidth: PropTypes.number,
		isChatOpen: PropTypes.bool,
	};
	return MockZoomControls;
});

jest.mock("../PanControls", () => {
	const MockPanControls = () => <div data-testid="pan-controls">平移控制項</div>;
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

	test("應正確傳遞聊天框相關props給ZoomControls", () => {
		const chatWidth = 300;
		const isChatOpen = true;

		render(<CanvasControls canvas={{}} chatWidth={chatWidth} isChatOpen={isChatOpen} />);

		const zoomControls = screen.getByTestId("zoom-controls");
		expect(zoomControls.getAttribute("data-chat-width")).toBe(chatWidth.toString());
		expect(zoomControls.getAttribute("data-is-chat-open")).toBe(isChatOpen.toString());
	});

	test("應正確處理默認的聊天框props", () => {
		render(<CanvasControls canvas={{}} />);

		const zoomControls = screen.getByTestId("zoom-controls");
		expect(zoomControls.getAttribute("data-chat-width")).toBe("0");
		expect(zoomControls.getAttribute("data-is-chat-open")).toBe("false");
	});
});
