import React from 'react';
import { render } from '@testing-library/react';
import ChatMessage from './chatMessage';

describe('ChatMessage Component', () => {
    it('renders a text message correctly for a user', () => {
        const { getByText } = render(
            <ChatMessage message="Hello!" isUser={true} isImage={false} />
        );
        expect(getByText('Hello!')).toBeInTheDocument();
    });

    it('renders a text message correctly for another user', () => {
        const { getByText } = render(
            <ChatMessage message="Hi there!" isUser={false} isImage={false} />
        );
        expect(getByText('Hi there!')).toBeInTheDocument();
    });

    it('renders an image message correctly', () => {
        const testImageUrl = 'https://example.com/test-image.jpg';
        const { getByAltText } = render(
            <ChatMessage message={testImageUrl} isUser={true} isImage={true} />
        );
        expect(getByAltText('上傳的圖片')).toBeInTheDocument();
    });
});