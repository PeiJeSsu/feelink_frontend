/**
 * fabric.brushes - A collection of brushes for fabric.js (version 4 and up).
 *
 * Made by Arjan Haverkamp, https://www.webgear.nl
 * Copyright 2021 Arjan Haverkamp
 * MIT Licensed
 * @version 1.0 - 2021-06-02
 * @url https://github.com/av01d/fabric-brushes
 *
 * Inspiration sources:
 * - https://github.com/tennisonchan/fabric-brush
 * - https://mrdoob.com/projects/harmony/
 * - http://perfectionkills.com/exploring-canvas-drawing-techniques/
 */

export const colorValues = (color) => {
    const tempElement = document.createElement('div');
    tempElement.style.color = color;
    document.body.appendChild(tempElement);
    const computedColor = window.getComputedStyle(tempElement).color;
    document.body.removeChild(tempElement);
    return computedColor.match(/\d+/g).map(Number);
};

export const convertToImg = (canvas) => {
    return new Promise((resolve) => {
        const img = new fabric.Image(canvas.upperCanvasEl);
        resolve(img);
    });
};

export const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const calculateControlPoint = (current, previous, next, reverse) => {
    const smoothing = 0.2;
    const c = (next - previous) * smoothing;
    const x = current + (reverse ? -c : c);
    return x;
};
