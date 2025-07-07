import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ColorPicker from "../ColorPicker";

jest.mock("@mui/material", () => {
	const PropTypes = require("prop-types");
	const Box = function Box(props) {
		return <div data-testid="mui-box">{props.children}</div>;
	};
	Box.propTypes = { children: PropTypes.node };

	const TextField = function TextField(props) {
		return (
			<div data-testid="mui-textfield">
				<label>{props.label}</label>
				<input
					type={props.type}
					value={props.value}
					onChange={props.onChange}
					disabled={props.disabled}
					data-testid={`color-input-${props.label}`}
				/>
			</div>
		);
	};
	TextField.propTypes = {
		label: PropTypes.string,
		type: PropTypes.string,
		value: PropTypes.string,
		onChange: PropTypes.func,
		disabled: PropTypes.bool,
	};

	const Grid2 = function Grid2(props) {
		return <div data-testid="mui-grid2">{props.children}</div>;
	};
	Grid2.propTypes = { children: PropTypes.node };

	const IconButton = function IconButton(props) {
		return (
			<button data-testid="mui-iconbutton" onClick={props.onClick} disabled={props.disabled}>
				{props.children}
			</button>
		);
	};
	IconButton.propTypes = {
		onClick: PropTypes.func,
		disabled: PropTypes.bool,
		children: PropTypes.node,
	};

	const Tooltip = function Tooltip(props) {
		return <div data-testid="mui-tooltip">{props.children}</div>;
	};
	Tooltip.propTypes = { children: PropTypes.node };

	const Typography = function Typography(props) {
		return <span data-testid="mui-typography">{props.children}</span>;
	};
	Typography.propTypes = { children: PropTypes.node };

	return {
		Box,
		TextField,
		Grid2,
		IconButton,
		Tooltip,
		Typography,
	};
});

describe("ColorPicker 組件測試", () => {
	const mockOnChange = jest.fn();
	const defaultProps = {
		label: "測試顏色",
		value: "#ff0000",
		onChange: mockOnChange,
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test("應正確渲染顏色選擇器", () => {
		render(<ColorPicker {...defaultProps} />);

		const boxes = screen.getAllByTestId("mui-box");
		expect(boxes.length).toBeGreaterThan(0);
		expect(screen.getByTestId("mui-textfield")).toBeInTheDocument();
		expect(screen.getByText("測試顏色")).toBeInTheDocument();
	});

	test("應正確顯示初始顏色值", () => {
		render(<ColorPicker {...defaultProps} />);

		const colorInput = screen.getByTestId("color-input-測試顏色");
		expect(colorInput).toHaveValue("#ff0000");
	});

	test("更改顏色時應觸發 onChange 回調", () => {
		render(<ColorPicker {...defaultProps} />);

		const colorInput = screen.getByTestId("color-input-測試顏色");
		fireEvent.change(colorInput, { target: { value: "#00ff00" } });

		expect(mockOnChange).toHaveBeenCalledTimes(1);
	});

	test("禁用時應正確顯示禁用狀態", () => {
		render(<ColorPicker {...defaultProps} disabled={true} />);

		const colorInput = screen.getByTestId("color-input-測試顏色");
		expect(colorInput).toBeDisabled();
	});
});
