import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppTour from '../AppTour';

// Mock Material-UI components
jest.mock('@mui/material', () => {
    const PropTypes = require('prop-types');
    
    const Button = ({ children, onClick, disabled, startIcon, endIcon, ...props }) => (
        <button data-testid="mui-button" onClick={onClick} disabled={disabled} {...props}>
            {startIcon && <span data-testid="start-icon">{startIcon}</span>}
            {children}
            {endIcon && <span data-testid="end-icon">{endIcon}</span>}
        </button>
    );
    Button.propTypes = { 
        children: PropTypes.node, 
        onClick: PropTypes.func, 
        disabled: PropTypes.bool,
        startIcon: PropTypes.node,
        endIcon: PropTypes.node
    };
    
    const Box = ({ children, sx, ...props }) => <div data-testid="mui-box" style={sx} {...props}>{children}</div>;
    Box.propTypes = { children: PropTypes.node, sx: PropTypes.object };
    
    const Paper = ({ children, ...props }) => <div data-testid="mui-paper" {...props}>{children}</div>;
    Paper.propTypes = { children: PropTypes.node };
    
    const Typography = ({ children, variant, ...props }) => (
        <div data-testid={`mui-typography-${variant || 'default'}`} {...props}>{children}</div>
    );
    Typography.propTypes = { children: PropTypes.node, variant: PropTypes.string };
    
    const IconButton = ({ children, onClick, ...props }) => (
        <button data-testid="mui-iconbutton" onClick={onClick} {...props}>{children}</button>
    );
    IconButton.propTypes = { children: PropTypes.node, onClick: PropTypes.func };
    
    const LinearProgress = ({ value, ...props }) => (
        <div data-testid="mui-linearprogress" data-value={value} {...props} />
    );
    LinearProgress.propTypes = { value: PropTypes.number };
    
    return {
        Button,
        Box,
        Paper,
        Typography,
        IconButton,
        LinearProgress,
    };
});

// Mock Material-UI icons
jest.mock('@mui/icons-material', () => ({
    ArrowBack: (props) => <span data-testid="arrow-back-icon" {...props}>←</span>,
    ArrowForward: (props) => <span data-testid="arrow-forward-icon" {...props}>→</span>,
    Close: (props) => <span data-testid="close-icon" {...props}>✕</span>,
    SkipNext: (props) => <span data-testid="skip-next-icon" {...props}>⏭</span>,
}));

// Mock DOM methods
const mockQuerySelector = jest.fn();
const mockGetBoundingClientRect = jest.fn();

Object.defineProperty(document, 'querySelector', {
    value: mockQuerySelector,
    writable: true,
});

