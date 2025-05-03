import React from "react";
import { render, screen } from "@testing-library/react";
import useChatMessages from "../hooks/UseChatMessages"; 
import ChatRoom from "../components/ChatRoom"; 


jest.mock("../components/ChatMessage", () => (props) => (
  <div data-testid="chat-message">{props.message}</div>
));

jest.mock("../components/TextInputArea", () => (props) => (
  <div data-testid="text-input-area" />
));

jest.mock("../hooks/UseChatMessages", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("ChatRoom component", () => {
  beforeEach(() => {
    useChatMessages.mockReturnValue({
      messages: [
        { id: 1, message: "Hello", isUser: true, isImage: false },
        { id: 2, message: "Hi!", isUser: false, isImage: false }
      ],
      loading: false,
      predefinedQuestions: ["What do you want to draw?"],
      sendTextMessage: jest.fn(),
      sendImageMessage: jest.fn(),
      sendCanvasAnalysis: jest.fn(),
      sendAIDrawing: jest.fn(),
      addSystemMessage: jest.fn()
    });
  });

  it("renders chat messages correctly", () => {
    render(<ChatRoom canvas={{}} />);
    const messages = screen.getAllByTestId("chat-message");
    expect(messages.length).toBe(2);
    expect(messages[0]).toHaveTextContent("Hello");
    expect(messages[1]).toHaveTextContent("Hi!");
  });

  it("shows loading spinner when loading is true", () => {
    useChatMessages.mockReturnValueOnce({
      ...useChatMessages(),
      messages: [],
      loading: true,
      predefinedQuestions: [],
    });

    render(<ChatRoom canvas={{}} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders TextInputArea with proper props", () => {
    render(<ChatRoom canvas={{}} />);
    expect(screen.getByTestId("text-input-area")).toBeInTheDocument();
  });

  it("adds a system message on initial load", () => {
    const addSystemMessage = jest.fn();
    useChatMessages.mockReturnValueOnce({
      messages: [],
      loading: false,
      predefinedQuestions: ["What do you want to draw?"],
      sendTextMessage: jest.fn(),
      sendImageMessage: jest.fn(),
      sendCanvasAnalysis: jest.fn(),
      sendAIDrawing: jest.fn(),
      addSystemMessage
    });

    render(<ChatRoom canvas={{}} />);
    expect(addSystemMessage).toHaveBeenCalledTimes(1);
  });
});
