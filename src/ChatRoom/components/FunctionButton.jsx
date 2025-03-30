import * as React from "react";
import Button from "@mui/material/Button";
import { functionButtonStyles } from "../styles/FunctionButtonStyles";

export default function FunctionButton({ onClick, disabled, icon, sx = {} }) {
	return (
		<Button
			variant="outlined"
			onClick={onClick}
			disabled={disabled}
			sx={functionButtonStyles.button(sx)}
		>
			{icon}
		</Button>
	);
}