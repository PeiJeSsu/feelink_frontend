import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ShapeSettings from "../ShapeSettings";

// 模擬 Material-UI 組件
jest.mock("@mui/material", () => {
  return {
    FormControl: function FormControl(props) {
      return <div data-testid="form-control">{props.children}</div>;
    },
    InputLabel: function InputLabel(props) {
      return <label id={props.id}>{props.children}</label>;
    },
    Select: function Select(props) {
      return (
        <select
          aria-labelledby={props.labelId}
          value={props.value}
          onChange={props.onChange}
          data-testid="shape-type-select"
        >
          {props.children}
        </select>
      );
    },
    MenuItem: function MenuItem(props) {
      return <option value={props.value}>{props.children}</option>;
    },
    Switch: function Switch(props) {
      return (
        <input
          type="checkbox"
          checked={props.checked}
          onChange={props.onChange}
          data-testid={`switch-${props.checked ? "checked" : "unchecked"}`}
        />
      );
    },
    FormControlLabel: function FormControlLabel(props) {
      return (
        <label>
          {props.control}
          <span>{props.label}</span>
        </label>
      );
    },
    Typography: function Typography(props) {
      return <div {...props}>{props.children}</div>;
    },
    Slider: function Slider(props) {
      return (
        <input
          type="range"
          min={props.min}
          max={props.max}
          value={props.value}
          onChange={(e) => props.onChange(e, parseInt(e.target.value))}
          disabled={props.disabled}
          data-testid="stroke-width-slider"
        />
      );
    },
  };
});

// 模擬 ColorPicker 組件
jest.mock("../../color/ColorPicker", () => {
  const MockColorPicker = ({ label, value, onChange, disabled }) => (
    <div data-testid={`color-picker-${label}`}>
      <label>{label}</label>
      <input 
        type="color" 
        value={value} 
        onChange={onChange} 
        disabled={disabled}
        data-testid={`color-input-${label}`}
      />
    </div>
  );

  return MockColorPicker;
});

describe("ShapeSettings 組件測試", () => {
  const defaultShapeSettings = {
    type: "RECT",
    color: "#ff0000",
    fill: "#ff0000",
    showStroke: true,
    stroke: "#000000",
    strokeWidth: 2,
  };

  const mockOnShapeSettingsChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("應正確渲染所有圖形設定控制項", () => {
    render(<ShapeSettings shapeSettings={defaultShapeSettings} onShapeSettingsChange={mockOnShapeSettingsChange} />);

    // 檢查圖形類型選擇器
    expect(screen.getByLabelText("圖形類型")).toBeInTheDocument();
    expect(screen.getByText("矩形")).toBeInTheDocument();
    
    // 檢查填充和邊框開關
    expect(screen.getByText("填充")).toBeInTheDocument();
    expect(screen.getByText("邊框")).toBeInTheDocument();
    
    // 檢查顏色選擇器
    expect(screen.getByTestId("color-picker-填充顏色")).toBeInTheDocument();
    expect(screen.getByTestId("color-picker-邊框顏色")).toBeInTheDocument();
    
    // 檢查邊框粗細滑塊
    expect(screen.getByText("邊框粗細")).toBeInTheDocument();
    expect(screen.getByTestId("stroke-width-slider")).toBeInTheDocument();
  });

  test("更改圖形類型應呼叫 onShapeSettingsChange", () => {
    render(<ShapeSettings shapeSettings={defaultShapeSettings} onShapeSettingsChange={mockOnShapeSettingsChange} />);

    const selectElement = screen.getByTestId("shape-type-select");
    fireEvent.change(selectElement, { target: { value: "CIRCLE" } });

    expect(mockOnShapeSettingsChange).toHaveBeenCalledWith({
      ...defaultShapeSettings,
      type: "CIRCLE",
    });
  });

  test("切換填充開關應呼叫 onShapeSettingsChange", () => {
    render(<ShapeSettings shapeSettings={defaultShapeSettings} onShapeSettingsChange={mockOnShapeSettingsChange} />);

    // 找到填充開關並點擊
    const fillSwitch = screen.getAllByRole("checkbox")[0];
    fireEvent.click(fillSwitch);

    expect(mockOnShapeSettingsChange).toHaveBeenCalledWith({
      ...defaultShapeSettings,
      fill: "transparent", // 關閉填充
    });
  });

  test("切換邊框開關應呼叫 onShapeSettingsChange", () => {
    render(<ShapeSettings shapeSettings={defaultShapeSettings} onShapeSettingsChange={mockOnShapeSettingsChange} />);

    // 找到邊框開關並點擊
    const strokeSwitch = screen.getAllByRole("checkbox")[1];
    fireEvent.click(strokeSwitch);

    expect(mockOnShapeSettingsChange).toHaveBeenCalledWith({
      ...defaultShapeSettings,
      showStroke: false,
      strokeWidth: 0, // 關閉邊框時邊框寬度設為0
    });
  });

  test("更改填充顏色應呼叫 onShapeSettingsChange", () => {
    render(<ShapeSettings shapeSettings={defaultShapeSettings} onShapeSettingsChange={mockOnShapeSettingsChange} />);

    const fillColorInput = screen.getByTestId("color-input-填充顏色");
    fireEvent.change(fillColorInput, { target: { value: "#00ff00" } });

    expect(mockOnShapeSettingsChange).toHaveBeenCalledWith({
      ...defaultShapeSettings,
      color: "#00ff00",
      fill: "#00ff00", // 填充顏色同時改變
    });
  });

  test("更改邊框顏色應呼叫 onShapeSettingsChange", () => {
    render(<ShapeSettings shapeSettings={defaultShapeSettings} onShapeSettingsChange={mockOnShapeSettingsChange} />);

    const strokeColorInput = screen.getByTestId("color-input-邊框顏色");
    fireEvent.change(strokeColorInput, { target: { value: "#0000ff" } });

    expect(mockOnShapeSettingsChange).toHaveBeenCalledWith({
      ...defaultShapeSettings,
      stroke: "#0000ff",
    });
  });

  test("更改邊框粗細應呼叫 onShapeSettingsChange", () => {
    render(<ShapeSettings shapeSettings={defaultShapeSettings} onShapeSettingsChange={mockOnShapeSettingsChange} />);

    const strokeWidthSlider = screen.getByTestId("stroke-width-slider");
    fireEvent.change(strokeWidthSlider, { target: { value: "5" } });

    expect(mockOnShapeSettingsChange).toHaveBeenCalledWith({
      ...defaultShapeSettings,
      strokeWidth: 5,
    });
  });

  test("填充關閉時填充顏色選擇器應被禁用", () => {
    const noFillSettings = {
      ...defaultShapeSettings,
      fill: "transparent",
    };
    
    render(<ShapeSettings shapeSettings={noFillSettings} onShapeSettingsChange={mockOnShapeSettingsChange} />);

    const fillColorInput = screen.getByTestId("color-input-填充顏色");
    expect(fillColorInput).toBeDisabled();
  });

  test("邊框關閉時邊框相關控制項應被禁用", () => {
    const noStrokeSettings = {
      ...defaultShapeSettings,
      showStroke: false,
      strokeWidth: 0,
    };
    
    render(<ShapeSettings shapeSettings={noStrokeSettings} onShapeSettingsChange={mockOnShapeSettingsChange} />);

    const strokeColorInput = screen.getByTestId("color-input-邊框顏色");
    expect(strokeColorInput).toBeDisabled();
    
    const strokeWidthSlider = screen.getByTestId("stroke-width-slider");
    expect(strokeWidthSlider).toBeDisabled();
  });
}); 