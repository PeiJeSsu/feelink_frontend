import { Alert, Snackbar, IconButton } from "@mui/material";
import { createRoot } from "react-dom/client";
import CloseIcon from "@mui/icons-material/Close";

let alertRoot = null;
let alertContainer = null;
let timeoutId = null;

/**
 * 顯示提示訊息
 * @param {string} message - 提示訊息內容
 * @param {string} severity - 提示類型（error、warning、info、success）
 * @param {number} duration - 顯示時間（毫秒）
 */
export function showAlert(message, severity = "error", duration = 3000) {
	// 如果已經有顯示的 alert，先清除定時器
	if (timeoutId) {
		clearTimeout(timeoutId);
	}

	// 如果容器不存在，創建新容器和 root
	if (!alertContainer) {
		alertContainer = document.createElement("div");
		document.body.appendChild(alertContainer);
		alertRoot = createRoot(alertContainer);
	}

	const handleClose = (event, reason) => {
		if (reason === "clickaway") {
			return;
		}
		cleanupAlert();
	};

	// 渲染 Alert
	alertRoot.render(
		<Snackbar
			open={true}
			autoHideDuration={duration}
			onClose={handleClose}
			action={
				<IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
					<CloseIcon fontSize="small" />
				</IconButton>
			}
		>
			<Alert severity={severity} onClose={handleClose}>
				{message}
			</Alert>
		</Snackbar>
	);

	// 設置定時器在指定時間後清除容器
	timeoutId = setTimeout(cleanupAlert, duration);
}

/**
 * 清理提示訊息資源
 */
function cleanupAlert() {
	if (alertContainer && document.body.contains(alertContainer)) {
		alertRoot.unmount();
		document.body.removeChild(alertContainer);
		alertContainer = null;
		alertRoot = null;
	}
}
