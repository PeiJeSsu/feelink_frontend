import { useState, useCallback, useRef, useEffect } from "react";
import { Box, TextField, Typography, Button } from "@mui/material";
import { ResizableBox } from "react-resizable";
import LeftToolbar from "../toolbar/left-toolbar/LeftToolbar";
import TopToolbar from "../toolbar/top-toolbar/TopToolbar";
import Canvas from "../canvas/Canvas";
import ChatRoom from "../../ChatRoom/components/ChatRoom";
import UserProfileMenu from "../auth/UserProfileMenu";
import { layoutStyles } from "../../styles/layoutStyles";
import "./Layout.css";

const Layout = () => {
	const [activeTool, setActiveTool] = useState("select");
	const [isChatOpen, setIsChatOpen] = useState(true);
	const [chatWidth, setChatWidth] = useState(350);
	const [isResizing, setIsResizing] = useState(false);
	const resizeTimeoutRef = useRef(null);
	const [brushSettings, setBrushSettings] = useState({
		type: "PencilBrush",
		size: 5,
		opacity: 1,
		color: "#000000",
	});

	const [shapeSettings, setShapeSettings] = useState({
		type: "RECT",
		color: "#000000",
		stroke: "#000000",
		strokeWidth: 2,
		fill: "transparent",
		opacity: 1,
		showStroke: true,
	});

	const [eraserSettings, setEraserSettings] = useState({
		size: 20,
		type: "path",
	});

	const [paintBucketSettings, setPaintBucketSettings] = useState({
		color: "#000000",
		tolerance: 2,
	});

	const [textSettings, setTextSettings] = useState({
		fontFamily: '"Noto Sans TC", sans-serif',
		fontSize: 24,
		fill: "#000000",
		fontWeight: "400",
	});

	const [clearTrigger, setClearTrigger] = useState(0);

	const canvasRef = useRef(null);

	const [canvasReady, setCanvasReady] = useState(false);

	useEffect(() => {
		const currentTimeout = resizeTimeoutRef.current;
		return () => {
			if (currentTimeout) {
				clearTimeout(currentTimeout);
			}
		};
	}, []);

	useEffect(() => {
		if (!canvasReady || !canvasRef.current) return;
		const canvas = canvasRef.current;
		function handleSelection() {
			const activeObject = canvas.getActiveObject?.();
			if (activeObject && activeObject.type === "textbox") {
				setTextSettings({
					fontFamily: activeObject.fontFamily || '"Noto Sans TC", sans-serif',
					fontSize: activeObject.fontSize || 24,
					fill: activeObject.fill || "#000000",
					fontWeight: activeObject.fontWeight || "400",
				});
			}
		}
		canvas.on("selection:created", handleSelection);
		canvas.on("selection:updated", handleSelection);
		return () => {
			canvas.off("selection:created", handleSelection);
			canvas.off("selection:updated", handleSelection);
		};
	}, [canvasReady]);

	const handleClearCanvas = useCallback(() => {
		setClearTrigger((prev) => prev + 1);
	}, []);

	const setCanvasInstance = useCallback((canvas) => {
		canvasRef.current = canvas;
		setCanvasReady(true);
	}, []);

	const toggleChat = () => {
		setIsChatOpen(!isChatOpen);
	};

	const handleResizeStart = useCallback(() => {
		setIsResizing(true);
		document.body.style.cursor = "col-resize";
	}, []);

	const handleResizeStop = useCallback(() => {
		setIsResizing(false);
		document.body.style.cursor = "";
	}, []);

	const handleResize = useCallback((e, { size }) => {
		// 立即更新寬度狀態，避免延遲
		setChatWidth(size.width);
	}, []);

	return (
		<Box sx={layoutStyles.layoutContainer}>
			{/* 現代化頂部導航欄 */}
			<Box sx={layoutStyles.topToolbarContainer}>
				{/* 左側：Logo 和主要功能 */}
				<Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
					{/* Logo */}
					<Typography
						variant="h5"
						sx={{
							fontWeight: 700,
							color: "#1e293b",
							fontFamily: '"Inter", "Noto Sans TC", sans-serif',
						}}
					>
						FeelInk
					</Typography>

					{/* 主要功能按鈕組 - TopToolbar */}
					<TopToolbar
						onClearClick={handleClearCanvas}
						canvas={canvasRef.current}
						canvasReady={canvasReady}
						chatWidth={0}
					/>
				</Box>

				{/* 中央：畫布名稱 */}
				<Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
					<TextField
						variant="outlined"
						size="small"
						placeholder="未命名畫布"
						sx={{
							"& .MuiOutlinedInput-root": {
								fontSize: "16px",
								fontWeight: 500,
								textAlign: "center",
								borderRadius: "8px",
								backgroundColor: "transparent",
								"& fieldset": {
									border: "none",
								},
								"&:hover fieldset": {
									border: "1px solid #e2e8f0",
								},
								"&.Mui-focused fieldset": {
									border: "1px solid #2563eb",
								},
								"& input": {
									textAlign: "center",
									color: "#1e293b",
									fontFamily: '"Inter", "Noto Sans TC", sans-serif',
								},
							},
						}}
					/>
				</Box>

				{/* 右側：使用者功能 */}
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					{/* 聊天室切換按鈕 */}
					<Button
						onClick={toggleChat}
						variant={isChatOpen ? "text" : "outlined"}
						sx={{
							color: isChatOpen ? "#2563eb" : "#64748b",
							backgroundColor: isChatOpen ? "#f1f5f9" : "transparent",
							border: isChatOpen ? "1px solid #2563eb" : "1px solid #d1d5db",
							fontSize: "14px",
							fontWeight: isChatOpen ? 500 : 600,
							padding: "6px 12px",
							borderRadius: "8px",
							textTransform: "none",
							fontFamily: '"Inter", "Noto Sans TC", sans-serif',
							"&:hover": {
								backgroundColor: isChatOpen ? "#f1f5f9" : "#f9fafb",
								color: "#2563eb",
								border: isChatOpen ? "none" : "1px solid #2563eb",
							},
						}}
					>
						{isChatOpen ? "關閉聊天室" : "開啟聊天室"}
					</Button>
					<UserProfileMenu />
				</Box>
			</Box>

			{/* 主要內容區域 */}
			<Box sx={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
				{/* 左側工具欄 */}
				<LeftToolbar
					setActiveTool={setActiveTool}
					activeTool={activeTool}
					setBrushSettings={setBrushSettings}
					brushSettings={brushSettings}
					setShapeSettings={setShapeSettings}
					shapeSettings={shapeSettings}
					setEraserSettings={setEraserSettings}
					eraserSettings={eraserSettings}
					setPaintBucketSettings={setPaintBucketSettings}
					paintBucketSettings={paintBucketSettings}
					setTextSettings={setTextSettings}
					textSettings={textSettings}
					onClearCanvas={handleClearCanvas}
					canvas={canvasRef.current}
				/>

				{/* 畫布區域 */}
				<Box sx={{ 
					flex: 1, 
					display: "flex", 
					flexDirection: "column",
					backgroundColor: "#f8fafc",
					padding: "16px",
					paddingBottom: "16px",
					minWidth: 0, // 確保可以縮小
					transition: "all 0.3s ease-in-out",
				}}>
					<Box sx={{
						flex: 1,
						backgroundColor: "#ffffff",
						borderRadius: "12px",
						border: "1px solid #e5e7eb",
						overflow: "hidden",
						boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
					}}>
						<Canvas
							activeTool={activeTool}
							brushSettings={brushSettings}
							shapeSettings={shapeSettings}
							eraserSettings={eraserSettings}
							paintBucketSettings={paintBucketSettings}
							textSettings={textSettings}
							clearTrigger={clearTrigger}
							onCanvasInit={setCanvasInstance}
							chatWidth={chatWidth}
							isChatOpen={isChatOpen}
						/>
					</Box>
				</Box>

				{/* 聊天面板 - 修正佈局 */}
				{isChatOpen && (
					<ResizableBox
						className={`chat-container ${isResizing ? "resizing" : ""}`}
						width={chatWidth}
						height={Infinity}
						minConstraints={[350, Infinity]}
						maxConstraints={[550, Infinity]}
						axis="x"
						resizeHandles={["w"]}
						onResize={handleResize}
						onResizeStart={handleResizeStart}
						onResizeStop={handleResizeStop}
						style={{
							flexShrink: 0,
							height: "100%",
						}}
						draggableOpts={{
							enableUserSelectHack: false,
						}}
					>
						<ChatRoom canvas={canvasRef.current} onClose={toggleChat} />
					</ResizableBox>
				)}
			</Box>
		</Box>
	);
};

export default Layout;
