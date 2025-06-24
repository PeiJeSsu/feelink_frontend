import * as fabric from "fabric";
import { Alert, Snackbar, IconButton } from "@mui/material";
import { createRoot } from 'react-dom/client';
import CloseIcon from '@mui/icons-material/Close';

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
      ];
      
      const points = [{ x: point.x, y: point.y }];
      const queue = [];
      const seen = new Set();
      const offset = getPointOffsetFn(point.x, point.y);
      const initialKey = `${point.x},${point.y}`;
      let minX = width;
      let minY = height;
      let maxX = 0;
      let maxY = 0;

      queue.push(offset);
      seen.add(initialKey);

      // 創建一個新的數據陣列來存儲修改後的像素
      const newData = new Uint8ClampedArray(imageData.length);
      newData.set(imageData);

      let x, y, x2, y2, pointKey, i;
      while (queue.length > 0) {
        const currentOffset = queue.shift();
        x = (currentOffset / 4) % width;
        y = Math.floor(currentOffset / (4 * width));

        if (!FloodFill.withinTolerance(newData, currentOffset, target, tolerance)) {
          continue;
        }

        for (i = 0; i < 4; i++) {
          newData[currentOffset + i] = color[i];
        }

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

      return {
        minX,
        minY,
        maxX,
        maxY,
        data: newData
      };
    }
  };

  let fcanvas;
  let fillColor = "#f00";
  let fillTolerance = 2;
  let alertRoot = null;
  let alertContainer = null;
  let timeoutId = null;

  function showAlert() {
    // 如果已經有顯示的 alert，先清除定時器
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  
    // 如果容器不存在，創建新容器和 root
    if (!alertContainer) {
      alertContainer = document.createElement('div');
      document.body.appendChild(alertContainer);
      alertRoot = createRoot(alertContainer);
    }
  
    const handleClose = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
      // 手動關閉時清理資源
      if (alertContainer && document.body.contains(alertContainer)) {
        alertRoot.unmount();
        document.body.removeChild(alertContainer);
        alertContainer = null;
        alertRoot = null;
      }
    };
  
    // 渲染 Alert
    alertRoot.render(
      <Snackbar 
        open={true} 
        autoHideDuration={3000} 
        onClose={handleClose}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Alert severity="error" onClose={handleClose}>
          請針對封閉區域填充，不可直接填充空白畫布
        </Alert>
      </Snackbar>
    );
  
    // 設置定時器在 3 秒後清除容器
    timeoutId = setTimeout(() => {
      if (alertContainer && document.body.contains(alertContainer)) {
        alertRoot.unmount();
        document.body.removeChild(alertContainer);
        alertContainer = null;
        alertRoot = null;
      }
    }, 3000);
  }

  export function fill(canvas, color, tolerance) {
    fcanvas = canvas;
    fillColor = color;
    fillTolerance = tolerance;
  }

  function hexToRgb(hex, opacity) {
    opacity = Math.round(opacity * 255) || 255;
    hex = hex.replace("#", "");
    const rgb = [];
    const re = new RegExp("(.{" + hex.length / 3 + "})", "g");
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
        
        const target = fcanvas.findTarget(e.e);
        
        if (target) {
          const originalFill = target.fill;
          const parsedColor = hexToRgb(fillColor);
          
          if (originalFill && typeof originalFill === 'string' && originalFill.startsWith('#')) {
            const originalRgb = hexToRgb(originalFill);
            if (FloodFill.withinTolerance(originalRgb, 0, parsedColor, fillTolerance)) {
              console.log("忽略... 相同顏色");
              return;
            }
          }
          
          target._originalFill = originalFill;
          target.set('fill', fillColor);
          fcanvas.renderAll();
          
          if (fcanvas.historyManager) {
            setTimeout(() => {
              fcanvas.historyManager.saveState();
            }, 0);
          }
          
          return;
        } else {
          // 點擊空白處時顯示錯誤提示，並禁止填充行為
          showAlert();
          return; // 直接返回，不執行填充
        }
      },
    });
  }