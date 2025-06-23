interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface SmartFormData {
  employee_id: string | null;
  full_name: string | null;
  position: string | null;
  department: string | null;
  division: string | null;
  unit: string | null;
  phone: string | null;
  email: string | null;
  doc_ref_no: string | null;
  doc_date: string | null;
  subject: string | null;
  equipment_type: string | null;
  quantity: string | null;
  purpose: string | null;
  start_datetime: string | null;
  end_datetime: string | null;
  install_location: string | null;
  default_software: boolean;
  extra_software_choice: string;
  extra_software_name: string | null;
  coordinator: string | null;
  coordinator_phone: string | null;
  receiver: string | null;
  receive_datetime: string | null;
  remark: string | null;
  attachment: string | null;
}

const getApiKey = (): string | null => {
  return localStorage.getItem('or_key') || import.meta.env.VITE_OPENROUTER_API_KEY || null;
};

// ✅ Enhanced JSON extraction helper
const extractJson = (raw: string): any => {
  try {
    // หา JSON block ในข้อความ
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return typeof parsed === 'object' ? parsed : {};
    }
    
    // ถ้าไม่เจอ JSON ให้ลอง parse ทั้งหมด
    const parsed = JSON.parse(raw.trim());
    return typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.error('Failed to extract JSON:', error);
    return {};
  }
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

class OpenRouterService {
  private getCurrentDateTime(): string {
    return "2025-06-22T14:00:00+07:00";
  }

  private getFormStructure(): SmartFormData {
    return {
      employee_id: null,
      full_name: null,
      position: null,
      department: null,
      division: null,
      unit: null,
      phone: null,
      email: null,
      doc_ref_no: null,
      doc_date: null,
      subject: null,
      equipment_type: null,
      quantity: null,
      purpose: null,
      start_datetime: null,
      end_datetime: null,
      install_location: null,
      default_software: false,
      extra_software_choice: "no",
      extra_software_name: null,
      coordinator: null,
      coordinator_phone: null,
      receiver: null,
      receive_datetime: null,
      remark: null,
      attachment: null
    };
  }

  private getRequiredFields(): string[] {
    return [
      'phone', 'subject', 'equipment_type', 'quantity', 'purpose',
      'start_datetime', 'end_datetime', 'install_location', 
      'coordinator', 'coordinator_phone', 'receive_datetime'
    ];
  }

  setApiKey(apiKey: string) {
    localStorage.setItem('or_key', apiKey);
  }

  async chat(messages: OpenRouterMessage[], timeout: number = 30000): Promise<string> {
    return chatOpenRouter(messages);
  }

