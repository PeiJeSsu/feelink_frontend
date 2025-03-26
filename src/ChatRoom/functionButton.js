import * as React from "react";
import Button from "@mui/material/Button";
import PropTypes from 'prop-types';
export default function FunctionButton({ displayName, onClick, disabled, icon, sx = {} }) {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      disabled={disabled}
      
      sx={{
        borderRadius: "10%",
        ...sx,
      }}
    >
      {icon}
    </Button>
  );
}
FunctionButton.propTypes = {
  displayName: PropTypes.string, 
  onClick: PropTypes.func, 
  disabled: PropTypes.bool, 
  icon: PropTypes.node, 
  sx: PropTypes.object, 
};


FunctionButton.defaultProps = {
  displayName: "",
  disabled: false,
  icon: null,
  sx: {},
};