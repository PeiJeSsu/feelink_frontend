import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatMessage from '../components/ChatMessage';
import '@testing-library/jest-dom';

jest.mock('markdown-it', () => {
  return jest.fn().mockImplementation(() => ({
    render: (text) => {
      if (text.includes('**')) {
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      }
      return text;
    }
  }));
});

describe('ChatMessage Component', () => {
  test('renders plain text message', () => {
    render(<ChatMessage message="Hello world" isUser={true} isImage={false} />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  test('renders markdown message', () => {
    render(<ChatMessage message="**bold text**" isUser={false} isImage={false} />);
    
    const boldElement = screen.getByText("bold text");
    expect(boldElement).toBeInTheDocument();
    expect(boldElement.tagName).toBe("STRONG");
  });

  test('renders image when isImage is true', () => {
    const imageUrl = "https://example.com/image.png";
    render(<ChatMessage message={imageUrl} isUser={false} isImage={true} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', imageUrl);
    expect(img).toHaveAttribute('alt', '上傳的圖片');
  });

  test('renders empty message safely', () => {
    const { container } = render(<ChatMessage message="" isUser={true} isImage={false} />);
  
    const p = container.querySelector("p");
    expect(p).toBeInTheDocument();
    expect(p?.textContent).toBe("");
  });
});
