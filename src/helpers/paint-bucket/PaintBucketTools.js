import * as fabric from 'fabric';
import { fill, toggleFloodFill } from '../../utils/FloodFill';

/**
 * 設置填充工具
 * @param {fabric.Canvas} canvas - Fabric.js 畫布實例
 * @param {Object} settings - 填充工具設置
 * @returns {Object} - 填充工具控制器
 */
export const setupPaintBucket = (canvas, settings) => {
  if (!canvas) return null;

  // 設置填充顏色和容差
  fill(canvas, settings.color, settings.tolerance);

  // 啟用填充工具
  toggleFloodFill(true);

  return {
    updateColor: (color) => {
      fill(canvas, color, settings.tolerance);
    },
    updateTolerance: (tolerance) => {
      fill(canvas, settings.color, tolerance);
    },
    disable: () => {
      toggleFloodFill(false);
    }
  };
};

/**
 * 禁用填充工具
 * @param {fabric.Canvas} canvas - Fabric.js 畫布實例
 */
export const disablePaintBucket = (canvas) => {
  if (!canvas) return;
  toggleFloodFill(false);
}; 