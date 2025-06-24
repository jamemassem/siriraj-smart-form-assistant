
// src/services/openRouter.ts

interface ORMsg { role:'system'|'user'|'assistant'; content:string }
interface ORReq { model:string; messages:ORMsg[]; temperature:number; max_tokens:number }

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('or_key');
const ENDPT = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-experimental';

async function chat(messages: ORMsg[], t = 0.0, max = 1024): Promise<string> {
  if (!API_KEY) throw new Error('Missing OpenRouter API-Key');
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), 30000);
  const body: ORReq = { model: MODEL, messages, temperature: t, max_tokens: max };
  
  try {
    const res = await fetch(ENDPT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SmartFormAssistant/Final'
      },
      body: JSON.stringify(body),
      signal: ctrl.signal
    });
    
    clearTimeout(id);
    if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
    
    const data = await res.json();
    const content = data.choices[0].message.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : '{}';
  } catch (error) {
    clearTimeout(id);
    console.error("Chat API Error:", error);
    return '{}'; // Return empty JSON on error
  }
}

export async function getLLMResponse(conversationHistory: ORMsg[], currentInput: string) {
  const currentDate = new Date().toISOString();
  const SYS_PROMPT = `You are a highly advanced AI Form Assistant for "Siriraj Hospital Computer Equipment Borrowing System". Your function is to analyze Thai conversations and act as EITHER a friendly conversationalist OR a data extractor.

**MODE DETERMINATION:**
1.  **Data Extraction Mode:** If the user's input contains clear intent to borrow/request equipment (e.g., "ยืม", "ขอ", "ต้องการ", "ใช้", equipment names), extract data into the JSON schema.
2.  **Conversational Mode:** For greetings ("สวัสดี"), general questions ("ยืมข้ามคืนได้ไหม?"), or anything not related to data extraction, you MUST return an EMPTY JSON object \`{}\`.

**CRITICAL INSTRUCTIONS for Data Extraction Mode:**
-   **JSON ONLY:** Your entire response MUST be a single, raw JSON object. Do not use markdown (\`\`\`json), explanations, or any text outside the JSON structure.
-   **NO GUESSING:** Only fill fields for which information is explicitly provided. For all other fields, use \`null\`.
-   **CONTEXT AWARENESS:** Analyze the full conversation history. Do not overwrite existing data unless the user explicitly asks for a change (e.g., "เปลี่ยนเป็นโปรเจคเตอร์นะ").
-   **ACCURATE TIME:** Use \`CURRENT_DATETIME: ${currentDate}\` to resolve relative time.

**JSON SCHEMA:**
{"employee_id":null,"full_name":null,"position":null,"department":null,"division":null,"unit":null,"phone":null,"email":null,"subject":"ขอยืม [equipment_type]","equipment_type":"Notebook|Projector|Hub|Mouse|Monitor|Dock|Other","quantity":"1","purpose":"สำหรับประชุม|สำหรับนำเสนอผลงาน|การใช้งานทั่วไป","start_datetime":"YYYY-MM-DDTHH:MM:SS","end_datetime":"YYYY-MM-DDTHH:MM:SS","install_location":null,"coordinator":null,"coordinator_phone":null,"receive_datetime":null,"remark":null}`;

  const messages: ORMsg[] = [
    { role: 'system', content: SYS_PROMPT },
    ...conversationHistory,
    { role: 'user', content: currentInput }
  ];

  const jsonResponse = await chat(messages, 0.1, 1500);
  try {
    return JSON.parse(jsonResponse);
  } catch {
    return {};
  }
}

export async function getGeneralResponse(userInput: string) {
    const SYS_PROMPT = "You are a friendly and helpful assistant at Siriraj Hospital. Respond to the user's greeting or general question in a polite, concise Thai. Do not ask a follow-up question. Just answer the user's question or greet them back.";
    const messages: ORMsg[] = [
        { role: 'system', content: SYS_PROMPT },
        { role: 'user', content: userInput }
    ];
    return await chat(messages, 0.5, 100);
}
