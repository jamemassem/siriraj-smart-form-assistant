
// src/services/openRouter.ts
interface ORMsg { role: 'system' | 'user' | 'assistant'; content: string }
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('or_key');
const ENDPT = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-experimental';

async function chat(messages: ORMsg[], temperature = 0.1, max_tokens = 1500): Promise<string> {
  if (!API_KEY) throw new Error('Missing OpenRouter API-Key');
  const ctrl = new AbortController();
  const timeoutId = setTimeout(() => ctrl.abort(), 30000);
  
  try {
    const res = await fetch(ENDPT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, messages, temperature, max_tokens }),
      signal: ctrl.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`OpenRouter API Error: ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content || '';
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Chat API Error:", error);
    return '';
  }
}

const extractJson = (text: string): object => {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return {};
    try {
        return JSON.parse(match[0]);
    } catch {
        return {};
    }
};

export async function getLLMResponse(conversationHistory: ORMsg[], currentInput: string) {
  const currentDate = new Date().toISOString();
  const SYS_PROMPT = `You are a smart AI assistant for Siriraj Hospital's equipment borrowing form. Your task is to analyze a Thai conversation and decide on one of two actions:

1.  **EXTRACT DATA:** If the user's latest input clearly relates to borrowing equipment (e.g., contains words like "ยืม", "ขอ", "โปรเจคเตอร์", "วันจันทร์", times, locations), extract ALL available information into the JSON schema provided.
2.  **CONVERSE:** If the user's input is a simple greeting ("สวัสดี"), a general question ("ยืมข้ามคืนได้ไหม?"), or unrelated, you MUST return an EMPTY JSON object: \`{}\`.

**CRITICAL INSTRUCTIONS for EXTRACTION:**
-   **RESPONSE MUST BE JSON ONLY.** No markdown, no explanations.
-   **NEVER GUESS.** If data is not present, use \`null\`.
-   **USE CONTEXT.** Analyze the entire conversation to understand requests and corrections.
-   **USE CURRENT TIME:** \`CURRENT_DATETIME: ${currentDate}\` is your reference for relative dates.

**JSON SCHEMA:**
{"employee_id":null,"full_name":null,"position":null,"department":null,"division":null,"unit":null,"phone":null,"email":null,"subject":null,"equipment_type":null,"quantity":null,"purpose":null,"start_datetime":null,"end_datetime":null,"install_location":null,"coordinator":null,"coordinator_phone":null,"receive_datetime":null,"remark":null}`;

  const messages: ORMsg[] = [
    { role: 'system', content: SYS_PROMPT },
    ...conversationHistory.slice(-4), // Use last 4 messages for context
    { role: 'user', content: currentInput }
  ];
  
  const response = await chat(messages);
  return extractJson(response);
}

export async function getGeneralResponse(userInput: string) {
    const SYS_PROMPT = "You are a friendly and helpful assistant at Siriraj Hospital. Respond to the user's greeting or general question in a polite, concise Thai. Greet them back or answer the question directly. Do not ask for more information.";
    return await chat([{ role: 'system', content: SYS_PROMPT }, { role: 'user', content: userInput }], 0.5, 100);
}
