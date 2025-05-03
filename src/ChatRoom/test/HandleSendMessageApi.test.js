import * as HandleSendMessage from "../helpers/HandleSendMessageApiConn";
import { apiConfig } from "../config/ApiConfig";


jest.mock("../config/ApiConfig", () => ({
  apiConfig: {
    post: jest.fn()
  }
}));


describe("HandleSendMessage", () => {
  let originalCrypto;
  const mockUUID = "mock-uuid-1234";

  beforeEach(() => {
    originalCrypto = global.crypto;

    global.crypto = {
      randomUUID: jest.fn(() => mockUUID)
    };

    jest.isolateModules(() => {
      jest.requireActual("../helpers/HandleSendMessageApiConn");
    });
    
    jest.clearAllMocks();
    
    apiConfig.post.mockResolvedValue({
      data: { content: "Response from API" }
    });
  });

  afterEach(() => {
    global.crypto = originalCrypto;
  });

  it("should send message with text only", async () => {
    const result = await HandleSendMessage.sendMessage("Hello world", null);
    

    const formDataMock = apiConfig.post.mock.calls[0][1];
    expect(formDataMock.get("userMessage")).toBe("Hello world");
    expect(formDataMock.get("file")).toBe("null");
    expect(formDataMock.get("sessionId")).toBeTruthy();
    expect(apiConfig.post).toHaveBeenCalledWith("/chat", expect.any(FormData));
    

    expect(result).toEqual({ content: "Response from API" });
  });

  it("should send message with image", async () => {
    const mockImage = new Blob(["image data"], { type: "image/jpeg" });
    const result = await HandleSendMessage.sendMessage("Check this image", mockImage);
    

    const formDataMock = apiConfig.post.mock.calls[0][1];
    expect(formDataMock.get("userMessage")).toBe("Check this image");

    const fileValue = formDataMock.get("file");
    expect(fileValue instanceof Blob).toBe(true);

    expect(formDataMock.get("sessionId")).toBeTruthy();
    

    expect(result).toEqual({ content: "Response from API" });
  });

  it("should use provided sessionId", async () => {
    const customSessionId = "custom-session-id";
    await HandleSendMessage.sendMessage("Hello with custom session", null, customSessionId);
    

    const formDataMock = apiConfig.post.mock.calls[0][1];
    expect(formDataMock.get("sessionId")).toBe(customSessionId);
  });


  it("should add sessionId to FormData", async () => {
    await HandleSendMessage.sendMessage("Hello", null);
    
    const formDataMock = apiConfig.post.mock.calls[0][1];
    expect(formDataMock.get("sessionId")).toBeTruthy();
  });

  it("should handle API error", async () => {
    const errorMessage = "Network error";
    apiConfig.post.mockRejectedValueOnce(new Error(errorMessage));
    
    await expect(HandleSendMessage.sendMessage("Failed message", null)).rejects.toThrow();
  });
});