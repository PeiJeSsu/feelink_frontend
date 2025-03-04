import React from "react";
import PropTypes from "prop-types";
import { Box, TextField } from "@mui/material";

const ColorPicker = ({ label, value, onChange, disabled = false, sx = {} }) => {
    return (
        <Box sx={{ display: "flex", alignItems: "center", mt: 2, ...sx }}>
            <TextField
                label={label}
                type="color"
                value={value}
                onChange={onChange}
                sx={{ width: "100%" }}
                disabled={disabled}
            />
        </Box>
    );
};

ColorPicker.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    sx: PropTypes.object,
};

export default ColorPicker;
