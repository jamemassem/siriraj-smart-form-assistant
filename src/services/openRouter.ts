
// --- types ----------------------------------------------------------
interface ORMsg { role:'system'|'user'|'assistant'; content:string }
interface ORReq { model:string; messages:ORMsg[]; temperature:number; max_tokens:number }
// --------------------------------------------------------------------

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('or_key');

if (!API_KEY) throw new Error('Missing OpenRouter API-Key');

const ENDPT = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'qwen/qwen2.5-72b-instruct';

export async function chat(messages: ORMsg[], t = 0.0, max = 512): Promise<string> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), 20000);
  const body: ORReq = { model: MODEL, messages, temperature: t, max_tokens: max };
  
  try {
    const res = await fetch(ENDPT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SmartFormAssistant/2.0'
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

// ---------- public  --------------------------------------------------
export async function parseEquipmentRequest(text: string, lang: 'th' | 'en') {
  const SYS = lang === 'th'
    ? `คุณคือผู้ช่วยกรอกแบบฟอร์มขอยืมอุปกรณ์คอมพิวเตอร์ ให้แปลงข้อความของผู้ใช้เป็น JSON โดยตรง

กรอกข้อมูลเฉพาะที่มีในข้อความ ห้ามเดา ใช้รูปแบบ JSON นี้:
{
  "employee_id": null,
  "full_name": null,
  "position": null,
  "department": null,
  "division": null,
  "unit": null,
  "phone": null,
  "email": null,
  "subject": null,
  "equipment_type": "โปรเจคเตอร์|แล็ปท็อป|คอมพิวเตอร์|...",
  "quantity": "1",
  "purpose": null,
  "start_datetime": "2025-01-10T13:00:00",
  "end_datetime": "2025-01-10T15:00:00",
  "install_location": null,
  "default_software": false,
  "extra_software_choice": "no",
  "extra_software_name": null,
  "coordinator": null,
  "coordinator_phone": null,
  "receiver": null,
  "receive_datetime": null,
  "remark": null,
  "attachment": null
}

ตอบเป็น JSON object เท่านั้น ไม่ต้องมี markdown หรือคำอธิบาย`
    : `You are a smart form assistant for computer equipment borrowing. Convert user message to JSON format.

Fill only the information available in the message. Do not guess. Use this JSON structure:
{
  "employee_id": null,
  "full_name": null,
  "position": null,
  "department": null,
  "division": null,
  "unit": null,
  "phone": null,
  "email": null,
  "subject": null,
  "equipment_type": "projector|laptop|computer|...",
  "quantity": "1",
  "purpose": null,
  "start_datetime": "2025-01-10T13:00:00",
  "end_datetime": "2025-01-10T15:00:00",
  "install_location": null,
  "default_software": false,
  "extra_software_choice": "no",
  "extra_software_name": null,
  "coordinator": null,
  "coordinator_phone": null,
  "receiver": null,
  "receive_datetime": null,
  "remark": null,
  "attachment": null
}

Respond with raw JSON object only. No markdown or explanations.`;

  try {
    const rsp = await chat([
      { role: 'system', content: SYS },
      { role: 'user', content: text }
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

