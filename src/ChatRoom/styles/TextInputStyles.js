export const containerStyle = {
	position: "relative",
	width: "100%",
	border: "1px solid rgba(92, 92, 92, 0.15)",
	borderRadius: "12px",
	padding: "12px",
	display: "flex",
	flexDirection: "column-reverse",
	gap: "12px",
	backgroundColor: "#fffff3",
	boxSizing: "border-box",
	minWidth: 0,
	overflow: "hidden",
};

export const buttonContainerStyle = {
	display: "flex",
	justifyContent: "space-between",
	gap: "8px",
	alignItems: "flex-end",
	flexWrap: "wrap",
	minWidth: 0,
	width: "100%",
};

export const textFieldStyle = {
	width: "100%",
	"& .MuiInput-root": {
		fontSize: "14px",
		color: "#333333",
		"&:before": {
			borderBottom: "1px solid rgba(92, 92, 92, 0.2)",
		},
		"&:hover:not(.Mui-disabled):before": {
			borderBottom: "1px solid rgba(247, 202, 201, 0.8)",
		},
		"&.Mui-focused:after": {
			borderBottom: "2px solid #f7cac9",
		},
	},
	"& .MuiInput-input::placeholder": {
		color: "#5c5c5c",
	},
};

// RWD for button group
export const buttonGroupResponsive = {
	"@media (max-width: 520px)": {
		display: "flex",
		flexDirection: "column",
		alignItems: "stretch",
		gap: "4px",
	},
};
