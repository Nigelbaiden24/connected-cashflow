import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const useStreamingChat = () => {
  const [isStreaming, setIsStreaming] = useState(false);

  const streamChat = async ({
    messages,
    onDelta,
    onDone,
    onError,
  }: {
    messages: Message[];
    onDelta: (chunk: string) => void;
    onDone: () => void;
    onError: (error: string) => void;
  }) => {
    setIsStreaming(true);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('financial-chat', {
        body: { messages, stream: true },
      });

      if (invokeError) {
        throw invokeError;
      }

      if (!data) {
        throw new Error('No response from server');
      }

      // If we get a direct response (non-streaming fallback)
      if (data.choices) {
        const content = data.choices[0]?.message?.content;
        if (content) {
          onDelta(content);
        }
        onDone();
        setIsStreaming(false);
        return;
      }

      // For streaming, we need to use fetch directly with the function URL
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://wlsmdcdfyudtvbnbqfmn.supabase.co';
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsc21kY2RmeXVkdHZibmJxZm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzOTEyMTYsImV4cCI6MjA3Mzk2NzIxNn0.EChqxdjqS0FmjSoC65x557HdB2sY9AFiAsN5fXH-AmU';

      const resp = await fetch(`${SUPABASE_URL}/functions/v1/financial-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ messages, stream: true }),
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        console.error('Stream error:', resp.status, errorText);
        
        if (resp.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (resp.status === 402) {
          throw new Error('AI credits depleted. Please contact support.');
        }
        throw new Error(`Failed to start stream: ${resp.status} ${errorText}`);
      }

      if (!resp.body) {
        throw new Error('No response body');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || line.startsWith(':')) continue;
          if (!line.startsWith('data: ')) continue;

          const data = line.slice(6);
          if (data === '[DONE]') {
            onDone();
            setIsStreaming(false);
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onDelta(content);
            }
          } catch (e) {
            console.error('Error parsing stream data:', e);
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer.replace('data: ', ''));
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            onDelta(content);
          }
        } catch (e) {
          // Ignore
        }
      }

      onDone();
    } catch (error) {
      console.error('Stream error:', error);
      onError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsStreaming(false);
    }
  };

  return { streamChat, isStreaming };
};
