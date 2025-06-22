

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

export async function chatOpenRouter(messages: OpenRouterMessage[]): Promise<string> {
  const API_KEY = getApiKey();
  
  if (!API_KEY) {
    throw new Error('Missing OpenRouter API key');
  }

  const ctrl = new AbortController();
  const timeoutId = setTimeout(() => ctrl.abort(), 20000);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SmartFormAssistant/1.0'
      },
      body: JSON.stringify({
        model: 'qwen/qwen2.5-72b-instruct',
        messages,
        temperature: 0.2,
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
      phone: null, // * required
      email: null,
      doc_ref_no: null,
      doc_date: null,
      subject: null, // * required
      equipment_type: null, // * required
      quantity: null, // * required
      purpose: null, // * required
      start_datetime: null, // * required
      end_datetime: null, // * required
      install_location: null, // * required
      default_software: false,
      extra_software_choice: "no",
      extra_software_name: null,
      coordinator: null, // * required
      coordinator_phone: null, // * required
      receiver: null,
      receive_datetime: null, // * required
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

  private getApiKey(): string | null {
    return getApiKey();
  }

  setApiKey(apiKey: string) {
    localStorage.setItem('or_key', apiKey);
  }

  async chat(messages: OpenRouterMessage[], timeout: number = 20000): Promise<string> {
    return chatOpenRouter(messages);
  }

  async parseEquipmentRequest(text: string, language: 'th' | 'en'): Promise<SmartFormData> {
    const currentDateTime = this.getCurrentDateTime();
    
    const systemPrompt = `คุณคือผู้ช่วย AI อัจฉริยะ (Smart Form Assistant) ที่เชี่ยวชาญด้านการวิเคราะห์ข้อความภาษาไทยเพื่อกรอก "แบบฟอร์มขอยืมครุภัณฑ์คอมพิวเตอร์" โดยอัตโนมัติ

**เป้าหมายหลักของคุณ:**
รับข้อความจากผู้ใช้ (ทั้งการพิมพ์และเสียงพูด) แล้วสกัดข้อมูลที่เกี่ยวข้องทั้งหมดเพื่อกรอกลงในฟอร์ม JSON ให้ถูกต้องและครบถ้วนที่สุดเท่าที่จะทำได้

**Core Logic (Chain-of-Thought): คุณต้องทำตามขั้นตอนต่อไปนี้อย่างเคร่งครัด**
1. **Analyze Input:** วิเคราะห์ประโยคที่ผู้ใช้ป้อนเข้ามาเพื่อทำความเข้าใจเจตนา (Intent) ว่าต้องการ "ยืมครุภัณฑ์"
2. **Entity Extraction:** สกัดข้อมูล (Entities) ทั้งหมดที่พบในข้อความ แล้วจับคู่กับฟิลด์ใน FORM_STRUCTURE
3. **Time Calculation:** สำหรับฟิลด์ที่เป็นวัน-เวลา ให้คำนวณจากเวลาปัจจุบัน: ${currentDateTime}
4. **JSON Population:** นำข้อมูลที่สกัดได้ไปเติมในโครงสร้าง JSON

**โครงสร้าง JSON ที่ต้องการ:**
{
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
  "subject": null,
  "equipment_type": null,
  "quantity": null,
  "purpose": null,
  "start_datetime": null,
  "end_datetime": null,
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

**Equipment Types:** Notebook, Hub, Projector, Mouse, Dock, Monitor, External HDD, HDMI Adapter, Other

**สำคัญ:** ตอบเฉพาะ JSON เท่านั้น ไม่ต้องมีข้อความอื่น หากข้อมูลไม่มี ให้ใส่ null`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text }
    ];

    try {
      const response = await this.chat(messages);
      console.log('Raw AI Response:', response);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        console.log('Parsed JSON:', parsedData);
        return parsedData;
      }
      return this.getFormStructure();
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

  async generateResponse(userMessage: string, formData: SmartFormData, language: 'th' | 'en', isRequest: boolean): Promise<string> {
    if (!isRequest) {
      const systemPrompt = language === 'th'
        ? `คุณเป็นผู้ช่วยกรอกแบบฟอร์มยืมอุปกรณ์คอมพิวเตอร์ของคณะแพทยศาสตร์ศิริราชพยาบาล มหาวิทยาลัยมหิดล
        
กรุณาตอบด้วยภาษาไทยในลักษณะสุภาพและเป็นทางการ ไม่ใช้อีโมจิ
ตอบอย่างสุภาพและเป็นประโยชน์`
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

    // For equipment requests, validate and return missing fields
    const missingFields = this.validateFormData(formData);
    
    if (missingFields.length === 0) {
      return language === 'th'
        ? 'ได้อัพเดทข้อมูลในแบบฟอร์มเรียบร้อยแล้ว กรุณาตรวจสอบความถูกต้องและส่งคำขอ'
        : 'Form has been updated successfully. Please review and submit your request.';
    }

    // Generate clarification message for missing required fields
    const fieldNameMap: Record<string, string> = {
      'phone': 'เบอร์โทรศัพท์ของคุณ',
      'subject': 'หัวข้อเรื่อง',
      'equipment_type': 'ประเภทอุปกรณ์',
      'quantity': 'จำนวนที่ต้องการยืม',
      'purpose': 'วัตถุประสงค์ในการยืม',
      'start_datetime': 'วันและเวลาที่ต้องการใช้งาน',
      'end_datetime': 'วันและเวลาสิ้นสุดการใช้งาน',
      'install_location': 'สถานที่ติดตั้ง',
      'coordinator': 'ชื่อผู้ประสานงาน',
      'coordinator_phone': 'เบอร์โทรผู้ประสานงาน',
      'receive_datetime': 'วันและเวลารับของ'
    };

    const missingFieldsText = missingFields
      .map(field => `❗ กรุณาระบุ${fieldNameMap[field] || field}`)
      .join('\n');

    return `รับทราบครับ/ค่ะ เพื่อดำเนินการต่อ กรุณาให้ข้อมูลเพิ่มเติมดังนี้:\n${missingFieldsText}`;
  }

  detectLanguage(text: string): 'th' | 'en' {
    const thaiChars = text.match(/[\u0E00-\u0E7F]/g) || [];
    const englishWords = text.match(/[a-zA-Z]+/g) || [];
    return thaiChars.length > englishWords.length ? 'th' : 'en';
  }

  isEquipmentRequest(text: string): boolean {
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
      'โน้ตบุ๊ค', 'แล็ปท็อป', 'คอมพิวเตอร์', 'notebook', 'laptop', 'computer',
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

