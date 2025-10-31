import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// 模擬依賴組件
jest.mock("../LeftToolbarButtons", () => {
	const PropTypes = require("prop-types");
	const MockLeftToolbarButtons = ({ activeTool, onToolClick }) => (
		<div data-testid="left-toolbar-buttons">
			<button data-testid="select-button" onClick={() => onToolClick("select")}>
				選擇
			</button>
			<button data-testid="pencil-button" onClick={() => onToolClick("pencil")}>
				畫筆
			</button>
			<button data-testid="shape-button" onClick={() => onToolClick("shape")}>
				圖形
			</button>
			<button data-testid="eraser-button" onClick={() => onToolClick("eraser")}>
				橡皮擦
			</button>
			<button data-testid="paintBucket-button" onClick={() => onToolClick("paintBucket")}>
				填充
			</button>
			<button data-testid="text-button" onClick={() => onToolClick("text")}>
				文字
			</button>
			<button data-testid="pan-button" onClick={() => onToolClick("pan")}>
				移動
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

// 模擬設置組件
jest.mock("../../../brush/BrushSettings", () => {
	const PropTypes = require("prop-types");
	const MockBrushSettings = ({ brushSettings, onBrushSettingsChange }) => (
		<div data-testid="brush-settings">
			<button onClick={() => onBrushSettingsChange({ ...brushSettings, size: 10 })}>
				改變畫筆大小
			</button>
		</div>
	);
	MockBrushSettings.propTypes = {
		brushSettings: PropTypes.object,
		onBrushSettingsChange: PropTypes.func,
	};
	return MockBrushSettings;
});

jest.mock("../../../shape/ShapeSettings", () => {
	const PropTypes = require("prop-types");
	const MockShapeSettings = ({ shapeSettings, onShapeSettingsChange }) => (
		<div data-testid="shape-settings">
			<button onClick={() => onShapeSettingsChange({ ...shapeSettings, type: "circle" })}>
				改變圖形類型
			</button>
		</div>
	);
	MockShapeSettings.propTypes = {
		shapeSettings: PropTypes.object,
		onShapeSettingsChange: PropTypes.func,
	};
	return MockShapeSettings;
});

jest.mock("../../../eraser/EraserSettings", () => {
	const PropTypes = require("prop-types");
	const MockEraserSettings = ({ eraserSettings, onEraserSettingsChange }) => (
		<div data-testid="eraser-settings">
			<button onClick={() => onEraserSettingsChange({ ...eraserSettings, size: 30 })}>
				改變橡皮擦大小
			</button>
		</div>
	);
	MockEraserSettings.propTypes = {
		eraserSettings: PropTypes.object,
		onEraserSettingsChange: PropTypes.func,
	};
	return MockEraserSettings;
});

jest.mock("../../../paint-bucket/PaintBucketSettings", () => {
	const PropTypes = require("prop-types");
	const MockPaintBucketSettings = ({ paintBucketSettings, onPaintBucketSettingsChange }) => (
		<div data-testid="paint-bucket-settings">
			<button onClick={() => onPaintBucketSettingsChange({ ...paintBucketSettings, tolerance: 100 })}>
				改變容差
			</button>
		</div>
	);
	MockPaintBucketSettings.propTypes = {
		paintBucketSettings: PropTypes.object,
		onPaintBucketSettingsChange: PropTypes.func,
	};
	return MockPaintBucketSettings;
});

jest.mock("../../../text/TextSettings", () => {
	const PropTypes = require("prop-types");
	const MockTextSettings = ({ textSettings, onTextSettingsChange, canvas }) => (
		<div data-testid="text-settings">
			<button onClick={() => onTextSettingsChange({ ...textSettings, fontSize: 20 })}>
				改變字體大小
			</button>
			<span data-testid="canvas-provided">{canvas ? "有畫布" : "無畫布"}</span>
		</div>
	);
	MockTextSettings.propTypes = {
		textSettings: PropTypes.object,
		onTextSettingsChange: PropTypes.func,
		canvas: PropTypes.object,
	};
	return MockTextSettings;
});

jest.mock("../../../select/SelectSettings", () => {
	const PropTypes = require("prop-types");
	const MockSelectSettings = ({ canvas }) => (
		<div data-testid="select-settings">
			<span data-testid="canvas-provided">{canvas ? "有畫布" : "無畫布"}</span>
		</div>
	);
	MockSelectSettings.propTypes = {
		canvas: PropTypes.object,
	};
	return MockSelectSettings;
});

jest.mock("../../../pan/PanSettings", () => {
	const PropTypes = require("prop-types");
	const MockPanSettings = ({ canvas }) => (
		<div data-testid="pan-settings">
			<span data-testid="canvas-provided">{canvas ? "有畫布" : "無畫布"}</span>
		</div>
	);
	MockPanSettings.propTypes = {
		canvas: PropTypes.object,
	};
	return MockPanSettings;
});

// 模擬 MUI 組件
jest.mock("@mui/material", () => {
	const PropTypes = require("prop-types");
	
	const Box = ({ children, sx, ...props }) => (
		<div style={sx} {...props}>
			{children}
		</div>
	);
	Box.propTypes = {
		children: PropTypes.node,
		sx: PropTypes.object,
	};
	
	const Paper = ({ children, sx, ...props }) => (
		<div data-testid="toolbar-paper" style={sx} {...props}>
			{children}
		</div>
	);
	Paper.propTypes = {
		children: PropTypes.node,
		sx: PropTypes.object,
	};
	
	const Typography = ({ children, sx, ...props }) => (
		<div style={sx} {...props}>
			{children}
		</div>
	);
	Typography.propTypes = {
		children: PropTypes.node,
		sx: PropTypes.object,
	};
	
	const IconButton = ({ children, onClick, sx, ...props }) => (
		<button data-testid="close-settings-button" onClick={onClick} style={sx} {...props}>
			{children}
		</button>
	);
	IconButton.propTypes = {
		children: PropTypes.node,
		onClick: PropTypes.func,
		sx: PropTypes.object,
	};
	
	return {
		Box,
		Paper,
		Typography,
		IconButton,
	};
});

jest.mock("@mui/icons-material", () => {
	const PropTypes = require("prop-types");
	const Close = ({ sx }) => <span data-testid="close-icon" style={sx}>✕</span>;
	Close.propTypes = {
		sx: PropTypes.object,
	};
	return {
		Close,
	};
});

import LeftToolbar from "../LeftToolbar";

describe("LeftToolbar 組件測試", () => {
	const mockCanvas = {
		getContext: jest.fn(),
		width: 800,
		height: 600,
	};

	const defaultProps = {
		setActiveTool: jest.fn(),
		activeTool: null,
		setBrushSettings: jest.fn(),
		brushSettings: { type: "PencilBrush", color: "#000000", size: 5 },
		setShapeSettings: jest.fn(),
		shapeSettings: { type: "rect", fill: "#ff0000", stroke: "#000000" },
		setEraserSettings: jest.fn(),
		eraserSettings: { type: "object", size: 20 },
		setPaintBucketSettings: jest.fn(),
		paintBucketSettings: { tolerance: 50, fill: "#000000" },
		setTextSettings: jest.fn(),
		textSettings: { fontSize: 24, fontFamily: "Arial", color: "#000000" },
		canvas: mockCanvas,
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("基本渲染", () => {
		test("應正確渲染主要元素", () => {
			render(<LeftToolbar {...defaultProps} />);

			expect(screen.getByTestId("toolbar-paper")).toBeInTheDocument();
			expect(screen.getByTestId("left-toolbar-buttons")).toBeInTheDocument();
		});

		test("沒有選擇工具時不應顯示設置面板", () => {
			render(<LeftToolbar {...defaultProps} />);

			expect(screen.queryByTestId("brush-settings")).not.toBeInTheDocument();
			expect(screen.queryByTestId("shape-settings")).not.toBeInTheDocument();
			expect(screen.queryByTestId("eraser-settings")).not.toBeInTheDocument();
		});
	});

	describe("工具切換功能", () => {
		test("點擊選擇工具按鈕應調用 setActiveTool", () => {
			render(<LeftToolbar {...defaultProps} />);

			const selectButton = screen.getByTestId("select-button");
			fireEvent.click(selectButton);

			expect(defaultProps.setActiveTool).toHaveBeenCalledWith("select");
		});

		test("點擊畫筆工具按鈕應調用 setActiveTool", () => {
			render(<LeftToolbar {...defaultProps} />);

			const pencilButton = screen.getByTestId("pencil-button");
			fireEvent.click(pencilButton);

			expect(defaultProps.setActiveTool).toHaveBeenCalledWith("pencil");
		});

		test("點擊圖形工具按鈕應調用 setActiveTool", () => {
			render(<LeftToolbar {...defaultProps} />);

			const shapeButton = screen.getByTestId("shape-button");
			fireEvent.click(shapeButton);

			expect(defaultProps.setActiveTool).toHaveBeenCalledWith("shape");
		});

		test("點擊橡皮擦工具按鈕應調用 setActiveTool", () => {
			render(<LeftToolbar {...defaultProps} />);

			const eraserButton = screen.getByTestId("eraser-button");
			fireEvent.click(eraserButton);

			expect(defaultProps.setActiveTool).toHaveBeenCalledWith("eraser");
		});

		test("點擊填充工具按鈕應調用 setActiveTool", () => {
			render(<LeftToolbar {...defaultProps} />);

			const paintBucketButton = screen.getByTestId("paintBucket-button");
			fireEvent.click(paintBucketButton);

			expect(defaultProps.setActiveTool).toHaveBeenCalledWith("paintBucket");
		});

		test("點擊文字工具按鈕應調用 setActiveTool", () => {
			render(<LeftToolbar {...defaultProps} />);

			const textButton = screen.getByTestId("text-button");
			fireEvent.click(textButton);

			expect(defaultProps.setActiveTool).toHaveBeenCalledWith("text");
		});

		test("點擊移動工具按鈕應調用 setActiveTool", () => {
			render(<LeftToolbar {...defaultProps} />);

			const panButton = screen.getByTestId("pan-button");
			fireEvent.click(panButton);

			expect(defaultProps.setActiveTool).toHaveBeenCalledWith("pan");
		});
	});

	describe("設置面板顯示", () => {
		test("選擇工具時應顯示選擇設置面板", () => {
			render(<LeftToolbar {...defaultProps} activeTool="select" />);

			expect(screen.getByTestId("select-settings")).toBeInTheDocument();
		});

		test("選擇畫筆工具時應顯示畫筆設置面板", () => {
			render(<LeftToolbar {...defaultProps} activeTool="pencil" />);

			expect(screen.getByTestId("brush-settings")).toBeInTheDocument();
		});

		test("選擇圖形工具時應顯示圖形設置面板", () => {
			render(<LeftToolbar {...defaultProps} activeTool="shape" />);

			expect(screen.getByTestId("shape-settings")).toBeInTheDocument();
		});

		test("選擇橡皮擦工具時應顯示橡皮擦設置面板", () => {
			render(<LeftToolbar {...defaultProps} activeTool="eraser" />);

			expect(screen.getByTestId("eraser-settings")).toBeInTheDocument();
		});

		test("選擇填充工具時應顯示填充設置面板", () => {
			render(<LeftToolbar {...defaultProps} activeTool="paintBucket" />);

			expect(screen.getByTestId("paint-bucket-settings")).toBeInTheDocument();
		});

		test("選擇文字工具時應顯示文字設置面板", () => {
			render(<LeftToolbar {...defaultProps} activeTool="text" />);

			expect(screen.getByTestId("text-settings")).toBeInTheDocument();
		});

		test("選擇移動工具時應顯示移動設置面板", () => {
			render(<LeftToolbar {...defaultProps} activeTool="pan" />);

			expect(screen.getByTestId("pan-settings")).toBeInTheDocument();
		});

		test("無效的工具名稱時不應顯示任何設置面板", () => {
			render(<LeftToolbar {...defaultProps} activeTool="invalid-tool" />);

			expect(screen.queryByTestId("brush-settings")).not.toBeInTheDocument();
			expect(screen.queryByTestId("shape-settings")).not.toBeInTheDocument();
			expect(screen.queryByTestId("eraser-settings")).not.toBeInTheDocument();
		});
	});

	describe("關閉設置面板功能", () => {
		test("點擊關閉按鈕應隱藏設置面板但保持工具選取狀態", () => {
			render(<LeftToolbar {...defaultProps} activeTool="pencil" />);

			// 確認設置面板存在
			expect(screen.getByTestId("brush-settings")).toBeInTheDocument();

			const closeButton = screen.getByTestId("close-settings-button");
			fireEvent.click(closeButton);

			// 設置面板應該被隱藏
			expect(screen.queryByTestId("brush-settings")).not.toBeInTheDocument();

			// setActiveTool 不應該被調用 (工具保持選取狀態)
			expect(defaultProps.setActiveTool).not.toHaveBeenCalled();
		});

		test("關閉設置面板後再次點擊相同工具應重新顯示設置面板", () => {
			render(<LeftToolbar {...defaultProps} activeTool="pencil" />);

			// 關閉設置面板
			const closeButton = screen.getByTestId("close-settings-button");
			fireEvent.click(closeButton);
			expect(screen.queryByTestId("brush-settings")).not.toBeInTheDocument();

			// 再次點擊畫筆工具按鈕
			const pencilButton = screen.getByTestId("pencil-button");
			fireEvent.click(pencilButton);

			// 設置面板應該重新顯示
			expect(screen.getByTestId("brush-settings")).toBeInTheDocument();
		});

		test("設置面板應顯示關閉圖示", () => {
			render(<LeftToolbar {...defaultProps} activeTool="pencil" />);

			expect(screen.getByTestId("close-icon")).toBeInTheDocument();
		});
	});

	describe("設置組件屬性傳遞", () => {
		test("畫筆設置應接收正確的屬性", () => {
			render(<LeftToolbar {...defaultProps} activeTool="pencil" />);

			const changeButton = screen.getByText("改變畫筆大小");
			fireEvent.click(changeButton);

			expect(defaultProps.setBrushSettings).toHaveBeenCalledWith({
				...defaultProps.brushSettings,
				size: 10,
			});
		});

		test("圖形設置應接收正確的屬性", () => {
			render(<LeftToolbar {...defaultProps} activeTool="shape" />);

			const changeButton = screen.getByText("改變圖形類型");
			fireEvent.click(changeButton);

			expect(defaultProps.setShapeSettings).toHaveBeenCalledWith({
				...defaultProps.shapeSettings,
				type: "circle",
			});
		});

		test("橡皮擦設置應接收正確的屬性", () => {
			render(<LeftToolbar {...defaultProps} activeTool="eraser" />);

			const changeButton = screen.getByText("改變橡皮擦大小");
			fireEvent.click(changeButton);

			expect(defaultProps.setEraserSettings).toHaveBeenCalledWith({
				...defaultProps.eraserSettings,
				size: 30,
			});
		});

		test("填充設置應接收正確的屬性", () => {
			render(<LeftToolbar {...defaultProps} activeTool="paintBucket" />);

			const changeButton = screen.getByText("改變容差");
			fireEvent.click(changeButton);

			expect(defaultProps.setPaintBucketSettings).toHaveBeenCalledWith({
				...defaultProps.paintBucketSettings,
				tolerance: 100,
			});
		});

		test("文字設置應接收正確的屬性", () => {
			render(<LeftToolbar {...defaultProps} activeTool="text" />);

			const changeButton = screen.getByText("改變字體大小");
			fireEvent.click(changeButton);

			expect(defaultProps.setTextSettings).toHaveBeenCalledWith({
				...defaultProps.textSettings,
				fontSize: 20,
			});
		});
	});

	describe("Canvas 屬性傳遞", () => {
		test("需要 canvas 的設置組件應接收到 canvas 屬性", () => {
			render(<LeftToolbar {...defaultProps} activeTool="select" />);
			
			expect(screen.getByText("有畫布")).toBeInTheDocument();
		});

		test("文字設置應接收到 canvas 屬性", () => {
			render(<LeftToolbar {...defaultProps} activeTool="text" />);
			
			expect(screen.getByText("有畫布")).toBeInTheDocument();
		});

		test("移動設置應接收到 canvas 屬性", () => {
			render(<LeftToolbar {...defaultProps} activeTool="pan" />);
			
			expect(screen.getByText("有畫布")).toBeInTheDocument();
		});
	});

	describe("動態切換測試", () => {
		test("應能在不同工具間切換", () => {
			const { rerender } = render(<LeftToolbar {...defaultProps} activeTool="pencil" />);

			// 確認初始顯示畫筆設置
			expect(screen.getByTestId("brush-settings")).toBeInTheDocument();
			expect(screen.queryByTestId("shape-settings")).not.toBeInTheDocument();

			// 切換到圖形工具
			rerender(<LeftToolbar {...defaultProps} activeTool="shape" />);

			// 確認現在顯示圖形設置
			expect(screen.queryByTestId("brush-settings")).not.toBeInTheDocument();
			expect(screen.getByTestId("shape-settings")).toBeInTheDocument();

			// 切換回無工具選擇
			rerender(<LeftToolbar {...defaultProps} activeTool={null} />);

			// 確認所有設置面板都不顯示
			expect(screen.queryByTestId("brush-settings")).not.toBeInTheDocument();
			expect(screen.queryByTestId("shape-settings")).not.toBeInTheDocument();
		});
	});

	describe("錯誤處理", () => {
		test("缺少必要屬性時應能正常處理", () => {
			const incompleteProps = {
				...defaultProps,
				canvas: null,
			};

			expect(() => {
				render(<LeftToolbar {...incompleteProps} activeTool="select" />);
			}).not.toThrow();
		});

		test("設置函數為 undefined 時應能正常渲染", () => {
			const incompleteProps = {
				...defaultProps,
				setBrushSettings: undefined,
			};

			expect(() => {
				render(<LeftToolbar {...incompleteProps} activeTool="pencil" />);
			}).not.toThrow();
		});
	});
});
