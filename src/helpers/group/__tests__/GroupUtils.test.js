import * as fabric from "fabric";
import { groupSelectedObjects, ungroupSelectedGroup } from "../GroupUtils";

// Mock fabric objects
jest.mock("fabric", () => {
    const mockGroup = jest.fn();
    const mockActiveSelection = jest.fn();

    // Mock Group class
    mockGroup.mockImplementation(function(objects) {
        this.objects = objects || [];
        this.removeAll = jest.fn(() => this.objects);
        this.isType = jest.fn((type) => type === 'group');
    });

    // Mock ActiveSelection class  
    mockActiveSelection.mockImplementation(function(objects, options) {
        this.objects = objects || [];
        this.canvas = options?.canvas;
        this.removeAll = jest.fn(() => this.objects);
        this.isType = jest.fn((type) => type === 'activeSelection');
    });

    return {
        Group: mockGroup,
        ActiveSelection: mockActiveSelection,
        __esModule: true,
    };
});

describe('GroupUtils 測試', () => {
    let mockCanvas;
    let mockActiveObject;
    let mockGroup;
    let mockObjects;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockObjects = [
            { id: 'obj1', type: 'rect' },
            { id: 'obj2', type: 'circle' }
        ];

        mockActiveObject = {
            removeAll: jest.fn(() => mockObjects),
            isType: jest.fn((type) => type === 'activeSelection'),
        };

        mockGroup = {
            removeAll: jest.fn(() => mockObjects),
            isType: jest.fn((type) => type === 'group'),
        };

        mockCanvas = {
            getActiveObject: jest.fn(),
            add: jest.fn(),
            remove: jest.fn(),
            setActiveObject: jest.fn(),
            requestRenderAll: jest.fn(),
        };
    });

    describe('groupSelectedObjects', () => {
        test('應能將多選物件群組化', () => {
            // 設定 canvas 有 ActiveSelection
            mockCanvas.getActiveObject.mockReturnValue(mockActiveObject);
            
            // 確保 mockActiveObject 是 ActiveSelection 的實例
            Object.setPrototypeOf(mockActiveObject, fabric.ActiveSelection.prototype);

            groupSelectedObjects(mockCanvas);

            expect(mockActiveObject.removeAll).toHaveBeenCalled();
            expect(mockCanvas.add).toHaveBeenCalled();
            expect(mockCanvas.setActiveObject).toHaveBeenCalled();
            expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
        });

        test('當沒有選取物件時應直接返回', () => {
            mockCanvas.getActiveObject.mockReturnValue(null);

            groupSelectedObjects(mockCanvas);

            expect(mockCanvas.add).not.toHaveBeenCalled();
            expect(mockCanvas.setActiveObject).not.toHaveBeenCalled();
            expect(mockCanvas.requestRenderAll).not.toHaveBeenCalled();
        });

        test('當選取物件不是 ActiveSelection 時應直接返回', () => {
            const singleObject = {
                type: 'rect',
                isType: jest.fn((type) => type === 'rect'),
            };
            mockCanvas.getActiveObject.mockReturnValue(singleObject);

            groupSelectedObjects(mockCanvas);

            expect(mockCanvas.add).not.toHaveBeenCalled();
            expect(mockCanvas.setActiveObject).not.toHaveBeenCalled();
            expect(mockCanvas.requestRenderAll).not.toHaveBeenCalled();
        });

        test('應能正確創建 Group 實例', () => {
            mockCanvas.getActiveObject.mockReturnValue(mockActiveObject);
            Object.setPrototypeOf(mockActiveObject, fabric.ActiveSelection.prototype);

            groupSelectedObjects(mockCanvas);

            expect(fabric.Group).toHaveBeenCalledWith(mockObjects);
        });

        test('應將新群組設為活動物件', () => {
            mockCanvas.getActiveObject.mockReturnValue(mockActiveObject);
            Object.setPrototypeOf(mockActiveObject, fabric.ActiveSelection.prototype);

            groupSelectedObjects(mockCanvas);

            expect(mockCanvas.setActiveObject).toHaveBeenCalled();
            
            // 驗證傳遞給 setActiveObject 的是 Group 實例
            const setActiveObjectCall = mockCanvas.setActiveObject.mock.calls[0];
            expect(setActiveObjectCall[0]).toBeInstanceOf(fabric.Group);
        });
    });

    describe('ungroupSelectedGroup', () => {
        test('應能解散群組', () => {
            mockCanvas.getActiveObject.mockReturnValue(mockGroup);
            Object.setPrototypeOf(mockGroup, fabric.Group.prototype);

            ungroupSelectedGroup(mockCanvas);

            expect(mockCanvas.remove).toHaveBeenCalledWith(mockGroup);
            expect(mockGroup.removeAll).toHaveBeenCalled();
            expect(mockCanvas.setActiveObject).toHaveBeenCalled();
            expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
        });

        test('當沒有選取物件時應直接返回', () => {
            mockCanvas.getActiveObject.mockReturnValue(null);

            ungroupSelectedGroup(mockCanvas);

            expect(mockCanvas.remove).not.toHaveBeenCalled();
            expect(mockCanvas.setActiveObject).not.toHaveBeenCalled();
            expect(mockCanvas.requestRenderAll).not.toHaveBeenCalled();
        });

        test('當選取物件不是群組時應直接返回', () => {
            const nonGroupObject = {
                type: 'rect',
                isType: jest.fn((type) => type === 'rect'),
            };
            mockCanvas.getActiveObject.mockReturnValue(nonGroupObject);

            ungroupSelectedGroup(mockCanvas);

            expect(mockCanvas.remove).not.toHaveBeenCalled();
            expect(mockCanvas.setActiveObject).not.toHaveBeenCalled();
            expect(mockCanvas.requestRenderAll).not.toHaveBeenCalled();
        });

        test('應能正確創建 ActiveSelection', () => {
            mockCanvas.getActiveObject.mockReturnValue(mockGroup);
            Object.setPrototypeOf(mockGroup, fabric.Group.prototype);

            ungroupSelectedGroup(mockCanvas);

            expect(fabric.ActiveSelection).toHaveBeenCalledWith(
                mockObjects,
                { canvas: mockCanvas }
            );
        });

        test('應從畫布移除原群組', () => {
            mockCanvas.getActiveObject.mockReturnValue(mockGroup);
            Object.setPrototypeOf(mockGroup, fabric.Group.prototype);

            ungroupSelectedGroup(mockCanvas);

            expect(mockCanvas.remove).toHaveBeenCalledWith(mockGroup);
        });

        test('應將解散後的物件設為新的 ActiveSelection', () => {
            mockCanvas.getActiveObject.mockReturnValue(mockGroup);
            Object.setPrototypeOf(mockGroup, fabric.Group.prototype);

            ungroupSelectedGroup(mockCanvas);

            expect(mockCanvas.setActiveObject).toHaveBeenCalled();
            
            // 驗證傳遞給 setActiveObject 的是 ActiveSelection 實例
            const setActiveObjectCall = mockCanvas.setActiveObject.mock.calls[0];
            expect(setActiveObjectCall[0]).toBeInstanceOf(fabric.ActiveSelection);
        });
    });

    describe('錯誤處理測試', () => {
        test('應處理 removeAll 返回空陣列的情況', () => {
            mockActiveObject.removeAll.mockReturnValue([]);
            mockCanvas.getActiveObject.mockReturnValue(mockActiveObject);
            Object.setPrototypeOf(mockActiveObject, fabric.ActiveSelection.prototype);

            expect(() => groupSelectedObjects(mockCanvas)).not.toThrow();
        });

        test('應處理群組 removeAll 返回空陣列的情況', () => {
            mockGroup.removeAll.mockReturnValue([]);
            mockCanvas.getActiveObject.mockReturnValue(mockGroup);
            Object.setPrototypeOf(mockGroup, fabric.Group.prototype);

            expect(() => ungroupSelectedGroup(mockCanvas)).not.toThrow();
        });
    });

    describe('邊界條件測試', () => {
        test('應處理包含單一物件的 ActiveSelection', () => {
            const singleObjectSelection = {
                removeAll: jest.fn(() => [{ id: 'single', type: 'rect' }]),
                isType: jest.fn((type) => type === 'activeSelection'),
            };
            
            mockCanvas.getActiveObject.mockReturnValue(singleObjectSelection);
            Object.setPrototypeOf(singleObjectSelection, fabric.ActiveSelection.prototype);

            groupSelectedObjects(mockCanvas);

            expect(fabric.Group).toHaveBeenCalledWith([{ id: 'single', type: 'rect' }]);
            expect(mockCanvas.add).toHaveBeenCalled();
        });

        test('應處理包含單一物件的群組解散', () => {
            const singleObjectGroup = {
                removeAll: jest.fn(() => [{ id: 'single', type: 'rect' }]),
                isType: jest.fn((type) => type === 'group'),
            };
            
            mockCanvas.getActiveObject.mockReturnValue(singleObjectGroup);
            Object.setPrototypeOf(singleObjectGroup, fabric.Group.prototype);

            ungroupSelectedGroup(mockCanvas);

            expect(fabric.ActiveSelection).toHaveBeenCalledWith(
                [{ id: 'single', type: 'rect' }],
                { canvas: mockCanvas }
            );
        });
    });
});
