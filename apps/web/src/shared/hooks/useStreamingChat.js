import { useState, useCallback, useRef } from 'react';
export const useStreamingChat = (options = {}) => {
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState('');
    const abortControllerRef = useRef(null);
    const startStreaming = useCallback(async (sessionId, message, isCoaching = false) => {
        if (isStreaming)
            return;
        setIsStreaming(true);
        setStreamingMessage('');
        // 이전 요청 취소
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        try {
            const response = await fetch('/api/chat/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId,
                    message,
                    isCoaching
                }),
                signal: abortControllerRef.current.signal
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No response body');
            }
            const decoder = new TextDecoder();
            let fullMessage = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            // 스트리밍 완료
                            const finalMessage = {
                                sender: 'ai',
                                text: fullMessage,
                                timestamp: Date.now()
                            };
                            options.onMessageComplete?.(finalMessage);
                            break;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.content) {
                                fullMessage += parsed.content;
                                setStreamingMessage(fullMessage);
                                // 타이핑 효과를 위한 약간의 지연
                                await new Promise(resolve => setTimeout(resolve, 20));
                            }
                        }
                        catch (e) {
                            // JSON 파싱 실패 시 무시
                        }
                    }
                }
            }
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                // 요청이 취소된 경우
                return;
            }
            console.error('Streaming error:', error);
            options.onError?.(error);
        }
        finally {
            setIsStreaming(false);
            setStreamingMessage('');
            abortControllerRef.current = null;
        }
    }, [isStreaming, options]);
    const stopStreaming = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setIsStreaming(false);
        setStreamingMessage('');
    }, []);
    return {
        isStreaming,
        streamingMessage,
        startStreaming,
        stopStreaming
    };
};
