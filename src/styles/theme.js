import { createTheme } from "@mui/material";

const theme = createTheme({
	palette: {
		primary: {
			main: "#EB8797", // 粉紅色
			light: "#fad9d8", // 淺粉紅色 
			dark: "#e5b8b7", // 深粉紅色
			contrastText: "#333333", // 深灰色
		},
		secondary: {
			main: "#5c5c5c", // 中灰色
			light: "#7e7e7e", // 淺灰色 
			dark: "#474747", // 深灰色 
			contrastText: "#ffffff", // 純白色
		},
		background: {
			default: "#fffff3", // 米白色
			paper: "#f5f5e9", // 淺米色
			toolbar: "#5c5c5c", // 中灰色 
			canvas: "#fffff3", // 米白色
			chat: "#f5f5e9", // 淺米色 
		},
		text: {
			primary: "#333333", // 深灰色 
			secondary: "#5c5c5c", // 中灰色
			toolbar: "#ebebeb", // 淺灰色
		},
		divider: "rgba(92, 92, 92, 0.15)", // 透明灰色
		action: {
			hover: "rgba(247, 202, 201, 0.08)", // 非常透明的粉紅色 
			selected: "rgba(247, 202, 201, 0.12)", // 稍微透明的粉紅色 
		},
	},
	shape: {
		borderRadius: 10,
	}
});

// fabric.js 物件控制樣式
export const fabricObjectControls = {
	transparentCorners: false,
	cornerStyle: "circle",
	cornerColor: "#f7cac9", // 淺粉紅色 (Light Pink)
	cornerSize: 8,
	padding: 10,
	borderColor: "#f7cac9", // 淺粉紅色 (Light Pink)
	cornerStrokeColor: "#5c5c5c", // 中灰色 (Medium Gray)
	hasControls: true,
	hasBorders: true,
	selectable: true,
};

export default theme;
