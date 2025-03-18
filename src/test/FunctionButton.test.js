import { render, screen, fireEvent } from "@testing-library/react";
import FunctionButton from "../ChatRoom/functionButton";
import InputIcon from "@mui/icons-material/Input";

describe("FunctionButton 測試", () => {
    test("應該正確渲染按鈕", () => {
        render(<FunctionButton displayName="測試按鈕" icon={<InputIcon />} />);
        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    test("應該呼叫 onClick", () => {
        const mockOnClick = jest.fn();
        render(<FunctionButton displayName="測試按鈕" icon={<InputIcon />} onClick={mockOnClick} />);
        
        const button = screen.getByRole("button");
        fireEvent.click(button);
        
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    test("應該處理 disabled 狀態", () => {
        const mockOnClick = jest.fn();
        render(<FunctionButton displayName="測試按鈕" icon={<InputIcon />} onClick={mockOnClick} disabled />);
        
        const button = screen.getByRole("button");
        expect(button).toBeDisabled();

        fireEvent.click(button);
        expect(mockOnClick).not.toHaveBeenCalled();
    });
});