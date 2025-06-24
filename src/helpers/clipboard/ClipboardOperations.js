let _clipboard = null;
let _hasClipboardContent = false;
let _lastPastePosition = { left: 0, top: 0 };
const OFFSET = 10; // 每次貼上的偏移量

export const hasClipboardContent = () => _hasClipboardContent;

export const cut = async (canvas) => {
	if (!canvas?.getActiveObject()) return;

	const activeObject = canvas.getActiveObject();

	_clipboard = await activeObject.clone();
	_hasClipboardContent = true;

	_lastPastePosition = {
		left: activeObject.left,
		top: activeObject.top,
	};

	canvas.remove(activeObject);
	canvas.requestRenderAll();
};

export const copy = async (canvas) => {
	if (!canvas?.getActiveObject()) {
		_hasClipboardContent = false;
		return;
	}

	const activeObject = canvas.getActiveObject();

	_clipboard = await activeObject.clone();
	_hasClipboardContent = true;

	_lastPastePosition = {
		left: activeObject.left,
		top: activeObject.top,
	};
};

export const paste = async (canvas) => {
	if (!canvas || !_clipboard) return;

	try {
		const clonedObj = await _clipboard.clone();

		canvas.discardActiveObject();

		const newPosition = {
			left: _lastPastePosition.left + OFFSET,
			top: _lastPastePosition.top + OFFSET,
		};

		clonedObj.set({
			left: newPosition.left,
			top: newPosition.top,
			evented: true,
		});

		_lastPastePosition = newPosition;

		canvas.add(clonedObj);

		canvas.setActiveObject(clonedObj);
		canvas.requestRenderAll();
	} catch (error) {
		console.error("貼上失敗:", error);
	}
};
