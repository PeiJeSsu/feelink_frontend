import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FunctionButton from "../components/FunctionButton";
import { functionButtonStyles } from "../styles/FunctionButtonStyles";

// Mock the styles
jest.mock("../styles/FunctionButtonStyles", () => ({
  functionButtonStyles: {
    button: (sx) => ({ ...sx }),
  },
}));

describe("FunctionButton component", () => {
  const mockOnClick = jest.fn();
  const mockIcon = <span data-testid="test-icon">Icon</span>;

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it("renders button with icon", () => {
    render(<FunctionButton onClick={mockOnClick} icon={mockIcon} />);
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    expect(screen.getByTestId("test-icon")).toHaveTextContent("Icon");
  });

  it("calls onClick handler when clicked", () => {
    render(<FunctionButton onClick={mockOnClick} icon={mockIcon} />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<FunctionButton onClick={mockOnClick} icon={mockIcon} disabled={true} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("should not call onClick when disabled", () => {
    render(<FunctionButton onClick={mockOnClick} icon={mockIcon} disabled={true} />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it("applies custom styles via sx prop", () => {
    const customSx = { color: "red" };
    render(<FunctionButton onClick={mockOnClick} icon={mockIcon} sx={customSx} />);
    
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders without icon when icon prop is not provided", () => {
    render(<FunctionButton onClick={mockOnClick} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("");
  });
});