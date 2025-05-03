import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TextInputArea from "../components/TextInputArea";
import { useTextInput } from "../hooks/UseTextInput";
import { isValidMessage } from "../helpers/HandleTextInput";

// Mock dependencies
jest.mock("../hooks/UseTextInput");
jest.mock("../helpers/HandleTextInput");
jest.mock("../components/FunctionButton", () => (props) => (
  <button 
    onClick={props.onClick} 
    disabled={props.disabled} 
    aria-label={props["aria-label"]}
    data-testid={`function-button-${props["aria-label"]}`}
  >
    {props.icon}
  </button>
));

// Mock MUI components
jest.mock("@mui/material", () => ({
  Box: (props) => <div {...props}>{props.children}</div>,
  TextField: (props) => (
    <input 
      value={props.value} 
      onChange={props.onChange} 
      disabled={props.disabled} 
      placeholder={props.placeholder}
      data-testid="text-field"
    />
  ),
  Tooltip: (props) => <div title={props.title}>{props.children}</div>
}));

// Mock MUI icons
jest.mock("@mui/icons-material/Assignment", () => () => "AssignmentIcon");
jest.mock("@mui/icons-material/Input", () => () => "InputIcon");
jest.mock("@mui/icons-material/Analytics", () => () => "AnalyticsIcon");
jest.mock("@mui/icons-material/Assistant", () => () => "AssistantIcon");

describe("TextInputArea component", () => {
  const mockProps = {
    onSendMessage: jest.fn(),
    onSendImage: jest.fn(),
    onAnalyzeCanvas: jest.fn(),
    onAIDrawing: jest.fn(),
    disabled: false
  };

  const mockUseTextInput = {
    message: "test message",
    textInputRef: { current: {} },
    imageInputRef: { current: {} },
    sendText: jest.fn(),
    sendImage: jest.fn(),
    messageChange: jest.fn(),
    imageChange: jest.fn(),
    handleAnalyzeCanvas: jest.fn(),
    handleAIDrawing: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useTextInput.mockReturnValue(mockUseTextInput);
    isValidMessage.mockReturnValue(true);
  });

  it("renders all buttons and text field", () => {
    render(<TextInputArea {...mockProps} />);
    
    expect(screen.getByTestId("function-button-上傳圖片")).toBeInTheDocument();
    expect(screen.getByTestId("function-button-分析畫布")).toBeInTheDocument();
    expect(screen.getByTestId("function-button-AI 畫圖")).toBeInTheDocument();
    expect(screen.getByTestId("function-button-輸入")).toBeInTheDocument();
    expect(screen.getByTestId("text-field")).toBeInTheDocument();
    expect(screen.getByTestId("text-field").placeholder).toBe("輸入訊息...");
  });

  it("calls useTextInput with correct props", () => {
    render(<TextInputArea {...mockProps} />);
    
    expect(useTextInput).toHaveBeenCalledWith(
      mockProps.onSendMessage,
      mockProps.onSendImage,
      mockProps.onAnalyzeCanvas,
      mockProps.onAIDrawing,
      mockProps.disabled
    );
  });

  it("calls sendText when send button is clicked", () => {
    render(<TextInputArea {...mockProps} />);
    
    fireEvent.click(screen.getByTestId("function-button-輸入"));
    expect(mockUseTextInput.sendText).toHaveBeenCalledTimes(1);
  });

  it("calls sendImage when upload image button is clicked", () => {
    render(<TextInputArea {...mockProps} />);
    
    fireEvent.click(screen.getByTestId("function-button-上傳圖片"));
    expect(mockUseTextInput.sendImage).toHaveBeenCalledTimes(1);
  });

  it("calls handleAnalyzeCanvas when analyze canvas button is clicked", () => {
    render(<TextInputArea {...mockProps} />);
    
    fireEvent.click(screen.getByTestId("function-button-分析畫布"));
    expect(mockUseTextInput.handleAnalyzeCanvas).toHaveBeenCalledTimes(1);
  });

  it("calls handleAIDrawing when AI drawing button is clicked", () => {
    render(<TextInputArea {...mockProps} />);
    
    fireEvent.click(screen.getByTestId("function-button-AI 畫圖"));
    expect(mockUseTextInput.handleAIDrawing).toHaveBeenCalledTimes(1);
  });

  it("disables send button when message is invalid", () => {
    isValidMessage.mockReturnValue(false);
    render(<TextInputArea {...mockProps} />);
    
    expect(screen.getByTestId("function-button-輸入")).toBeDisabled();
  });

  it("disables all buttons when disabled prop is true", () => {
    render(<TextInputArea {...mockProps} disabled={true} />);
    
    expect(screen.getByTestId("function-button-上傳圖片")).toBeDisabled();
    expect(screen.getByTestId("function-button-分析畫布")).toBeDisabled();
    expect(screen.getByTestId("function-button-AI 畫圖")).toBeDisabled();
    expect(screen.getByTestId("function-button-輸入")).toBeDisabled();
    expect(screen.getByTestId("text-field")).toBeDisabled();
  });

  it("updates text field when messageChange is called", () => {
    render(<TextInputArea {...mockProps} />);
    
    const textField = screen.getByTestId("text-field");
    fireEvent.change(textField, { target: { value: "new message" } });
    
    expect(mockUseTextInput.messageChange).toHaveBeenCalled();
  });
});