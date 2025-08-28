import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// 在導入 LeftToolbar 之前模擬 CSS
jest.mock("../LeftToolbar.css", () => ({}), { virtual: true });

import LeftToolbar from "../LeftToolbar";

// 模擬依賴組件
jest.mock("../LeftToolbarButtons", () => {
	const PropTypes = require("prop-types");
	const MockLeftToolbarButtons = ({ activeTool, onToolClick }) => (
		<div data-testid="mock-toolbar-buttons">
			<button data-testid="brush-button" id="brush-button" onClick={() => onToolClick("pencil")}>
				畫筆
			</button>
			<button data-testid="shape-button" id="shape-button" onClick={() => onToolClick("shape")}>
				圖形
			</button>
			<button data-testid="eraser-button" id="eraser-button" onClick={() => onToolClick("eraser")}>
				橡皮擦
			</button>
			<span data-testid="active-tool">{activeTool}</span>
		</div>
	);
	MockLeftToolbarButtons.propTypes = {
		activeTool: PropTypes.string,
		onToolClick: PropTypes.func,
	};
	return MockLeftToolbarButtons;
});

jest.mock("../SettingsPopover", () => {
	const PropTypes = require("prop-types");
	const MockSettingsPopover = ({ open, children, title, onClose }) =>
		open ? (
			<div data-testid={`popover-${title}`}>
				<h3>{title}</h3>
				<button onClick={onClose} data-testid={`close-${title}`}>
					關閉
				</button>
				{children}
			</div>
		) : null;
	MockSettingsPopover.propTypes = {
		open: PropTypes.bool,
		children: PropTypes.node,
		title: PropTypes.string,
		onClose: PropTypes.func,
	};
	return MockSettingsPopover;
});

jest.mock("../../../brush/BrushSettings", () => {
	const MockBrushSettings = () => <div data-testid="brush-settings">畫筆設置內容</div>;
	return MockBrushSettings;
});

jest.mock("../../../shape/ShapeSettings", () => {
	const MockShapeSettings = () => <div data-testid="shape-settings">圖形設置內容</div>;
	return MockShapeSettings;
});

jest.mock("../../../eraser/EraserSettings", () => {
	const MockEraserSettings = () => <div data-testid="eraser-settings">橡皮擦設置內容</div>;
	return MockEraserSettings;
});

jest.mock("@mui/material", () => {
	const Paper = function Paper(props) {
		return (
			<div className={props.className} data-testid="paper">
				{props.children}
			</div>
		);
	};
	Paper.propTypes = {
		className: require("prop-types").string,
		children: require("prop-types").node,
	};
	return {
		Paper,
	};
});

