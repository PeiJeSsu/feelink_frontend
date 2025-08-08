import React, { useState } from "react";
import PropTypes from "prop-types";
import {
    Box,
    Slider,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
} from "@mui/material";
import ColorPicker from "../color/ColorPicker";

const BrushSettings = ({ brushSettings, onBrushSettingsChange }) => {
    const [showShadowSettings, setShowShadowSettings] = useState(
        Boolean(brushSettings.shadow)
    );

    const handleSizeChange = (event, newValue) => {
        onBrushSettingsChange({ ...brushSettings, size: newValue });
    };

    const handleOpacityChange = (event, newValue) => {
        onBrushSettingsChange({ ...brushSettings, opacity: newValue });
    };

    const basicBrushTypes = [
        { value: "PencilBrush", label: "鉛筆" },
        { value: "CircleBrush", label: "圓點" },
        { value: "SprayBrush", label: "噴霧" },
        { value: "PatternStyle", label: "樣式筆刷" },
        { value: "CustomStyle", label: "自訂筆刷" },
    ];

    const customBrushTypes = [
        { value: "MarkerBrush", label: "麥克筆" },
        { value: "ShadedBrush", label: "陰影筆刷" },
        { value: "RibbonBrush", label: "緞帶筆刷" },
        { value: "LongfurBrush", label: "長毛筆刷" },
        { value: "InkBrush", label: "墨水筆刷" },
        { value: "FurBrush", label: "毛筆" },
        { value: "CrayonBrush", label: "蠟筆" },
        { value: "SketchyBrush", label: "素描筆" },
        { value: "WebBrush", label: "網狀筆刷" },
        { value: "SquaresBrush", label: "方塊筆刷" },
        { value: "SpraypaintBrush", label: "噴漆筆刷" },
    ];

    const patternStyles = [
        { value: "PatternBrush", label: "棋盤" },
        { value: "VLineBrush", label: "垂直線" },
        { value: "HLineBrush", label: "水平線" },
        { value: "SquareBrush", label: "方塊" },
        { value: "DiamondBrush", label: "菱形" },
    ];

    const handleBrushTypeChange = (event) => {
        const newType = event.target.value;
        if (newType === "PatternStyle") {
            onBrushSettingsChange({ ...brushSettings, type: patternStyles[0].value });
        } else if (newType === "CustomStyle") {
            onBrushSettingsChange({ ...brushSettings, type: customBrushTypes[0].value });
        } else {
            onBrushSettingsChange({ ...brushSettings, type: newType });
        }
    };

    const handleColorChange = (event) => {
        onBrushSettingsChange({ ...brushSettings, color: event.target.value });
    };

    const handleShadowToggle = (event) => {
        const checked = event.target.checked;
        setShowShadowSettings(checked);

        if (checked) {
            const shadowSettings = {
                blur: 5,
                offsetX: 0,
                offsetY: 0,
                color: "#000000",
            };
            onBrushSettingsChange({ ...brushSettings, shadow: shadowSettings });
        } else {
            const newSettings = { ...brushSettings };
            delete newSettings.shadow;
            onBrushSettingsChange(newSettings);
        }
    };

    const handleShadowChange = (property, value) => {
        onBrushSettingsChange({
            ...brushSettings,
            shadow: {
                ...brushSettings.shadow,
                [property]: value,
            },
        });
    };

    return (
        <>
            <FormControl fullWidth margin="normal">
                <InputLabel id="brush-type-label">畫筆類型</InputLabel>
                <Select
                    labelId="brush-type-label"
                    id="brush-type-select"
                    value={(() => {
                        if (
                            patternStyles.some(
                                (p) => p.value === brushSettings.type
                            )
                        ) {
                            return "PatternStyle";
                        }
                        if (
                            customBrushTypes.some(
                                (c) => c.value === brushSettings.type
                            )
                        ) {
                            return "CustomStyle";
                        }
                        return brushSettings.type;
                    })()}
                    label="畫筆類型"
                    onChange={handleBrushTypeChange}
                >
                    {basicBrushTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                            {type.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl
                margin="normal"
                sx={{
                    display:
                        brushSettings.type === "PatternStyle" ||
                        patternStyles.some(
                            (p) => p.value === brushSettings.type
                        )
                            ? "block"
                            : "none",
                }}
            >
                <InputLabel id="pattern-style-label">樣式選擇</InputLabel>
                <Select
                    fullWidth
                    labelId="pattern-style-label"
                    id="pattern-style-select"
                    value={
                        patternStyles.some(
                            (p) => p.value === brushSettings.type
                        )
                            ? brushSettings.type
                            : ""
                    }
                    label="樣式選擇"
                    onChange={handleBrushTypeChange}
                >
                    {patternStyles.map((style) => (
                        <MenuItem key={style.value} value={style.value}>
                            {style.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl
                margin="normal"
                sx={{
                    display:
                        brushSettings.type === "CustomStyle" ||
                        customBrushTypes.some(
                            (c) => c.value === brushSettings.type
                        )
                            ? "block"
                            : "none",
                }}
            >
                <InputLabel id="custom-style-label">自訂筆刷</InputLabel>
                <Select
                    fullWidth
                    labelId="custom-style-label"
                    id="custom-style-select"
                    value={
                        customBrushTypes.some(
                            (c) => c.value === brushSettings.type
                        )
                            ? brushSettings.type
                            : ""
                    }
                    label="自訂筆刷"
                    onChange={handleBrushTypeChange}
                >
                    {customBrushTypes.map((style) => (
                        <MenuItem key={style.value} value={style.value}>
                            {style.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <ColorPicker
                label="顏色"
                value={brushSettings.color}
                onChange={handleColorChange}
            />

            <Typography gutterBottom sx={{ mt: 2 }}>
                筆刷粗細
            </Typography>
            <Slider
                value={brushSettings.size}
                onChange={handleSizeChange}
                aria-labelledby="brush-size-slider"
                min={1}
                max={50}
                valueLabelDisplay="auto"
            />

            <Typography gutterBottom>透明度</Typography>
            <Slider
                value={brushSettings.opacity}
                onChange={handleOpacityChange}
                aria-labelledby="brush-opacity-slider"
                min={0.1}
                max={1}
                step={0.1}
                valueLabelDisplay="auto"
            />

            <FormControlLabel
                control={
                    <Switch
                        checked={showShadowSettings}
                        onChange={handleShadowToggle}
                    />
                }
                label="啟用陰影"
                sx={{ mt: 2 }}
            />

            {showShadowSettings && (
                <Box sx={{ mt: 1 }}>
                    <Typography gutterBottom>陰影模糊</Typography>
                    <Slider
                        value={brushSettings.shadow?.blur || 0}
                        onChange={(e, val) => handleShadowChange("blur", val)}
                        min={0}
                        max={50}
                        valueLabelDisplay="auto"
                    />

                    <Typography gutterBottom>陰影顏色</Typography>
                    <ColorPicker
                        value={brushSettings.shadow?.color || "#000000"}
                        onChange={(e) =>
                            handleShadowChange("color", e.target.value)
                        }
                        sx={{ mb: 2, mt: 0 }}
                    />

                    <Typography gutterBottom>水平偏移</Typography>
                    <Slider
                        value={brushSettings.shadow?.offsetX || 0}
                        onChange={(e, val) =>
                            handleShadowChange("offsetX", val)
                        }
                        min={-50}
                        max={50}
                        valueLabelDisplay="auto"
                    />

                    <Typography gutterBottom sx={{ mt: 2 }}>
                        垂直偏移
                    </Typography>
                    <Slider
                        value={brushSettings.shadow?.offsetY || 0}
                        onChange={(e, val) =>
                            handleShadowChange("offsetY", val)
                        }
                        min={-50}
                        max={50}
                        valueLabelDisplay="auto"
                    />
                </Box>
            )}
        </>
    );
};

BrushSettings.propTypes = {
    brushSettings: PropTypes.object.isRequired,
    onBrushSettingsChange: PropTypes.func.isRequired,
};

export default BrushSettings;
