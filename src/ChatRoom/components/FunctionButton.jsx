import Button from "@mui/material/Button";
import { functionButtonStyles } from "../styles/FunctionButtonStyles";
import PropTypes from "prop-types";

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


FunctionButton.propTypes = {
	onClick: PropTypes.func.isRequired,
	disabled: PropTypes.bool,
	icon: PropTypes.node,
	sx: PropTypes.object,
};