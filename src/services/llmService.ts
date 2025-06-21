import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to use local models
env.allowRemoteModels = true;
env.allowLocalModels = true;

// Legacy service - replaced by OpenRouter
// Keeping minimal functionality for backward compatibility

class LLMService {
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    console.log('Legacy LLM service initialized');
    this.initialized = true;
  }

  detectLanguage(text: string): 'th' | 'en' {
    const thaiChars = text.match(/[\u0E00-\u0E7F]/g) || [];
    const englishWords = text.match(/[a-zA-Z]+/g) || [];
    return thaiChars.length > englishWords.length ? 'th' : 'en';
  }

  isEquipmentRequest(text: string): boolean {
    // Simplified detection - actual logic moved to OpenRouter service
    return text.includes('ขอยืม') || text.includes('borrow') || text.includes('need');
  }

  async parseEquipmentRequest(text: string): Promise<any> {
    console.warn('Legacy parseEquipmentRequest called - use OpenRouter service instead');
    return {};
  }

  generateResponse(userMessage: string, language: 'th' | 'en', isRequest: boolean = false): string {
    console.warn('Legacy generateResponse called - use OpenRouter service instead');
    return language === 'th' 
      ? 'กรุณาตั้งค่า API Key เพื่อใช้งานระบบ'
      : 'Please set up API Key to use the system';
  }
}

export const llmService = new LLMService();
