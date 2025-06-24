import React, { useEffect, useRef, useState } from 'react';
import * as fabric from "fabric";
import { fill, toggleFloodFill } from '../../utils/FloodFill';
import { Box, Button, Slider, Stack, Typography } from '@mui/material';

const FabricFloodFillDemo = () => {
    const canvasRef = useRef(null);
    const [fillEnabled, setFillEnabled] = useState(false);
    const [fillColor, setFillColor] = useState('#ff0000');
    const [tolerance, setTolerance] = useState(2);

    useEffect(() => {
        // 初始化 Fabric.js 畫布
        canvasRef.current = new fabric.Canvas('canvas', {
            width: 600,
            height: 400,
            backgroundColor: '#ffffff'
        });

        // 建立一些示範圖形
        const rect1 = new fabric.Rect({
            left: 100,
            top: 100,
            fill: '#0000ff',
            width: 100,
            height: 100
        });

        const circle = new fabric.Circle({
            left: 250,
            top: 150,
            fill: '#00ff00',
            radius: 50
        });

        const rect2 = new fabric.Rect({
            left: 400,
            top: 100,
            fill: '#ffff00',
            width: 150,
            height: 150
        });

        canvasRef.current.add(rect1, circle, rect2);
        canvasRef.current.renderAll();

        // 初始化填充工具
        fill(canvasRef.current, fillColor, tolerance);

        // 清理函數
        return () => {
            if (canvasRef.current) {
                canvasRef.current.dispose();
            }
        };
    }, []);

    // 當填充顏色改變時更新
    useEffect(() => {
        if (canvasRef.current) {
            fill(canvasRef.current, fillColor, tolerance);
        }
    }, [fillColor, tolerance]);

    const handleToggleFill = () => {
        const newFillEnabled = !fillEnabled;
        setFillEnabled(newFillEnabled);
        toggleFloodFill(newFillEnabled);
    };

    const handleToleranceChange = (_event, newValue) => {
        setTolerance(newValue);
        if (canvasRef.current) {
            fill(canvasRef.current, fillColor, newValue);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                填充工具示範
            </Typography>
            
            <Stack spacing={2} direction="row" sx={{ mb: 3 }} alignItems="center">
                <Button 
                    variant="contained" 
                    onClick={handleToggleFill}
                    color={fillEnabled ? "error" : "primary"}
                >
                    {fillEnabled ? '停用填充工具' : '啟用填充工具'}
                </Button>
                
                <input
                    type="color"
                    value={fillColor}
                    onChange={(e) => setFillColor(e.target.value)}
                    style={{
                        padding: '5px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                    }}
                />
                
                <Box sx={{ width: 200 }}>
                    <Typography gutterBottom>
                        容許誤差：{tolerance}
                    </Typography>
                    <Slider
                        value={tolerance}
                        onChange={handleToleranceChange}
                        min={0}
                        max={10}
                        step={1}
                        marks
                        valueLabelDisplay="auto"
                    />
                </Box>
            </Stack>

            <Box sx={{ border: '1px solid #ddd', display: 'inline-block' }}>
                <canvas id="canvas" />
            </Box>
        </Box>
    );
};

export default FabricFloodFillDemo;