import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Typography, Grid2 } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { saveAs } from "file-saver";
import ImagePreviewContainer from "./ImagePreviewContainer";
import ImageExportFormatSelector from "./ImageExportFormatSelector";
import { generateCanvasPreview, exportCanvasSelection } from "../../helpers/image/ImageExport";

const ImageExportDialog = ({ open, onClose, canvas }) => {
	const [format, setFormat] = useState("png");
	const [transparentBg, setTransparentBg] = useState(false);
	const [previewImage, setPreviewImage] = useState(null);
	const [loading, setLoading] = useState(false);
	const [canvasContentSize, setCanvasContentSize] = useState({
		width: 0,
		height: 0,
		left: 0,
		top: 0,
	});
	const [selection, setSelection] = useState({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	});

	useEffect(() => {
		if (!open || !canvas) return;

		setLoading(true);

		// 使用 setTimeout 確保對話框已經完全打開
		setTimeout(async () => {
			try {
				const { dataURL, contentSize } = await generateCanvasPreview(canvas, format, transparentBg);
				setPreviewImage(dataURL);
				setCanvasContentSize(contentSize);
				setLoading(false);
			} catch (error) {
				console.error("生成預覽圖像時出錯:", error);
				setLoading(false);
			}
		}, 300);
	}, [open, canvas, format, transparentBg]);

	const handleExport = async () => {
		if (!canvas || !previewImage) return;

		setLoading(true);

		try {
			const dataURL = await exportCanvasSelection(canvas, selection, canvasContentSize, format, transparentBg);

			const fileName = `feelink_export_${new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "")}.${format}`;
			saveAs(dataURL, fileName);

			setLoading(false);
			onClose();
		} catch (error) {
			console.error("匯出圖像時出錯:", error);
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>
				匯出圖片
				<IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent>
				<Grid2 container spacing={6}>
					<Grid2 xs={12} md={8}>
						<Typography variant="subtitle1" gutterBottom>
							預覽與裁剪
						</Typography>
						<ImagePreviewContainer previewImage={previewImage} loading={loading} onSelectionChange={setSelection} />
						<Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
							提示: 按住滑鼠中鍵移動畫布，滾輪縮放畫布，拖動藍色選取框選擇區域
						</Typography>
					</Grid2>
					<Grid2 xs={12} md={4}>
						<ImageExportFormatSelector
							format={format}
							onFormatChange={setFormat}
							transparentBg={transparentBg}
							onTransparentBgChange={setTransparentBg}
						/>
					</Grid2>
				</Grid2>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>取消</Button>
				<Button onClick={handleExport} variant="contained" disabled={loading || !previewImage}>
					匯出
				</Button>
			</DialogActions>
		</Dialog>
	);
};

ImageExportDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	canvas: PropTypes.object,
};

export default ImageExportDialog;
