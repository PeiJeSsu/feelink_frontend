import PropTypes from "prop-types";
import { Box, Paper, Typography } from "@mui/material";
import LeftToolbarButtons from "./LeftToolbarButtons";
import BrushSettings from "../../brush/BrushSettings";
import ShapeSettings from "../../shape/ShapeSettings";
import EraserSettings from "../../eraser/EraserSettings";
import PaintBucketSettings from "../../paint-bucket/PaintBucketSettings";
import TextSettings from "../../text/TextSettings";
import SelectSettings from "../../select/SelectSettings";
import PanSettings from "../../pan/PanSettings";

const LeftToolbar = ({
	setActiveTool,
	activeTool,
	setBrushSettings,
	brushSettings,
	setShapeSettings,
	shapeSettings,
	setEraserSettings,
	eraserSettings,
	setPaintBucketSettings,
	paintBucketSettings,
	setTextSettings,
	textSettings,
	onClearCanvas,
	canvas,
}) => {
	const handleToolClick = (tool) => {
		setActiveTool(tool);
	};

	const renderSettingsPanel = () => {
		const settingsMap = {
			select: { title: "選擇工具設置", component: <SelectSettings canvas={canvas} /> },
			pencil: { title: "畫筆設置", component: <BrushSettings brushSettings={brushSettings} onBrushSettingsChange={setBrushSettings} /> },
			shape: { title: "圖形設置", component: <ShapeSettings shapeSettings={shapeSettings} onShapeSettingsChange={setShapeSettings} /> },
			eraser: { title: "橡皮擦設置", component: <EraserSettings eraserSettings={eraserSettings} onEraserSettingsChange={setEraserSettings} /> },
			paintBucket: { title: "填充工具設置", component: <PaintBucketSettings paintBucketSettings={paintBucketSettings} onPaintBucketSettingsChange={setPaintBucketSettings} /> },
			text: { title: "文字設置", component: <TextSettings textSettings={textSettings} onTextSettingsChange={setTextSettings} canvas={canvas} /> },
			pan: { title: "移動畫布設置", component: <PanSettings canvas={canvas} /> },
		};

		const settings = settingsMap[activeTool];
		if (!settings) return null;

		return (
			<Box
				sx={{
					width: "280px",
					height: "100%",
					backgroundColor: "#ffffff",
					borderRight: "1px solid #e2e8f0",
					padding: "20px",
					overflow: "auto",
					display: "flex",
					flexDirection: "column",
				}}
			>
				<Typography
					variant="h6"
					sx={{
						fontSize: "16px",
						fontWeight: 600,
						color: "#1e293b",
						marginBottom: "20px",
						borderBottom: "1px solid #e2e8f0",
						paddingBottom: "12px",
					}}
				>
					{settings.title}
				</Typography>
				<Box 
					sx={{
						"& .MuiFormControl-root": {
							marginBottom: "16px",
							"& .MuiInputLabel-root": {
								color: "#64748b",
								fontSize: "14px",
								fontWeight: 500,
							},
							"& .MuiOutlinedInput-root": {
								borderRadius: "12px",
								backgroundColor: "#f8fafc",
								"& fieldset": {
									borderColor: "#e2e8f0",
								},
								"&:hover fieldset": {
									borderColor: "#cbd5e1",
								},
								"&.Mui-focused fieldset": {
									borderColor: "#2563eb",
									borderWidth: "2px",
								},
							},
							"& .MuiSelect-select": {
								padding: "12px 14px",
							},
						},
						"& .MuiSlider-root": {
							color: "#2563eb",
							height: 6,
							"& .MuiSlider-track": {
								border: "none",
								borderRadius: "3px",
							},
							"& .MuiSlider-rail": {
								backgroundColor: "#e2e8f0",
								borderRadius: "3px",
							},
							"& .MuiSlider-thumb": {
								height: 20,
								width: 20,
								backgroundColor: "#ffffff",
								border: "2px solid #2563eb",
								boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
								"&:hover": {
									boxShadow: "0 4px 8px rgba(37, 99, 235, 0.3)",
								},
							},
							"& .MuiSlider-valueLabel": {
								backgroundColor: "#2563eb",
								borderRadius: "8px",
								padding: "4px 8px",
								fontSize: "12px",
								fontWeight: 500,
							},
						},
						"& .MuiTypography-root": {
							color: "#374151",
							fontSize: "14px",
							fontWeight: 500,
							marginBottom: "8px",
						},
						"& .MuiSwitch-root": {
							"& .MuiSwitch-switchBase": {
								"&.Mui-checked": {
									color: "#2563eb",
									"& + .MuiSwitch-track": {
										backgroundColor: "#2563eb",
									},
								},
							},
							"& .MuiSwitch-track": {
								backgroundColor: "#e2e8f0",
							},
						},
					}}
				>
					{settings.component}
				</Box>
			</Box>
		);
	};

	return (
		<Box sx={{ display: "flex", height: "100%" }}>
			<Paper
				sx={{
					width: 72,
					backgroundColor: "#ffffff",
					borderRight: "1px solid #d1d5db",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					paddingY: 3,
					gap: 1.5,
					boxShadow: "none",
				}}
			>
				<LeftToolbarButtons activeTool={activeTool} onToolClick={handleToolClick} />
			</Paper>
			
			{/* 設定面板 */}
			{renderSettingsPanel()}
		</Box>
	);
};

LeftToolbar.propTypes = {
	setActiveTool: PropTypes.func.isRequired,
	activeTool: PropTypes.string.isRequired,
	setBrushSettings: PropTypes.func.isRequired,
	brushSettings: PropTypes.object.isRequired,
	setShapeSettings: PropTypes.func.isRequired,
	shapeSettings: PropTypes.object.isRequired,
	setEraserSettings: PropTypes.func.isRequired,
	eraserSettings: PropTypes.object.isRequired,
	setPaintBucketSettings: PropTypes.func.isRequired,
	paintBucketSettings: PropTypes.object.isRequired,
	setTextSettings: PropTypes.func.isRequired,
	textSettings: PropTypes.object.isRequired,
	onClearCanvas: PropTypes.func.isRequired,
	canvas: PropTypes.object.isRequired,
};

export default LeftToolbar;
