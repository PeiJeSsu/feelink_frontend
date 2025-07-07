import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import BrushSettings from "../BrushSettings";

// 模擬 ColorPicker 組件
jest.mock("../../color/ColorPicker", () => {
	const PropTypes = require("prop-types");
	const MockColorPicker = ({ label, value, onChange }) => (
		<div data-testid="color-picker">
			<label>{label}</label>
			<input type="color" data-testid={`color-input-${label}`} value={value} onChange={onChange} />
		</div>
	);
	MockColorPicker.propTypes = {
		label: PropTypes.string,
		value: PropTypes.string,
		onChange: PropTypes.func,
	};
	return MockColorPicker;
});

describe("BrushSettings 組件測試", () => {
	const defaultBrushSettings = {
		type: "PencilBrush",
		color: "#000000",
		size: 5,
		opacity: 1,
	};

	const mockOnBrushSettingsChange = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test("應正確渲染所有畫筆設定控制項", () => {
		render(<BrushSettings brushSettings={defaultBrushSettings} onBrushSettingsChange={mockOnBrushSettingsChange} />);

		// 檢查畫筆類型選擇器
		expect(screen.getByLabelText("畫筆類型")).toBeInTheDocument();

		// 檢查顏色選擇器
		expect(screen.getByTestId("color-picker")).toBeInTheDocument();

		// 檢查筆刷粗細滑塊
		expect(screen.getByText("筆刷粗細")).toBeInTheDocument();

		// 檢查透明度滑塊
		expect(screen.getByText("透明度")).toBeInTheDocument();

		// 檢查陰影切換開關
		expect(screen.getByLabelText("啟用陰影")).toBeInTheDocument();
	});

	test("更改畫筆類型應呼叫 onBrushSettingsChange", () => {
		render(<BrushSettings brushSettings={defaultBrushSettings} onBrushSettingsChange={mockOnBrushSettingsChange} />);

		// 獲取 Select 元素
		const selectCombobox = screen.getByRole("combobox", { name: "畫筆類型" });
		// 打開下拉選單
		fireEvent.mouseDown(selectCombobox);

		// 選擇 CircleBrush 選項
		const circleOption = screen.getByText("圓點");
		fireEvent.click(circleOption);

		expect(mockOnBrushSettingsChange).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "CircleBrush",
			})
		);
	});

	test("更改畫筆顏色應呼叫 onBrushSettingsChange", () => {
		render(<BrushSettings brushSettings={defaultBrushSettings} onBrushSettingsChange={mockOnBrushSettingsChange} />);

		const colorInput = screen.getByTestId("color-input-顏色");
		fireEvent.change(colorInput, { target: { value: "#ff0000" } });

		expect(mockOnBrushSettingsChange).toHaveBeenCalledWith(
			expect.objectContaining({
				color: "#ff0000",
			})
		);
	});

	test("滑動筆刷粗細滑塊應呼叫 onBrushSettingsChange", () => {
		render(<BrushSettings brushSettings={defaultBrushSettings} onBrushSettingsChange={mockOnBrushSettingsChange} />);

		// 找到所有滑塊，第一個是筆刷粗細滑塊
		const allSliders = screen.getAllByRole("slider");
		const sizeSlider = allSliders[0]; // 第一個滑塊是筆刷粗細

		fireEvent.change(sizeSlider, { target: { value: "10" } });

		expect(mockOnBrushSettingsChange).toHaveBeenCalledWith(
			expect.objectContaining({
				size: 10,
			})
		);
	});

	test("滑動透明度滑塊應呼叫 onBrushSettingsChange", () => {
		render(<BrushSettings brushSettings={defaultBrushSettings} onBrushSettingsChange={mockOnBrushSettingsChange} />);

		// 找到所有滑塊，第二個是透明度滑塊
		const allSliders = screen.getAllByRole("slider");
		const opacitySlider = allSliders[1]; // 第二個滑塊是透明度

		fireEvent.change(opacitySlider, { target: { value: "0.5" } });

		expect(mockOnBrushSettingsChange).toHaveBeenCalledWith(
			expect.objectContaining({
				opacity: 0.5,
			})
		);
	});

	test("啟用陰影應添加陰影設定並呼叫 onBrushSettingsChange", () => {
		render(<BrushSettings brushSettings={defaultBrushSettings} onBrushSettingsChange={mockOnBrushSettingsChange} />);

		// 啟用陰影開關
		const shadowSwitch = screen.getByRole("checkbox");
		fireEvent.click(shadowSwitch);

		expect(mockOnBrushSettingsChange).toHaveBeenCalledWith(
			expect.objectContaining({
				shadow: expect.objectContaining({
					blur: 5,
					offsetX: 0,
					offsetY: 0,
					color: "#000000",
				}),
			})
		);

		// 確認陰影設定控制項已顯示
		expect(screen.getByText("陰影模糊")).toBeInTheDocument();
		expect(screen.getByText("陰影顏色")).toBeInTheDocument();
		expect(screen.getByText("水平陰影偏移")).toBeInTheDocument();
		expect(screen.getByText("垂直陰影偏移")).toBeInTheDocument();
	});

	test("停用陰影應移除陰影設定並呼叫 onBrushSettingsChange", () => {
		// 初始設定包含陰影
		const settingsWithShadow = {
			...defaultBrushSettings,
			shadow: {
				blur: 5,
				offsetX: 0,
				offsetY: 0,
				color: "#000000",
			},
		};

		render(<BrushSettings brushSettings={settingsWithShadow} onBrushSettingsChange={mockOnBrushSettingsChange} />);

		// 已啟用陰影，檢查陰影控制項是否存在
		expect(screen.getByText("陰影模糊")).toBeInTheDocument();

		// 停用陰影開關
		const shadowSwitch = screen.getByRole("checkbox");
		fireEvent.click(shadowSwitch);

		// 檢查 shadow 屬性是否被移除
		expect(mockOnBrushSettingsChange).toHaveBeenCalled();
		const callArg = mockOnBrushSettingsChange.mock.calls[0][0];
		expect(callArg).not.toHaveProperty("shadow");
	});

	test("更改陰影模糊值應呼叫 onBrushSettingsChange", () => {
		// 初始設定包含陰影
		const settingsWithShadow = {
			...defaultBrushSettings,
			shadow: {
				blur: 5,
				offsetX: 0,
				offsetY: 0,
				color: "#000000",
			},
		};

		render(<BrushSettings brushSettings={settingsWithShadow} onBrushSettingsChange={mockOnBrushSettingsChange} />);

		// 確認陰影設定已顯示
		expect(screen.getByText("陰影模糊")).toBeInTheDocument();

		// 獲取所有滑塊
		const allSliders = screen.getAllByRole("slider");
		// 第三個滑塊是陰影模糊
		const blurSlider = allSliders[2];

		// 更改陰影模糊
		fireEvent.change(blurSlider, { target: { value: "10" } });

		expect(mockOnBrushSettingsChange).toHaveBeenCalledWith(
			expect.objectContaining({
				shadow: expect.objectContaining({
					blur: 10,
				}),
			})
		);
	});

	// 單獨測試陰影顏色
	test("更改陰影顏色應呼叫 onBrushSettingsChange", () => {
		// 初始設定包含陰影
		const settingsWithShadow = {
			...defaultBrushSettings,
			shadow: {
				blur: 5,
				offsetX: 0,
				offsetY: 0,
				color: "#000000",
			},
		};

		render(<BrushSettings brushSettings={settingsWithShadow} onBrushSettingsChange={mockOnBrushSettingsChange} />);

		// 檢查陰影顏色選擇器
		const colorPickers = screen.getAllByTestId("color-picker");
		expect(colorPickers.length).toBeGreaterThan(1); // 至少有2個顏色選擇器

		// 第二個顏色選擇器應該是陰影顏色
		const colorInput = colorPickers[1].querySelector("input");
		expect(colorInput).not.toBeNull();

		fireEvent.change(colorInput, { target: { value: "#ff0000" } });

		expect(mockOnBrushSettingsChange).toHaveBeenCalledWith(
			expect.objectContaining({
				shadow: expect.objectContaining({
					color: "#ff0000",
				}),
			})
		);
	});
});
