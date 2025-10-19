import * as fabric from "fabric";
import { colorValues, convertToImg } from "../../../utils/BrushUtils";

class RibbonBrush extends fabric.BaseBrush {
    constructor(canvas, options = {}) {
        super(canvas);

        this.color = options.color || "#000";
        this.opacity = options.opacity || 1;
        this.width = options.width || 1;

        this._nrPainters = 50;
        this._painters = [];
        this._lastPoint = null;
        this._interval = null;

        this._initializePainters();
    }

    _initializePainters() {
        this._painters = [];
        for (let i = 0; i < this._nrPainters; i++) {
            this._painters.push({
                dx: this.canvas.width / 2,
                dy: this.canvas.height / 2,
                ax: 0,
                ay: 0,
                div: 0.1,
                ease: Math.random() * 0.2 + 0.6
            });
        }
    }

    update() {
        const ctx = this.canvas.contextTop;
        for (const painter of this._painters) {
            ctx.beginPath();
            ctx.moveTo(painter.dx, painter.dy);
            
            // 更新畫家位置
            painter.dx -= painter.ax = (painter.ax + (painter.dx - this._lastPoint.x) * painter.div) * painter.ease;
            painter.dy -= painter.ay = (painter.ay + (painter.dy - this._lastPoint.y) * painter.div) * painter.ease;
            
            ctx.lineTo(painter.dx, painter.dy);
            ctx.stroke();
        }
    }

    onMouseDown(pointer) {
        this._initializePainters();
        this._lastPoint = pointer;

        const ctx = this.canvas.contextTop;
        const color = colorValues(this.color);
        
        ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${0.05 * this.opacity})`;
        ctx.lineWidth = this.width;

        // 設置所有畫家的初始位置
        for (const painter of this._painters) {
            painter.dx = pointer.x;
            painter.dy = pointer.y;
        }

        // 啟動動畫迴圈
        this._interval = setInterval(() => this.update(), 1000/60);
    }

    onMouseMove(pointer) {
        this._lastPoint = pointer;
    }

    onMouseUp() {
        clearInterval(this._interval);
        convertToImg(this.canvas).then((img) => {
            img.setCoords();
            this.canvas.add(img);
            this.canvas.clearContext(this.canvas.contextTop);
            // 儲存到歷史記錄
            if (this.canvas.historyManager) {
                this.canvas.historyManager.saveState();
            }
        });
    }
}

export default RibbonBrush;
