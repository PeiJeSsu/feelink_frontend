import { useState, useCallback, useRef, useEffect } from "react";
import { Box, IconButton } from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";
import { ResizableBox } from "react-resizable";
import LeftToolbar from "../toolbar/left-toolbar/LeftToolbar";
import TopToolbar from "../toolbar/top-toolbar/TopToolbar";
import Canvas from "../canvas/Canvas";
import ChatRoom from "../../ChatRoom/components/ChatRoom";
import "./Layout.css";

const Layout = () => {
	const [activeTool, setActiveTool] = useState("select");
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [chatWidth, setChatWidth] = useState(300);
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
		return () => {
			if (resizeTimeoutRef.current) {
				clearTimeout(resizeTimeoutRef.current);
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
		if (resizeTimeoutRef.current) {
			clearTimeout(resizeTimeoutRef.current);
		}

		// 使用 requestAnimationFrame 來平滑更新視覺效果
		requestAnimationFrame(() => {
			const chatContainer = document.querySelector(".chat-container");
			if (chatContainer) {
				chatContainer.style.width = `${size.width}px`;
			}
		});

		resizeTimeoutRef.current = setTimeout(() => {
			setChatWidth(size.width);
		}, 16);
	}, []);

	return (
		<Box className="layout-container">
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
			<TopToolbar
				onClearClick={handleClearCanvas}
				canvas={canvasRef.current}
				canvasReady={canvasReady}
				chatWidth={isChatOpen ? chatWidth : 0}
			/>
			<Canvas
				activeTool={activeTool}
				brushSettings={brushSettings}
				shapeSettings={shapeSettings}
				eraserSettings={eraserSettings}
				paintBucketSettings={paintBucketSettings}
				textSettings={textSettings}
				clearTrigger={clearTrigger}
				onCanvasInit={setCanvasInstance}
				chatWidth={isChatOpen ? chatWidth : 0}
				isChatOpen={isChatOpen}
			/>
			{isChatOpen && (
				<ResizableBox
					className={`chat-container open ${isResizing ? "resizing" : ""}`}
					width={chatWidth}
					height={Infinity}
					minConstraints={[265, Infinity]}
					maxConstraints={[550, Infinity]}
					axis="x"
					resizeHandles={["w"]}
					onResize={handleResize}
					onResizeStart={handleResizeStart}
					onResizeStop={handleResizeStop}
					draggableOpts={{
						enableUserSelectHack: false,
					}}
				>
					<ChatRoom canvas={canvasRef.current} onClose={() => setIsChatOpen(false)} />
				</ResizableBox>
			)}
			{!isChatOpen && (
				<IconButton
					className="chat-toggle-button"
					onClick={toggleChat}
					sx={{
						position: "fixed",
						right: "0",
						top: "50%",
						transform: "translateY(-50%)",
						backgroundColor: "white",
						"&:hover": {
							backgroundColor: "rgba(255, 255, 255, 0.8)",
						},
						zIndex: 1000,
					}}
				>
					<ChevronLeft />
				</IconButton>
			)}
		</Box>
	);
};

export default Layout;
