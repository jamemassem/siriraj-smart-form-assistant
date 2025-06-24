
// --- types ----------------------------------------------------------
interface ORMsg { role:'system'|'user'|'assistant'; content:string }
interface ORReq { model:string; messages:ORMsg[]; temperature:number; max_tokens:number }
// --------------------------------------------------------------------

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('or_key');

if (!API_KEY) throw new Error('Missing OpenRouter API-Key');

const ENDPT = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-experimental';

export async function chat(messages: ORMsg[], t = 0.0, max = 1024): Promise<string> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), 30000);
  const body: ORReq = { model: MODEL, messages, temperature: t, max_tokens: max };
  
  try {
    const res = await fetch(ENDPT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SmartFormAssistant/3.0'
      },
      body: JSON.stringify(body),
      signal: ctrl.signal
    });
    
    clearTimeout(id);
    
    if (!res.ok) {
      throw new Error(`OpenRouter ${res.status}`);
    }
    
    const data = await res.json();
    return data.choices[0].message.content;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// ---------- helpers --------------------------------------------------
const extractJSON = (txt: string) => {
  const m = txt.match(/\{[\s\S]*}/);
  if (!m) return {};
  try { 
    return JSON.parse(m[0]); 
  } catch { 
    return {}; 
  }
}

// ---------- public --------------------------------------------------
export async function parseEquipmentRequest(conversationHistory: string[], currentInput: string, lang: 'th' | 'en') {
  const currentDate = new Date().toISOString();
  
  const SYS = `You are a highly advanced AI Form Assistant for "Siriraj Hospital Computer Equipment Borrowing System". Your primary function is to analyze Thai conversations and extract information to populate a JSON form.

**CRITICAL INSTRUCTIONS:**
1. **JSON ONLY:** Your entire response MUST be a single, raw JSON object. Do not use markdown (\`\`\`json), explanations, or any text outside the JSON structure.
2. **NO GUESSING:** Only fill fields for which information is explicitly provided in the user's text. For all other fields, use \`null\`.
3. **CONTEXT AWARENESS:** The conversation history is provided. You MUST analyze it to understand the full context. If information (like a user's name or phone number) already exists, DO NOT overwrite it unless the user explicitly asks for a change.
4. **ACCURATE TIME CALCULATION:** Use the provided CURRENT_DATETIME to resolve relative time expressions like "พรุ่งนี้" (tomorrow), "ศุกร์หน้า" (next Friday), "บ่ายโมง" (1 PM). Today is Saturday, June 22, 2025.
   - "พรุ่งนี้" -> "2025-06-23"
   - "วันจันทร์หน้า" -> "2025-06-30"
   - "วันศุกร์หน้า" -> "2025-06-27"
   - "13:00-15:00" or "บ่ายโมงถึงบ่ายสาม" -> start: "T13:00:00", end: "T15:00:00"
5. **SUBJECT & PURPOSE:** Infer a concise \`subject\` (e.g., "ขอยืมโปรเจคเตอร์") and a \`purpose\` (e.g., "สำหรับนำเสนอผลงาน") from the context. If not clear, use "การใช้งานทั่วไป".

**JSON SCHEMA TO USE:**
{
  "employee_id": null,
  "full_name": null,
  "position": null,
  "department": null,
  "division": null,
  "unit": null,
  "phone": null,
  "email": null,
  "subject": "ขอยืม [equipment_type]",
  "equipment_type": "Notebook|Projector|Hub|Mouse|Monitor|Dock|Other",
  "quantity": "1",
  "purpose": "สำหรับประชุม|สำหรับนำเสนอผลงาน|การใช้งานทั่วไป",
  "start_datetime": "YYYY-MM-DDTHH:MM:SS",
  "end_datetime": "YYYY-MM-DDTHH:MM:SS",
  "install_location": null,
  "coordinator": null,
  "coordinator_phone": null,
  "receive_datetime": null,
  "remark": null
}

CURRENT_DATETIME: ${currentDate}
CONVERSATION_HISTORY: ${conversationHistory.join('\n')}`;

  try {
    const rsp = await chat([
      { role: 'system', content: SYS },
      { role: 'user', content: currentInput }
    ]);
    
    console.log('Raw AI Response:', rsp);
    const extracted = extractJSON(rsp);
    console.log('Extracted JSON:', extracted);
    
    return extracted;
  } catch (error) {
    console.error('Error in parseEquipmentRequest:', error);
    return {};
  }
}

export function detectLang(str: string): 'th' | 'en' {
  return /[\u0E00-\u0E7F]/.test(str) ? 'th' : 'en';
}

export function isEquipmentRequest(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  const thaiRequestKeywords = [
    'ขอยืม', 'ต้องการยืม', 'ยืม', 'ขอ', 'ต้องการ', 'จอง', 'ขอจอง',
    'ใช้', 'ต้องการใช้', 'ขอใช้'
  ];
  
  const englishRequestKeywords = [
    'borrow', 'want to borrow', 'need', 'request', 'book', 'reserve',
    'use', 'want to use', 'need to use', 'can i', 'could i', 'may i'
  ];
  
  const equipmentKeywords = [
    'โน้ตบุ๊ก', 'แล็ปท็อป', 'คอมพิวเตอร์', 'notebook', 'laptop', 'computer',
    'โปรเจคเตอร์', 'เครื่องฉาย', 'projector',
    'หับ', 'ฮับ', 'hub',
    'เราท์เตอร์', 'router',
    'เมาส์', 'mouse',
    'จอ', 'มอนิเตอร์', 'monitor', 'screen',
    'dock', 'hdd', 'hdmi'
  ];
  
  const hasRequestKeyword = thaiRequestKeywords.some(keyword => text.includes(keyword)) ||
                           englishRequestKeywords.some(keyword => lowerText.includes(keyword));
  
  const hasEquipmentKeyword = equipmentKeywords.some(keyword => 
    lowerText.includes(keyword.toLowerCase())
  );
  
  return hasRequestKeyword && hasEquipmentKeyword;
}
