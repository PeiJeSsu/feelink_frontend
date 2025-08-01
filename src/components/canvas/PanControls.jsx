import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { handleMiddleButtonPan, setupMiddleButtonPan } from "../../helpers/canvas/PanHelper";

const PanControls = ({ canvas }) => {
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

	useEffect(() => {
		if (!canvas?.upperCanvasEl) return;

		const handleMouseMove = (e) => {
			if (!isDragging) return;

			const newDragStart = handleMiddleButtonPan(canvas, e, dragStart);
			setDragStart(newDragStart);
		};

		const handleMouseUp = () => {
			setIsDragging(false);
		};

		const cleanup = setupMiddleButtonPan(canvas, setIsDragging, setDragStart, handleMouseMove, handleMouseUp);

		return cleanup;
	}, [canvas, isDragging, dragStart]);

	return null;
};

PanControls.propTypes = {
	canvas: PropTypes.object,
};

export default PanControls;
