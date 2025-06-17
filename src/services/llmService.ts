
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to use local models
env.allowRemoteModels = true;
env.allowLocalModels = true;

class LLMService {
  private classifier: any = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('Initializing LLM service...');
      // Using a lightweight multilingual model that works well for Thai and English
      this.classifier = await pipeline(
        'text-classification',
        'Xenova/multilingual-MiniLM-L12-v2',
        { device: 'webgpu' }
      );
      this.initialized = true;
      console.log('LLM service initialized successfully');
    } catch (error) {
      console.warn('WebGPU not available, falling back to CPU');
      try {
        this.classifier = await pipeline(
          'text-classification',
          'Xenova/multilingual-MiniLM-L12-v2'
        );
        this.initialized = true;
        console.log('LLM service initialized with CPU');
      } catch (cpuError) {
        console.error('Failed to initialize LLM service:', cpuError);
      }
    }
  }

  detectLanguage(text: string): 'th' | 'en' {
    // Simple language detection based on character patterns
    const thaiChars = text.match(/[\u0E00-\u0E7F]/g) || [];
    const englishWords = text.match(/[a-zA-Z]+/g) || [];
    
    return thaiChars.length > englishWords.length ? 'th' : 'en';
  }

  async parseEquipmentRequest(text: string): Promise<any> {
    await this.initialize();
    
    const language = this.detectLanguage(text);
    console.log('Parsing equipment request:', { text, language });
    
    const parsed: any = {
      equipmentType: '',
      equipmentDetails: '',
      quantity: '1',
      borrowDate: '',
      returnDate: '',
      purpose: '',
      borrowerName: '',
      department: '',
      phone: '',
      email: ''
    };

    const lowerText = text.toLowerCase();
    
    // Enhanced equipment type detection for both languages
    const equipmentMap = {
      // Thai patterns
      'โน้ตบุ๊ค|แล็ปท็อป|คอมพิวเตอร์พกพา': 'notebook',
      'ฮับ|hub': 'hub',
      'เราท์เตอร์|router': 'router',
      'เมาส์|mouse': 'mouse',
      'คีย์บอร์ด|keyboard': 'keyboard',
      'จอภาพ|มอนิเตอร์|monitor': 'external-monitor',
      'ดอกกิ้ง|docking': 'docking-station',
      'โปรเจคเตอร์|เครื่องฉาย': 'projector',
      'ลำโพง|speaker': 'speaker',
      'กล้องเว็บ|webcam': 'webcam',
      
      // English patterns
      'notebook|laptop': 'notebook',
      'projector': 'projector',
      'monitor|screen|display': 'external-monitor',
      'docking station|dock': 'docking-station',
      'speaker|audio': 'speaker',
      'webcam|camera': 'webcam'
    };

    for (const [pattern, type] of Object.entries(equipmentMap)) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(text)) {
        parsed.equipmentType = type;
        break;
      }
    }

    // Date parsing with enhanced Thai support
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Thai date patterns
    if (text.includes('วันนี้') || text.includes('today')) {
      parsed.borrowDate = today.toISOString().split('T')[0];
    } else if (text.includes('พรุ่งนี้') || text.includes('tomorrow')) {
      parsed.borrowDate = tomorrow.toISOString().split('T')[0];
    } else if (text.includes('จันทร์') || text.includes('monday')) {
      const monday = this.getNextWeekday(1);
      parsed.borrowDate = monday.toISOString().split('T')[0];
    } else if (text.includes('อังคาร') || text.includes('tuesday')) {
      const tuesday = this.getNextWeekday(2);
      parsed.borrowDate = tuesday.toISOString().split('T')[0];
    } else if (text.includes('พุธ') || text.includes('wednesday')) {
      const wednesday = this.getNextWeekday(3);
      parsed.borrowDate = wednesday.toISOString().split('T')[0];
    } else if (text.includes('พฤหัส') || text.includes('thursday')) {
      const thursday = this.getNextWeekday(4);
      parsed.borrowDate = thursday.toISOString().split('T')[0];
    } else if (text.includes('ศุกร์') || text.includes('friday')) {
      const friday = this.getNextWeekday(5);
      parsed.borrowDate = friday.toISOString().split('T')[0];
    }

    // Duration parsing
    const durationPatterns = [
      /(\d+)\s*(?:วัน|day|days)/i,
      /(\d+)\s*(?:สัปดาห์|week|weeks)/i
    ];

    for (const pattern of durationPatterns) {
      const match = text.match(pattern);
      if (match && parsed.borrowDate) {
        const borrowDate = new Date(parsed.borrowDate);
        const duration = parseInt(match[1]);
        
        if (text.includes('สัปดาห์') || text.includes('week')) {
          borrowDate.setDate(borrowDate.getDate() + (duration * 7));
        } else {
          borrowDate.setDate(borrowDate.getDate() + duration);
        }
        
        parsed.returnDate = borrowDate.toISOString().split('T')[0];
        break;
      }
    }

    // Purpose extraction
    const purposePatterns = {
      'นำเสนอ|presentation|present': language === 'th' ? 'สำหรับการนำเสนอ' : 'For presentation',
      'ประชุม|meeting': language === 'th' ? 'สำหรับการประชุม' : 'For meeting',
      'เรียน|class|lecture|บรรยาย': language === 'th' ? 'สำหรับการเรียนการสอน' : 'For educational purposes',
      'งาน|work|project|โปรเจค': language === 'th' ? 'สำหรับการทำงาน' : 'For work purposes',
      'วิจัย|research': language === 'th' ? 'สำหรับการวิจัย' : 'For research purposes'
    };

    for (const [pattern, purpose] of Object.entries(purposePatterns)) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(text)) {
        parsed.purpose = purpose;
        break;
      }
    }

    // Quantity extraction
    const quantityMatch = text.match(/(\d+)\s*(?:เครื่อง|ตัว|อัน|units?|pieces?)/i);
    if (quantityMatch) {
      parsed.quantity = quantityMatch[1];
    }

    console.log('Parsed result:', parsed);
    return parsed;
  }

  private getNextWeekday(targetDay: number): Date {
    const today = new Date();
    const currentDay = today.getDay();
    let daysUntilTarget = targetDay - currentDay;
    
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7;
    }
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    return targetDate;
  }

  generateResponse(userMessage: string, language: 'th' | 'en'): string {
    const lowerInput = userMessage.toLowerCase();
    
    if (language === 'th') {
      // Thai responses
      if (lowerInput.includes('ขอบคุณ') || lowerInput.includes('ขอบใจ')) {
        return "ยินดีครับ หากต้องการความช่วยเหลือเพิ่มเติม สามารถสอบถามได้เสมอครับ";
      }
      if (lowerInput.includes('สวัสดี') || lowerInput.includes('หวัดดี')) {
        return "สวัสดีครับ ผมพร้อมช่วยท่านกรอกแบบฟอร์มขอยืมครุภัณฑ์คอมพิวเตอร์ครับ กรุณาบอกความต้องการของท่าน";
      }
      if (lowerInput.includes('ช่วย') || lowerInput.includes('ไม่รู้')) {
        return "ได้เลยครับ ท่านสามารถบอกผมได้เลยว่าต้องการยืมอุปกรณ์อะไร เมื่อไหร่ และใช้ทำอะไร เช่น 'ขอยืมโน้ตบุ๊ควันจันทร์หน้าสำหรับทำงาน'";
      }
      return "เรียบร้อยครับ ผมได้ปรับปรุงแบบฟอร์มตามข้อมูลที่ท่านให้มาแล้ว กรุณาตรวจสอบและแก้ไขข้อมูลหากจำเป็นครับ";
    } else {
      // English responses
      if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
        return "You're welcome! Feel free to ask if you need any further assistance.";
      }
      if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        return "Hello! I'm ready to help you fill out the computer equipment borrowing form. Please tell me what you need.";
      }
      if (lowerInput.includes('help')) {
        return "Of course! You can simply tell me what equipment you need, when you need it, and what it's for. For example: 'I need to borrow a laptop next Monday for work'.";
      }
      return "Perfect! I've updated the form based on your request. Please review the details and make any necessary changes before submitting.";
    }
  }
}

export const llmService = new LLMService();
