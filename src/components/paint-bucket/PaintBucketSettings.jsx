import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Slider } from '@mui/material';
import ColorPicker from '../color/ColorPicker';

const PaintBucketSettings = ({ paintBucketSettings, onPaintBucketSettingsChange }) => {
  const handleColorChange = (event) => {
    onPaintBucketSettingsChange({
      ...paintBucketSettings,
      color: event.target.value
    });
  };

  const handleToleranceChange = (event, newValue) => {
    onPaintBucketSettingsChange({
      ...paintBucketSettings,
      tolerance: newValue
    });
  };

  return (
    <>
      <ColorPicker
        label="填充顏色"
        value={paintBucketSettings.color}
        onChange={handleColorChange}
      />

      <Typography gutterBottom sx={{ mt: 2 }}>
        容差: {paintBucketSettings.tolerance}
      </Typography>
      <Slider
        value={paintBucketSettings.tolerance}
        onChange={handleToleranceChange}
        aria-labelledby="tolerance-slider"
        valueLabelDisplay="auto"
        step={1}
        marks
        min={0}
        max={10}
        sx={{ mb: 3 }}
      />
    </>
  );
};

PaintBucketSettings.propTypes = {
  paintBucketSettings: PropTypes.shape({
    color: PropTypes.string.isRequired,
    tolerance: PropTypes.number.isRequired
  }).isRequired,
  onPaintBucketSettingsChange: PropTypes.func.isRequired
};

export default PaintBucketSettings; 