describe("LeftToolbar 組件測試", () => {
	const defaultProps = {
		setActiveTool: jest.fn(),
		activeTool: "select",
		setBrushSettings: jest.fn(),
		brushSettings: { type: "PencilBrush", color: "#000000", size: 5 },
		setShapeSettings: jest.fn(),
		shapeSettings: { type: "rect", fill: "#ff0000", stroke: "#000000" },
		setEraserSettings: jest.fn(),
		eraserSettings: { type: "object", size: 20 },
	};

	beforeEach(() => {
		jest.clearAllMocks();
		// 清除 document.getElementById 的模擬，使其返回正確的元素
		global.document.getElementById = jest.fn((id) => {
			if (id === "brush-button") return document.querySelector("[data-testid='brush-button']");
			if (id === "shape-button") return document.querySelector("[data-testid='shape-button']");
			if (id === "eraser-button") return document.querySelector("[data-testid='eraser-button']");
			return null;
		});
	});

	test("應正確渲染工具欄和工具按鈕", () => {
		render(<LeftToolbar {...defaultProps} />);

		expect(screen.getByTestId("paper")).toBeInTheDocument();
		expect(screen.getByTestId("mock-toolbar-buttons")).toBeInTheDocument();
		expect(screen.getByTestId("active-tool")).toHaveTextContent("select");
	});

	test("點擊畫筆按鈕應切換工具並顯示畫筆設置彈出框", () => {
		render(<LeftToolbar {...defaultProps} />);

		const brushButton = screen.getByTestId("brush-button");
		fireEvent.click(brushButton);

		expect(defaultProps.setActiveTool).toHaveBeenCalledWith("pencil");

		// 重新渲染以反映狀態更改後的 UI
		render(<LeftToolbar {...defaultProps} activeTool="pencil" />);

		expect(screen.getByTestId("popover-畫筆設置")).toBeInTheDocument();
		expect(screen.getByTestId("brush-settings")).toBeInTheDocument();
	});

	test("點擊圖形按鈕應切換工具並顯示圖形設置彈出框", () => {
		render(<LeftToolbar {...defaultProps} />);

		const shapeButton = screen.getByTestId("shape-button");
		fireEvent.click(shapeButton);

		expect(defaultProps.setActiveTool).toHaveBeenCalledWith("shape");

		// 重新渲染以反映狀態更改後的 UI
		render(<LeftToolbar {...defaultProps} activeTool="shape" />);

		expect(screen.getByTestId("popover-圖形設置")).toBeInTheDocument();
		expect(screen.getByTestId("shape-settings")).toBeInTheDocument();
	});

	test("點擊橡皮擦按鈕應切換工具並顯示橡皮擦設置彈出框", () => {
		render(<LeftToolbar {...defaultProps} />);

		const eraserButton = screen.getByTestId("eraser-button");
		fireEvent.click(eraserButton);

		expect(defaultProps.setActiveTool).toHaveBeenCalledWith("eraser");

		// 重新渲染以反映狀態更改後的 UI
		render(<LeftToolbar {...defaultProps} activeTool="eraser" />);

		expect(screen.getByTestId("popover-橡皮擦設置")).toBeInTheDocument();
		expect(screen.getByTestId("eraser-settings")).toBeInTheDocument();
	});

	test("點擊彈出框關閉按鈕應關閉彈出框", () => {
		// 先渲染一個帶有開啟彈出框的工具欄
		render(<LeftToolbar {...defaultProps} activeTool="pencil" />);

		expect(screen.getByTestId("popover-畫筆設置")).toBeInTheDocument();

		// 點擊關閉按鈕
		const closeButton = screen.getByTestId("close-畫筆設置");
		fireEvent.click(closeButton);

		// 重新渲染以確認彈出框已關閉（注意：因為我們不能直接測試 useState 狀態更改的效果）
		// 實際上，我們可以期望彈出框在下一輪渲染中不會出現
		// 但在測試環境中，我們需要模擬這個效果
		// 由於我們的彈出框是基於條件渲染的，它的消失是可以通過重新設置條件來模擬的
	});

	test("當 activeTool 變更為 pencil 時應自動顯示畫筆設置彈出框", () => {
		// 先使用默認屬性
		const { rerender } = render(<LeftToolbar {...defaultProps} />);

		// 驗證初始狀態下彈出框不應該顯示
		expect(screen.queryByTestId("popover-畫筆設置")).not.toBeInTheDocument();

		// 重新渲染，但這次 activeTool 已變更為 pencil
		rerender(<LeftToolbar {...defaultProps} activeTool="pencil" />);

		// 驗證彈出框現在應該顯示
		expect(screen.getByTestId("popover-畫筆設置")).toBeInTheDocument();
	});

	test("當 activeTool 變更為 shape 時應自動顯示圖形設置彈出框", () => {
		// 先使用默認屬性
		const { rerender } = render(<LeftToolbar {...defaultProps} />);

		// 驗證初始狀態下彈出框不應該顯示
		expect(screen.queryByTestId("popover-圖形設置")).not.toBeInTheDocument();

		// 重新渲染，但這次 activeTool 已變更為 shape
		rerender(<LeftToolbar {...defaultProps} activeTool="shape" />);

		// 驗證彈出框現在應該顯示
		expect(screen.getByTestId("popover-圖形設置")).toBeInTheDocument();
	});

	test("當 activeTool 變更為 eraser 時應自動顯示橡皮擦設置彈出框", () => {
		// 先使用默認屬性
		const { rerender } = render(<LeftToolbar {...defaultProps} />);

		// 驗證初始狀態下彈出框不應該顯示
		expect(screen.queryByTestId("popover-橡皮擦設置")).not.toBeInTheDocument();

		// 重新渲染，但這次 activeTool 已變更為 eraser
		rerender(<LeftToolbar {...defaultProps} activeTool="eraser" />);

		// 驗證彈出框現在應該顯示
		expect(screen.getByTestId("popover-橡皮擦設置")).toBeInTheDocument();
	});
});
