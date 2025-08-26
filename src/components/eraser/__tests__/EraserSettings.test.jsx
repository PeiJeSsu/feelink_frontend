import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import EraserSettings from "../EraserSettings";

jest.mock("@mui/material", () => {
	const PropTypes = require("prop-types");
	const Slider = function Slider(props) {
		return (
			<input
				type="range"
				min={props.min}
				max={props.max}
				value={props.value}
				onChange={(e) => props.onChange(e, parseInt(e.target.value))}
				data-testid="slider"
			/>
		);
	};
	Slider.propTypes = {
		min: PropTypes.number,
		max: PropTypes.number,
		value: PropTypes.number,
		onChange: PropTypes.func,
	};

	const Typography = function Typography(props) {
		return <div {...props}>{props.children}</div>;
	};
	Typography.propTypes = { children: PropTypes.node };

	const FormControl = function FormControl(props) {
		return <div data-testid="form-control">{props.children}</div>;
	};
	FormControl.propTypes = { children: PropTypes.node };

	const FormControlLabel = function FormControlLabel(props) {
		return (
			<label data-testid={`radio-label-${props.value}`}>
				{props.control}
				<span>{props.label}</span>
			</label>
		);
	};
	FormControlLabel.propTypes = {
		control: PropTypes.node,
		label: PropTypes.string,
		value: PropTypes.string,
	};

	const RadioGroup = function RadioGroup(props) {
		return (
			<div
				data-testid="radio-group"
				onChange={props.onChange}
				onClick={() => {
					if (props.onChange) {
						props.onChange({ target: { value: "path" } });
					}
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						props.onChange?.({ target: { value: "path" } });
					}
				}}
				value={props.value}
				role="radiogroup"
				aria-label="eraser type options"
				tabIndex="0"
			>
				{props.children}
			</div>
		);
	};
	RadioGroup.propTypes = {
		children: PropTypes.node,
		value: PropTypes.string,
		onChange: PropTypes.func,
	};

	const Radio = function Radio(props) {
		return <input type="radio" value={props.value} data-testid={`radio-input-${props.value}`} />;
	};
	Radio.propTypes = {
		value: PropTypes.string,
	};

	return {
		Slider,
		Typography,
		FormControl,
		FormControlLabel,
		RadioGroup,
		Radio,
	};
});

describe("EraserSettings 組件測試", () => {
	const defaultEraserSettings = {
		type: "object",
		size: 20,
	};

	const mockOnEraserSettingsChange = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test("應正確渲染所有橡皮擦設定控制項", () => {
		render(<EraserSettings eraserSettings={defaultEraserSettings} onEraserSettingsChange={mockOnEraserSettingsChange} />);

		// 檢查橡皮擦類型選擇器
		expect(screen.getByText("橡皮擦類型")).toBeInTheDocument();
		expect(screen.getByText("物件橡皮擦")).toBeInTheDocument();
		expect(screen.getByText("筆跡橡皮擦")).toBeInTheDocument();

		// 檢查橡皮擦大小滑塊
		expect(screen.getByText("橡皮擦大小")).toBeInTheDocument();
		expect(screen.getByTestId("slider")).toBeInTheDocument();
	});

	test("更改橡皮擦類型應呼叫 onEraserSettingsChange", () => {
		render(<EraserSettings eraserSettings={defaultEraserSettings} onEraserSettingsChange={mockOnEraserSettingsChange} />);

		// 直接模擬 RadioGroup 的 onChange 事件
		const radioGroup = screen.getByTestId("radio-group");
		fireEvent.click(radioGroup);

		expect(mockOnEraserSettingsChange).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "path",
			})
		);
	});

	test("更改橡皮擦大小應呼叫 onEraserSettingsChange", () => {
		render(<EraserSettings eraserSettings={defaultEraserSettings} onEraserSettingsChange={mockOnEraserSettingsChange} />);

		const slider = screen.getByTestId("slider");
		fireEvent.change(slider, { target: { value: "50" } });

		expect(mockOnEraserSettingsChange).toHaveBeenCalledWith(
			expect.objectContaining({
				size: 50,
			})
		);
	});

	test("應使用預設值處理未指定的屬性", () => {
		const incompleteSettings = {
			size: 30,
		};

		render(<EraserSettings eraserSettings={incompleteSettings} onEraserSettingsChange={mockOnEraserSettingsChange} />);

		const radioGroup = screen.getByTestId("radio-group");
		expect(radioGroup).toBeInTheDocument();

		const slider = screen.getByTestId("slider");
		expect(slider).toHaveValue("30");
	});
});
