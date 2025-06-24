import { handleSendTextMessage, handleSendImageMessage } from "../helpers/MessageController";

const mockSetMessages = jest.fn();
const mockSetLoading = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();
});

describe("handleSendTextMessage", () => {
	it("should not send a message if messageText is empty", () => {
		handleSendTextMessage("", [], mockSetMessages, mockSetLoading);
		expect(mockSetMessages).not.toHaveBeenCalled();
		expect(mockSetLoading).not.toHaveBeenCalled();
	});

	it("should send a text message correctly", () => {
		const messages = [{ id: 1, message: "Hello", isUser: true, isImage: false }];
		handleSendTextMessage("Test message", messages, mockSetMessages, mockSetLoading);

		expect(mockSetMessages).toHaveBeenCalled();
		expect(mockSetLoading).toHaveBeenCalledWith(true);
	});
});

describe("handleSendImageMessage", () => {
	it("should not send anything if both text and image are empty", () => {
		handleSendImageMessage("", null, [], mockSetMessages, mockSetLoading);
		expect(mockSetMessages).not.toHaveBeenCalled();
		expect(mockSetLoading).not.toHaveBeenCalled();
	});

	it("should send an image message correctly", () => {
		const messages = [{ id: 1, message: "Hello", isUser: true, isImage: false }];
		const mockFile = new Blob(["fake image data"], { type: "image/png" });

		handleSendImageMessage("Test image", mockFile, messages, mockSetMessages, mockSetLoading);

		expect(mockSetMessages).toHaveBeenCalled();
		expect(mockSetLoading).toHaveBeenCalledWith(true);
	});
});
