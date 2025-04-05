import * as fabric from "fabric";
/*
 * FloodFill for fabric.js
 * @author Arjan Haverkamp @av01d
 * @date October 2018
 * @modified by: Shivam Chauhan @shivamc489
 * @date June 2024
 */

const FloodFill = {
    withinTolerance: function (array1, offset, array2, tolerance) {
      const length = array2.length;
      for (let i = 0; i < length; i++) {
        if (Math.abs(array1[offset + i] - array2[i]) > tolerance) {
          return false;
        }
      }
      return true;
    },
  
    // The actual flood fill implementation
    fill: function (
      imageData,
      getPointOffsetFn,
      point,
      color,
      target,
      tolerance,
      width,
      height
    ) {
      const directions = [
          [1, 0],
          [0, 1],
          [0, -1],
          [-1, 0],
        ],
        points = [{ x: point.x, y: point.y }],
        queue = [],
        seen = new Set(),
        offset = getPointOffsetFn(point.x, point.y),
        initialKey = `${point.x},${point.y}`,
        minX = width,
        minY = height,
        maxX = 0,
        maxY = 0;
  
      queue.push(offset);
      seen.add(initialKey);
  
      let x, y, x2, y2, pointKey, i;
      while (queue.length > 0) {
        offset = queue.shift();
        x = (offset / 4) % width;
        y = Math.floor(offset / (4 * width));
  
        if (!FloodFill.withinTolerance(imageData, offset, target, tolerance)) {
          continue;
        }
  
        for (i = 0; i < 4; i++) {
          imageData[offset + i] = color[i];
        }
  
        // Update the bounding box of the filled area
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
  
        for (i = 0; i < directions.length; i++) {
          x2 = x + directions[i][0];
          y2 = y + directions[i][1];
          pointKey = `${x2},${y2}`;
  
          if (x2 >= 0 && y2 >= 0 && x2 < width && y2 < height && !seen.has(pointKey)) {
            queue.push(getPointOffsetFn(x2, y2));
            seen.add(pointKey);
          }
        }
      }
  
      return { minX, minY, maxX, maxY };
    },
  };
  
  let fcanvas;
  let fillColor = "#f00";
  let fillTolerance = 2;
  
  export function fill(canvas, color, tolerance) {
    fcanvas = canvas;
    fillColor = color;
    fillTolerance = tolerance;
  }
  
  function hexToRgb(hex, opacity) {
    opacity = Math.round(opacity * 255) || 255;
    hex = hex.replace("#", "");
    const rgb = [],
      re = new RegExp("(.{" + hex.length / 3 + "})", "g");
    hex.match(re).map(function (l) {
      rgb.push(parseInt(hex.length % 2 ? l + l : l, 16));
    });
    return rgb.concat(opacity);
  }
  
  export function toggleFloodFill(enable) {
    if (!fcanvas) return;
    
    if (!enable) {
      fcanvas.off("mouse:down");
      fcanvas.selection = true;
      fcanvas.forEachObject(function (object) {
        object.selectable = true;
      });
      return;
    }
  
    fcanvas.discardActiveObject();
    fcanvas.renderAll();
    fcanvas.selection = false;
    fcanvas.forEachObject(function (object) {
      object.selectable = false;
    });
  
    fcanvas.on({
      "mouse:down": function (e) {
        const mouse = fcanvas.getPointer(e.e);
        
        // 檢查點擊的是否為物件
        const target = fcanvas.findTarget(e.e);
        
        if (target) {
          // 如果點擊的是物件，直接修改物件的填充顏色
          const originalFill = target.fill;
          const parsedColor = hexToRgb(fillColor);
          
          // 檢查顏色是否相似
          if (originalFill && typeof originalFill === 'string' && originalFill.startsWith('#')) {
            const originalRgb = hexToRgb(originalFill);
            if (FloodFill.withinTolerance(originalRgb, 0, parsedColor, fillTolerance)) {
              console.log("忽略... 相同顏色");
              return;
            }
          }
          
          // 保存原始顏色以便撤銷
          target._originalFill = originalFill;
          
          // 設置新的填充顏色
          target.set('fill', fillColor);
          fcanvas.renderAll();
          
          // 如果有歷史管理器，保存狀態
          if (fcanvas.historyManager) {
            setTimeout(() => {
              fcanvas.historyManager.saveState();
            }, 0);
          }
          
          return;
        }
        
        // 如果不是點擊物件，則使用像素填充
        const mouseX = Math.round(mouse.x * 2);
        const mouseY = Math.round(mouse.y * 2);
        const canvas = fcanvas.lowerCanvasEl;
        const context = canvas.getContext("2d");
        const parsedColor = hexToRgb(fillColor);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const getPointOffset = function (x, y) {
          return 4 * (y * imageData.width + x);
        };
        const targetOffset = getPointOffset(mouseX, mouseY);
        const targetColor = imageData.data.slice(targetOffset, targetOffset + 4);
  
        if (FloodFill.withinTolerance(targetColor, 0, parsedColor, fillTolerance)) {
          // 嘗試填充已經是填充顏色的東西
          console.log("忽略... 相同顏色");
          return;
        }
  
        // 執行填充
        const bounds = FloodFill.fill(
          imageData.data,
          getPointOffset,
          { x: mouseX, y: mouseY },
          parsedColor,
          targetColor,
          fillTolerance,
          imageData.width,
          imageData.height
        );
  
        // 創建一個新的畫布來提取填充區域
        const filledWidth = bounds.maxX - bounds.minX + 1;
        const filledHeight = bounds.maxY - bounds.minY + 1;
  
        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = filledWidth;
        tmpCanvas.height = filledHeight;
  
        const tmpCtx = tmpCanvas.getContext("2d");
        const filledImageData = tmpCtx.createImageData(filledWidth, filledHeight);
  
        for (let y = bounds.minY; y <= bounds.maxY; y++) {
          for (let x = bounds.minX; x <= bounds.maxX; x++) {
            const srcOffset = getPointOffset(x, y);
            const dstOffset = 4 * ((y - bounds.minY) * filledWidth + (x - bounds.minX));
  
            for (let i = 0; i < 4; i++) {
              filledImageData.data[dstOffset + i] = imageData.data[srcOffset + i];
            }
          }
        }
  
        tmpCtx.putImageData(filledImageData, 0, 0);
  
        const newImage = new fabric.Image(tmpCanvas, {
          left: bounds.minX / 2,
          top: bounds.minY / 2,
          scaleX: 0.5,
          scaleY: 0.5,
          selectable: false,
        });
  
        fcanvas.add(newImage);
        fcanvas.renderAll();
  
        // 如果有歷史管理器，保存狀態
        if (fcanvas.historyManager) {
          setTimeout(() => {
            fcanvas.historyManager.saveState();
          }, 0);
        }
      },
    });
  }