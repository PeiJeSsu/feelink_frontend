import { useState, useCallback, useRef } from "react";
import { Box, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { ResizableBox } from 'react-resizable';
import LeftToolbar from "../toolbar/left-toolbar/LeftToolbar";
import TopToolbar from "../toolbar/top-toolbar/TopToolbar";
import Canvas from "../canvas/Canvas";
import ChatRoom from "../../ChatRoom/components/ChatRoom";
import "./Layout.css";

const Layout = () => {
	const [activeTool, setActiveTool] = useState("select");
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [chatWidth, setChatWidth] = useState(300); 
	const [brushSettings, setBrushSettings] = useState({
		size: 5,
		opacity: 1,
		color: "#000000",
		type: "PencilBrush",
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
		fontFamily: "Arial",
		fontSize: 24,
		fill: "#000000"
	});

	const [clearTrigger, setClearTrigger] = useState(0);

	const canvasRef = useRef(null);

	const [canvasReady, setCanvasReady] = useState(false);

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

	const handleResize = (e, { size }) => {
		setChatWidth(size.width);
	};

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
			/>
			<TopToolbar onClearClick={handleClearCanvas} canvas={canvasRef.current} canvasReady={canvasReady} />
			<Canvas
				activeTool={activeTool}
				brushSettings={brushSettings}
				shapeSettings={shapeSettings}
				eraserSettings={eraserSettings}
				paintBucketSettings={paintBucketSettings}
				textSettings={textSettings}
				clearTrigger={clearTrigger}
				onCanvasInit={setCanvasInstance}
			/>
			{isChatOpen && (
				<ResizableBox 
					className="chat-container open"
					width={chatWidth}
					height={Infinity}
					minConstraints={[250, Infinity]}
					maxConstraints={[600, Infinity]}
					axis="x"
					resizeHandles={['w']}
					onResize={handleResize}
				>
					<ChatRoom canvas={canvasRef.current} />
				</ResizableBox>
			)}
			<IconButton
				className={`chat-toggle-button ${isChatOpen ? 'open' : ''}`}
				onClick={toggleChat}
				sx={{
					position: 'fixed',
					right: isChatOpen ? `${chatWidth}px` : '0',
					top: '50%',
					transform: 'translateY(-50%)',
					backgroundColor: 'white',
					'&:hover': {
						backgroundColor: 'rgba(255, 255, 255, 0.8)',
					},
					zIndex: 1000,
					transition: 'right 0.3s ease',
				}}
			>
				{isChatOpen ? <ChevronRight /> : <ChevronLeft />}
			</IconButton>
		</Box>
	);
};

export default Layout;
