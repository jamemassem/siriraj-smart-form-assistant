
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

class OpenRouterService {
  private apiKey: string = '';
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(messages: OpenRouterMessage[], timeout: number = 20000): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'cohere/command-r-plus',
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        } as OpenRouterRequest),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: OpenRouterResponse = await response.json();
      return data.choices[0]?.message?.content || 'ไม่สามารถประมวลผลได้ในขณะนี้';
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('คำขอหมดเวลา กรุณาลองใหม่อีกครั้ง');
      }
      throw error;
    }
  }

  async parseEquipmentRequest(text: string, language: 'th' | 'en'): Promise<any> {
    const systemPrompt = language === 'th' 
      ? `คุณเป็นผู้ช่วยในการแยกข้อมูลจากคำขอยืมอุปกรณ์ให้เป็น JSON format ที่สามารถนำไปกรอกแบบฟอร์มได้

รูปแบบ JSON ที่ต้องการ:
{
  "equipmentType": "notebook|hub|router|projector|mouse|dock|monitor|external-hdd|hdmi-cable",
  "quantity": "จำนวน",
  "purpose": "วัตถุประสงค์",
  "startDate": "YYYY-MM-DD",
  "startTime": "HH:MM",
  "endDate": "YYYY-MM-DD", 
  "endTime": "HH:MM",
  "installLocation": "สถานที่ติดตั้ง",
  "subject": "หัวข้อเรื่อง"
}

หากข้อมูลไม่ครบ ให้ใส่ "" สำหรับค่าที่ไม่มี`
      : `You are an assistant that extracts information from equipment borrowing requests into JSON format for form filling.

Required JSON format:
{
  "equipmentType": "notebook|hub|router|projector|mouse|dock|monitor|external-hdd|hdmi-cable",
  "quantity": "number",
  "purpose": "purpose of use",
  "startDate": "YYYY-MM-DD",
  "startTime": "HH:MM", 
  "endDate": "YYYY-MM-DD",
  "endTime": "HH:MM",
  "installLocation": "installation location",
  "subject": "subject title"
}

If information is missing, use "" for empty values`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text }
    ];

    try {
      const response = await this.chat(messages);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return {};
    } catch (error) {
      console.error('Error parsing equipment request:', error);
      return {};
    }
  }

  async generateResponse(userMessage: string, language: 'th' | 'en', isRequest: boolean): Promise<string> {
    const systemPrompt = language === 'th'
      ? `คุณเป็นผู้ช่วยกรอกแบบฟอร์มยืมอุปกรณ์คอมพิวเตอร์ของคณะแพทยศาสตร์ศิริราชพยาบาล มหาวิทยาลัยมหิดล
      
กรุณาตอบด้วยภาษาไทยในลักษณะสุภาพและเป็นทางการ ไม่ใช้อีโมจิ
หากเป็นคำขอยืมอุปกรณ์ ให้แจ้งว่าได้อัพเดทฟอร์มแล้วและแนะนำให้ตรวจสอบข้อมูลเพิ่มเติม
หากเป็นการสนทนาทั่วไป ให้ตอบอย่างสุภาพและเป็นประโยชน์`
      : `You are a Smart Form Assistant for computer equipment borrowing at Faculty of Medicine Siriraj Hospital, Mahidol University.

Please respond in English with a professional, formal tone without emojis.
If it's an equipment request, inform that the form has been updated and suggest reviewing additional details.
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
      'จอ', 'มอนิเตอร์', 'monitor', 'screen'
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