  // ✅ แก้ให้คืนค่าเป็น object เสมอ
  async parseEquipmentRequest(text: string, language: 'th' | 'en'): Promise<SmartFormData> {
    const currentDateTime = this.getCurrentDateTime();
    
    const systemPrompt = `คุณคือผู้ช่วย AI อัจฉริยะ (Smart Form Assistant v3.0) ที่เชี่ยวชาญด้านการวิเคราะห์ข้อความภาษาไทยเพื่อกรอก "แบบฟอร์มขอยืมครุภัณฑ์คอมพิวเตอร์" โดยอัตโนมัติ

**เป้าหมายหลัก:** สกัดข้อมูลที่เกี่ยวข้องทั้งหมดจากข้อความภาษาไทยเพื่อกรอกลงในฟอร์ม JSON ให้ถูกต้องและครบถ้วนที่สุด

**CURRENT_DATETIME สำหรับการคำนวณเวลา:** ${currentDateTime}
วันนี้คือ: วันเสาร์ที่ 22 มิถุนายน 2025 เวลา 14:00 น.

**กฎการคำนวณเวลาแบบสัมพัทธ์ (สำคัญมาก):**

1. **วันพรุ่งนี้** = 2025-06-23 (วันอาทิตย์)
2. **วันศุกร์หน้า** = 2025-06-27 (วันศุกร์หน้า)
3. **เสาร์หน้า** = 2025-06-28 (วันเสาร์หน้า)
4. **อาทิตย์หน้า** = 2025-06-29 (วันอาทิตย์หน้า)
5. **จันทร์หน้า** = 2025-06-30 (วันจันทร์หน้า)

**ตัวอย่างการแปลงเวลา:**
- "13:00-15:00" → start: "2025-06-27T13:00", end: "2025-06-27T15:00"
- "9 โมงเช้าถึงเที่ยง" → start: "2025-06-27T09:00", end: "2025-06-27T12:00"
- "บ่ายโมงถึงบ่ายสาม" → start: "2025-06-27T13:00", end: "2025-06-27T15:00"
- "เช้าเก้าโมง" → start: "2025-06-27T09:00"

**Equipment Types ที่รองรับ:**
- โน้ตบุ๊ก/แล็ปท็อป/คอมพิวเตอร์ → "Notebook"
- โปรเจคเตอร์/เครื่องฉาย → "Projector"  
- หับ/ฮับ → "Hub"
- เมาส์ → "Mouse"
- จอ/มอนิเตอร์ → "Monitor"
- ดอก/dock → "Dock"
- ฮาร์ดดิสก์ภายนอก → "External HDD"
- สาย HDMI → "HDMI Adapter"
- อื่นๆ → "Other"

🛑 CRITICAL: Respond ONLY with a raw JSON object, without markdown or explanation.

**ตัวอย่าง Input/Output:**
Input: "ขอยืมโปรเจคเตอร์วันศุกร์หน้า เวลา 13:00-15:00 ที่ห้องประชุมชั้น 2"
Output:
{
  "equipment_type": "Projector",
  "quantity": "1",
  "start_datetime": "2025-06-27T13:00",
  "end_datetime": "2025-06-27T15:00",
  "install_location": "ห้องประชุมชั้น 2",
  "purpose": "การใช้งานทั่วไป",
  "subject": "ขอยืมโปรเจคเตอร์",
  "employee_id": null,
  "full_name": null,
  "position": null,
  "department": null,
  "division": null,
  "unit": null,
  "phone": null,
  "email": null,
  "doc_ref_no": null,
  "doc_date": null,
  "default_software": false,
  "extra_software_choice": "no",
  "extra_software_name": null,
  "coordinator": null,
  "coordinator_phone": null,
  "receiver": null,
  "receive_datetime": null,
  "remark": null,
  "attachment": null
}`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text }
    ];

    try {
      const response = await this.chat(messages);
      console.log('Raw AI Response for parsing:', response);
      
      // ✅ ใช้ extractJson helper และแน่ใจว่าได้ object
      const parsedData = extractJson(response);
      console.log('Successfully parsed JSON:', parsedData);
      
      // ✅ ส่งคืนข้อมูลที่ merge กับ default structure
      return { ...this.getFormStructure(), ...parsedData };
    } catch (error) {
      console.error('Error parsing equipment request:', error);
      return this.getFormStructure();
    }
  }

  validateFormData(formData: SmartFormData): string[] {
    const missingFields: string[] = [];
    const requiredFields = this.getRequiredFields();

    requiredFields.forEach(field => {
      const value = formData[field as keyof SmartFormData];
      if (!value || value === null || value === '') {
        missingFields.push(field);
      }
    });

    return missingFields;
  }

  async generateResponse(userMessage: string, language: 'th' | 'en', isRequest: boolean): Promise<string> {
    if (!isRequest) {
      // ... keep existing code (general conversation handling)
      const systemPrompt = language === 'th'
        ? `คุณเป็นผู้ช่วยกรอกแบบฟอร์มยืมอุปกรณ์คอมพิวเตอร์ของคณะแพทยศาสตร์ศิริราชพยาบาล มหาวิทยาลัยมหิดล
        
กรุณาตอบด้วยภาษาไทยในลักษณะสุภาพและเป็นทางการ ไม่ใช้อีโมจิ
ตอบอย่างสุภาพและเป็นประโยชน์ สั้นกระชับ`
        : `You are a Smart Form Assistant for computer equipment borrowing at Faculty of Medicine Siriraj Hospital, Mahidol University.

Please respond in English with a professional, formal tone without emojis.
For general conversation, respond politely and helpfully.`;

      const messages: OpenRouterMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ];

      try {
        return await this.chat(messages);
      } catch (error) {
        console.error('Error generating response:', error);
        return language === 'th' 
          ? 'ขออภัย เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง'
          : 'Sorry, there was an error processing your request. Please try again.';
      }
    }

    // สำหรับ equipment request - ตอบว่าได้อัพเดทข้อมูลแล้ว
    return language === 'th'
      ? 'ได้อัพเดทข้อมูลในแบบฟอร์มเรียบร้อยแล้ว กรุณาตรวจสอบความถูกต้องและส่งคำขอ'
      : 'Form has been updated successfully. Please review and submit your request.';
  }

  detectLanguage(text: string): 'th' | 'en' {
    const thaiChars = text.match(/[\u0E00-\u0E7F]/g) || [];
    const englishWords = text.match(/[a-zA-Z]+/g) || [];
    return thaiChars.length > englishWords.length ? 'th' : 'en';
  }

  isEquipmentRequest(text: string): boolean {
    // ... keep existing code (request detection logic)
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
}

export const openRouterService = new OpenRouterService();
