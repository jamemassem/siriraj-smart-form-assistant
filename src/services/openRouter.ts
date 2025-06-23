
import { OpenRouterMessage, SmartFormData } from '@/types/openRouterTypes';
import { extractJson } from '@/utils/jsonExtraction';
import { validateFormData } from '@/utils/validation';
import { chatOpenRouter } from '@/services/openRouterClient';
import { PromptBuilder } from '@/services/promptBuilder';
import { RequestDetection } from '@/services/requestDetection';

class OpenRouterService {
  private promptBuilder = new PromptBuilder();
  private requestDetection = new RequestDetection();

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

  setApiKey(apiKey: string) {
    localStorage.setItem('or_key', apiKey);
  }

  async chat(messages: OpenRouterMessage[], timeout: number = 30000): Promise<string> {
    return chatOpenRouter(messages);
  }

  async parseEquipmentRequest(text: string, language: 'th' | 'en'): Promise<SmartFormData> {
    const systemPrompt = this.promptBuilder.buildEquipmentRequestPrompt();

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text }
    ];

    try {
      const response = await this.chat(messages);
      console.log('Raw AI Response for parsing:', response);
      
      const parsedData = extractJson(response);
      console.log('Successfully parsed JSON:', parsedData);
      
      return { ...this.getFormStructure(), ...parsedData };
    } catch (error) {
      console.error('Error parsing equipment request:', error);
      return this.getFormStructure();
    }
  }

  validateFormData(formData: SmartFormData): string[] {
    return validateFormData(formData);
  }

  async generateResponse(userMessage: string, language: 'th' | 'en', isRequest: boolean): Promise<string> {
    if (!isRequest) {
      const systemPrompt = this.promptBuilder.buildGeneralChatPrompt(language);

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

    return language === 'th'
      ? 'ได้อัพเดทข้อมูลในแบบฟอร์มเรียบร้อยแล้ว กรุณาตรวจสอบความถูกต้องและส่งคำขอ'
      : 'Form has been updated successfully. Please review and submit your request.';
  }

  detectLanguage(text: string): 'th' | 'en' {
    return this.requestDetection.detectLanguage(text);
  }

  isEquipmentRequest(text: string): boolean {
    return this.requestDetection.isEquipmentRequest(text);
  }
}

export const openRouterService = new OpenRouterService();
