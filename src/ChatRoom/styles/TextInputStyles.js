export const containerStyle = {
	display: "flex",
	flexDirection: "column",
	gap: "12px",
	width: "100%",
	minWidth: 0, // 確保可以縮小
	boxSizing: "border-box",
};

export const inputContainer = {
	display: "flex",
	gap: "8px",
	alignItems: "flex-end",
	minWidth: 0, // 確保可以縮小
	width: "100%",
};

export const textFieldStyle = {
	flex: 1,
	"& .MuiOutlinedInput-root": {
		borderRadius: "12px",
		fontSize: "14px",
		backgroundColor: "#f8fafc",
		"& fieldset": {
			borderColor: "#e5e7eb",
		},
		"&:hover fieldset": {
			borderColor: "#2563eb",
		},
		"&.Mui-focused fieldset": {
			borderColor: "#2563eb",
		},
	},
	"& .MuiOutlinedInput-input::placeholder": {
		color: "#9ca3af",
	},
};

export const sendButtonStyle = {
	backgroundColor: "#2563eb",
	color: "#ffffff",
	width: 40,
	height: 40,
	minWidth: 40, // 防止按鈕被擠壓
	borderRadius: "12px",
	flexShrink: 0, // 防止縮小
	"&:hover": {
		backgroundColor: "#1d4ed8",
	},
	"&:disabled": {
		backgroundColor: "#e5e7eb",
		color: "#9ca3af",
	},
};

export const quickActionButton = {
	borderColor: "#e2e8f0",
	color: "#64748b",
	fontSize: "12px",
	borderRadius: "20px",
	textTransform: "none",
	"&:hover": {
		borderColor: "#2563eb",
		backgroundColor: "#f1f5f9",
		color: "#2563eb",
	},
	"&:disabled": {
		borderColor: "#e5e7eb",
		color: "#9ca3af",
		backgroundColor: "transparent",
	},
};