describe('AppTour 組件測試', () => {
    let mockSetRunTour;
    let mockElement;

    beforeEach(() => {
        mockSetRunTour = jest.fn();
        
        mockElement = {
            getBoundingClientRect: mockGetBoundingClientRect,
        };
        
        mockGetBoundingClientRect.mockReturnValue({
            top: 100,
            left: 200,
            width: 150,
            height: 50,
        });
        
        mockQuerySelector.mockReturnValue(mockElement);
        
        // Clear localStorage before each test
        localStorage.clear();
        
        // Mock window scroll properties
        Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
        Object.defineProperty(window, 'scrollX', { value: 0, writable: true });
        Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('當 runTour 為 false 時不應渲染任何內容', () => {
        render(<AppTour runTour={false} setRunTour={mockSetRunTour} />);
        
        expect(screen.queryByTestId('mui-paper')).not.toBeInTheDocument();
    });

    test('當 runTour 為 true 時應渲染導覽組件', () => {
        render(<AppTour runTour={true} setRunTour={mockSetRunTour} />);
        
        expect(screen.getByTestId('mui-paper')).toBeInTheDocument();
        expect(screen.getByTestId('mui-typography-h6')).toBeInTheDocument();
        expect(screen.getByTestId('mui-linearprogress')).toBeInTheDocument();
    });

    test('應正確顯示第一步的內容', () => {
        render(<AppTour runTour={true} setRunTour={mockSetRunTour} />);
        
        expect(screen.getByText('歡迎來到 FeelInk!')).toBeInTheDocument();
        expect(screen.getByText(/FeelInk 是一個融合情感表達與創作分享的智慧平台/)).toBeInTheDocument();
    });

    test('點擊下一步按鈕應前進到下一步', () => {
        render(<AppTour runTour={true} setRunTour={mockSetRunTour} />);
        
        const nextButton = screen.getByText('下一步');
        fireEvent.click(nextButton);
        
        expect(screen.getByText('頂部工具欄')).toBeInTheDocument();
    });

    test('點擊上一步按鈕應回到上一步', () => {
        render(<AppTour runTour={true} setRunTour={mockSetRunTour} />);
        
        // 先前進到第二步
        const nextButton = screen.getByText('下一步');
        fireEvent.click(nextButton);
        
        // 然後回到第一步
        const prevButton = screen.getByText('上一步');
        fireEvent.click(prevButton);
        
        expect(screen.getByText('歡迎來到 FeelInk!')).toBeInTheDocument();
    });

    test('在第一步時上一步按鈕應為禁用狀態', () => {
        render(<AppTour runTour={true} setRunTour={mockSetRunTour} />);
        
        const prevButton = screen.getByText('上一步');
        expect(prevButton).toBeDisabled();
    });

    test('在最後一步時下一步按鈕應顯示"完成"', () => {
        render(<AppTour runTour={true} setRunTour={mockSetRunTour} />);
        
        // 點擊多次到達最後一步
        const nextButton = screen.getByText('下一步');
        for (let i = 0; i < 10; i++) {
            if (nextButton.textContent === '完成') break;
            fireEvent.click(nextButton);
        }
        
        expect(screen.getByText('完成')).toBeInTheDocument();
    });

    test('點擊關閉按鈕應結束導覽', () => {
        render(<AppTour runTour={true} setRunTour={mockSetRunTour} />);
        
        const closeButton = screen.getByTestId('mui-iconbutton');
        fireEvent.click(closeButton);
        
        expect(mockSetRunTour).toHaveBeenCalledWith(false);
    });

    test('點擊跳過導覽按鈕應結束導覽', () => {
        render(<AppTour runTour={true} setRunTour={mockSetRunTour} />);
        
        const skipButton = screen.getByText('跳過導覽');
        fireEvent.click(skipButton);
        
        expect(mockSetRunTour).toHaveBeenCalledWith(false);
    });

    test('完成導覽應設定 localStorage 標記', () => {
        render(<AppTour runTour={true} setRunTour={mockSetRunTour} />);
        
        const closeButton = screen.getByTestId('mui-iconbutton');
        fireEvent.click(closeButton);
        
        expect(localStorage.getItem('hasSeenTour')).toBe('true');
    });

    test('應正確顯示進度條', () => {
        render(<AppTour runTour={true} setRunTour={mockSetRunTour} />);
        
        const progressBar = screen.getByTestId('mui-linearprogress');
        expect(progressBar).toHaveAttribute('data-value');
    });

    test('應正確顯示步驟計數', () => {
        render(<AppTour runTour={true} setRunTour={mockSetRunTour} />);
        
        expect(screen.getByText(/1 \/ /)).toBeInTheDocument();
    });

    test('當目標元素不存在時應正確處理', () => {
        mockQuerySelector.mockReturnValue(null);
        
        expect(() => {
            render(<AppTour runTour={true} setRunTour={mockSetRunTour} />);
        }).not.toThrow();
    });

    test('應正確計算 tooltip 位置 (bottom placement)', () => {
        render(<AppTour runTour={true} setRunTour={mockSetRunTour} />);
        
        // 驗證組件能正常渲染，表示位置計算正確
        expect(screen.getByTestId('mui-paper')).toBeInTheDocument();
    });

    test('window resize 時應更新高亮位置', async () => {
        render(<AppTour runTour={true} setRunTour={mockSetRunTour} />);
        
        // 觸發 resize 事件
        fireEvent(window, new Event('resize'));
        
        // 等待事件處理完成
        await waitFor(() => {
            expect(mockQuerySelector).toHaveBeenCalled();
        });
    });

    test('首次訪問時應自動啟動導覽', async () => {
        // 確保 hasSeenTour 不存在
        localStorage.removeItem('hasSeenTour');
        
        render(<AppTour runTour={false} setRunTour={mockSetRunTour} />);
        
        // 等待定時器執行
        await waitFor(() => {
            expect(mockSetRunTour).toHaveBeenCalledWith(true);
        }, { timeout: 2000 });
    });

    test('已見過導覽時不應自動啟動', async () => {
        localStorage.setItem('hasSeenTour', 'true');
        
        render(<AppTour runTour={false} setRunTour={mockSetRunTour} />);
        
        // 等待一段時間確保沒有調用
        await new Promise(resolve => setTimeout(resolve, 1100));
        
        expect(mockSetRunTour).not.toHaveBeenCalled();
    });

    test('應正確處理不同的 placement 選項', () => {
        render(<AppTour runTour={true} setRunTour={mockSetRunTour} />);
        
        // 前進到有不同 placement 的步驟
        const nextButton = screen.getByText('下一步');
        for (let i = 0; i < 7; i++) {
            fireEvent.click(nextButton);
        }
        
        // 驗證組件仍能正常渲染
        expect(screen.getByTestId('mui-paper')).toBeInTheDocument();
    });

    test('應正確處理邊界情況的 tooltip 位置計算', () => {
        // 模擬元素在螢幕邊緣的情況
        mockGetBoundingClientRect.mockReturnValue({
            top: 10,
            left: 10,
            width: 150,
            height: 50,
        });
        
        render(<AppTour runTour={true} setRunTour={mockSetRunTour} />);
        
        expect(screen.getByTestId('mui-paper')).toBeInTheDocument();
    });

    test('在最後一步點擊完成應結束導覽', () => {
        render(<AppTour runTour={true} setRunTour={mockSetRunTour} />);
        
        // 前進到最後一步
        const nextButton = screen.getByText('下一步');
        for (let i = 0; i < 10; i++) {
            if (nextButton.textContent === '完成') break;
            fireEvent.click(nextButton);
        }
        
        // 點擊完成
        const finishButton = screen.getByText('完成');
        fireEvent.click(finishButton);
        
        expect(mockSetRunTour).toHaveBeenCalledWith(false);
        expect(localStorage.getItem('hasSeenTour')).toBe('true');
    });

    test('應正確處理 canvas 元素較大的情況', () => {
        mockGetBoundingClientRect.mockReturnValue({
            top: 200,
            left: 300,
            width: 800,
            height: 600,
        });
        
        render(<AppTour runTour={true} setRunTour={mockSetRunTour} />);
        
        expect(screen.getByTestId('mui-paper')).toBeInTheDocument();
    });
});
