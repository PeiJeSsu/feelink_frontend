import * as React from "react";
import Button from "@mui/material/Button";

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