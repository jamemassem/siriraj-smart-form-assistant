
import { OpenRouterMessage, OpenRouterRequest, OpenRouterResponse } from '@/types/openRouterTypes';

const getApiKey = (): string | null => {
  return localStorage.getItem('or_key') || import.meta.env.VITE_OPENROUTER_API_KEY || null;
};

export async function chatOpenRouter(messages: OpenRouterMessage[]): Promise<string> {
  const API_KEY = getApiKey();
  
  if (!API_KEY) {
    throw new Error('Missing OpenRouter API key');
  }

  const ctrl = new AbortController();
  const timeoutId = setTimeout(() => ctrl.abort(), 30000);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SmartFormAssistant/2.0'
      },
      body: JSON.stringify({
        model: 'qwen/qwen2.5-72b-instruct',
        messages,
        temperature: 0.1,
        max_tokens: 2000,
      } as OpenRouterRequest),
      signal: ctrl.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`OpenRouter API error: ${res.status}`);
    }

    const data: OpenRouterResponse = await res.json();
    return data.choices[0]?.message?.content || 'ไม่สามารถประมวลผลได้ในขณะนี้';
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('คำขอหมดเวลา กรุณาลองใหม่อีกครั้ง');
    }
    throw error;
  }
}
