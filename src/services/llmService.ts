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

  isEquipmentRequest(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    // Thai keywords for equipment requests
    const thaiRequestKeywords = [
      'ขอยืม', 'ต้องการยืม', 'ยืม', 'ขอ', 'ต้องการ', 'จอง', 'ขอจอง',
      'ใช้', 'ต้องการใช้', 'ขอใช้'
    ];
    
    // English keywords for equipment requests
    const englishRequestKeywords = [
      'borrow', 'want to borrow', 'need', 'request', 'book', 'reserve',
      'use', 'want to use', 'need to use', 'can i', 'could i', 'may i'
    ];
    
    // Equipment names in both languages
    const equipmentKeywords = [
      'โน้ตบุ๊ค', 'แล็ปท็อป', 'คอมพิวเตอร์', 'notebook', 'laptop', 'computer',
      'โปรเจคเตอร์', 'เครื่องฉาย', 'projector',
      'หับ', 'ฮับ', 'hub',
      'เราท์เตอร์', 'router',
      'เมาส์', 'mouse',
      'คีย์บอร์ด', 'keyboard',
      'จอ', 'มอนิเตอร์', 'monitor', 'screen',
      'ดอก', 'dock', 'docking'
    ];
    
    const hasRequestKeyword = thaiRequestKeywords.some(keyword => text.includes(keyword)) ||
                             englishRequestKeywords.some(keyword => lowerText.includes(keyword));
    
    const hasEquipmentKeyword = equipmentKeywords.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
    
    return hasRequestKeyword && hasEquipmentKeyword;
  }

  async parseEquipmentRequest(text: string): Promise<any> {
    await this.initialize();
    
    const language = this.detectLanguage(text);
    console.log('Parsing equipment request:', { text, language });
    
    const parsed: any = {
      // Page 1 - Recorder (leaving empty for user to fill)
      employeeId: '',
      fullName: '',
      position: '',
      department: '',
      division: '',
      unit: '',
      phone: '',
      email: '',
      
      // Document details - try to extract from request
      subject: '',
      equipmentType: '',
      quantity: '1',
      equipmentDetails: '',
      purpose: '',
      
      // Time details
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      
      // Page 2 - Installation and coordination (leaving empty for user to fill)
      installLocation: '',
      basicSoftware: [],
      additionalSoftware: 'no',
      additionalSoftwareDetails: '',
      coordinatorName: '',
      coordinatorPhone: '',
      receiver: '',
      receiveDateTime: '',
      notes: '',
      attachments: []
    };

    const lowerText = text.toLowerCase();
    
    // Enhanced equipment type detection
    const equipmentMap = {
      // Thai patterns
      'โน้ตบุ๊ค|แล็ปท็อป|คอมพิวเตอร์พกพา|laptop|notebook': 'notebook',
      'ฮับ|หับ|hub': 'hub',
      'โปรเจคเตอร์|เครื่องฉาย|projector': 'projector',
      'เราท์เตอร์|router': 'router',
      'เมาส์|mouse': 'mouse',
      'คีย์บอร์ด|keyboard': 'keyboard',
      'จอภาพ|จอ|มอนิเตอร์|monitor|screen|display': 'monitor',
      'ดอกกิ้ง|ดอก|docking|dock': 'dock'
    };

    for (const [pattern, type] of Object.entries(equipmentMap)) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(text)) {
        parsed.equipmentType = type;
        break;
      }
    }

    // Auto-generate subject based on equipment type
    if (parsed.equipmentType) {
      const equipmentNames = {
        'notebook': language === 'th' ? 'Notebook' : 'Notebook',
        'hub': language === 'th' ? 'Hub' : 'Hub',
        'projector': language === 'th' ? 'โปรเจคเตอร์' : 'Projector',
        'router': language === 'th' ? 'Router' : 'Router',
        'mouse': language === 'th' ? 'เมาส์' : 'Mouse',
        'keyboard': language === 'th' ? 'คีย์บอร์ด' : 'Keyboard',
        'monitor': language === 'th' ? 'จอภาพ' : 'Monitor',
        'dock': language === 'th' ? 'Docking Station' : 'Docking Station'
      };
      
      const equipmentName = equipmentNames[parsed.equipmentType as keyof typeof equipmentNames];
      parsed.subject = language === 'th' 
        ? `ขอยืม${equipmentName}` 
        : `Request to borrow ${equipmentName}`;
    }

    // Date parsing with enhanced Thai support
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Thai date patterns
    if (text.includes('วันนี้') || text.includes('today')) {
      parsed.startDate = today.toISOString().split('T')[0];
    } else if (text.includes('พรุ่งนี้') || text.includes('tomorrow')) {
      parsed.startDate = tomorrow.toISOString().split('T')[0];
    } else if (text.includes('จันทร์') || text.includes('monday')) {
      const monday = this.getNextWeekday(1);
      parsed.startDate = monday.toISOString().split('T')[0];
    } else if (text.includes('อังคาร') || text.includes('tuesday')) {
      const tuesday = this.getNextWeekday(2);
      parsed.startDate = tuesday.toISOString().split('T')[0];
    } else if (text.includes('พุธ') || text.includes('wednesday')) {
      const wednesday = this.getNextWeekday(3);
      parsed.startDate = wednesday.toISOString().split('T')[0];
    } else if (text.includes('พฤหัส') || text.includes('thursday')) {
      const thursday = this.getNextWeekday(4);
      parsed.startDate = thursday.toISOString().split('T')[0];
    } else if (text.includes('ศุกร์') || text.includes('friday')) {
      const friday = this.getNextWeekday(5);
      parsed.startDate = friday.toISOString().split('T')[0];
    }

    // Time parsing
    const timePatterns = [
      /(\d{1,2})[:.](\d{2})\s*(?:-|ถึง|to|until)\s*(\d{1,2})[:.](\d{2})/,
      /(\d{1,2})\s*(?:น\.|am|pm)\s*(?:-|ถึง|to|until)\s*(\d{1,2})\s*(?:น\.|am|pm)/,
      /(\d{1,2})[:.](\d{2})/
    ];

    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        if (match[3] && match[4]) {
          // Time range found
          parsed.startTime = `${match[1].padStart(2, '0')}:${match[2].padStart(2, '0')}`;
          parsed.endTime = `${match[3].padStart(2, '0')}:${match[4].padStart(2, '0')}`;
        } else if (match[1] && match[2]) {
          // Single time found
          parsed.startTime = `${match[1].padStart(2, '0')}:${match[2].padStart(2, '0')}`;
        }
        break;
      }
    }

    // Duration parsing for end date
    const durationPatterns = [
      /(\d+)\s*(?:วัน|day|days)/i,
      /(\d+)\s*(?:สัปดาห์|week|weeks)/i,
      /(\d+)\s*(?:ชั่วโมง|hour|hours)/i
    ];

    if (parsed.startDate) {
      const startDate = new Date(parsed.startDate);
      parsed.endDate = parsed.startDate; // Default to same day
      
      for (const pattern of durationPatterns) {
        const match = text.match(pattern);
        if (match) {
          const duration = parseInt(match[1]);
          const endDate = new Date(startDate);
          
          if (text.includes('สัปดาห์') || text.includes('week')) {
            endDate.setDate(endDate.getDate() + (duration * 7));
          } else if (text.includes('วัน') || text.includes('day')) {
            endDate.setDate(endDate.getDate() + duration);
          } else if (text.includes('ชั่วโมง') || text.includes('hour')) {
            // For hours, keep same day but adjust end time
            if (parsed.startTime) {
              const [hours, minutes] = parsed.startTime.split(':').map(Number);
              const newHours = (hours + duration) % 24;
              parsed.endTime = `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }
          }
          
          if (!text.includes('ชั่วโมง') && !text.includes('hour')) {
            parsed.endDate = endDate.toISOString().split('T')[0];
          }
          break;
        }
      }
    }

    // Purpose extraction
    const purposePatterns = {
      'นำเสนอ|presentation|present': language === 'th' ? 'เพื่อการนำเสนอ' : 'For presentation',
      'ประชุม|meeting': language === 'th' ? 'เพื่อการประชุม' : 'For meeting',
      'เรียน|class|lecture|บรรยาย': language === 'th' ? 'เพื่อการเรียนการสอน' : 'For educational purposes',
      'งาน|work|project|โปรเจค': language === 'th' ? 'เพื่อการทำงาน' : 'For work purposes',
      'วิจัย|research': language === 'th' ? 'เพื่อการวิจัย' : 'For research purposes',
      'ทดสอบ|test|testing': language === 'th' ? 'เพื่อการทดสอบ' : 'For testing purposes'
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

    // Location extraction
    const locationPatterns = [
      /(?:ที่|at|in)\s*([^,\.\s]+(?:\s+[^,\.\s]+)*)/i,
      /(?:ห้อง|room)\s*([A-Za-z0-9\u0E00-\u0E7F\-]+)/i
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        parsed.installLocation = match[1].trim();
        break;
      }
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

  generateResponse(userMessage: string, language: 'th' | 'en', isRequest: boolean = false): string {
    const lowerInput = userMessage.toLowerCase();
    
    if (language === 'th') {
      // Thai responses
      if (lowerInput.includes('ขอบคุณ') || lowerInput.includes('ขอบใจ') || lowerInput.includes('thanks')) {
        return "ยินดีครับ! หากต้องการความช่วยเหลือเพิ่มเติม สามารถสอบถามได้เสมอครับ 😊";
      }
      
      if (lowerInput.includes('สวัสดี') || lowerInput.includes('หวัดดี') || lowerInput.includes('hello') || lowerInput.includes('hi')) {
        return "สวัสดีครับ! ผมพร้อมช่วยเหลือคุณเรื่องการกรอกแบบฟอร์มครับ มีอะไรให้ช่วยบ้างครับ? 😄";
      }
      
      if (lowerInput.includes('ช่วย') || lowerInput.includes('help') || lowerInput.includes('ไม่รู้')) {
        return "แน่นอนครับ! คุณสามารถ:\n\n1. **พูดคุยทั่วไป** - ถามข้อมูลหรือคุยเล่นได้เลยครับ\n2. **ขอยืมอุปกรณ์** - เช่น \"ขอยืมโปรเจคเตอร์วันจันทร์หน้า 14:00-16:00\"\n3. **สอบถามวิธีใช้** - ถามเรื่องการกรอกฟอร์มได้เลยครับ\n\nลองพิมพ์ความต้องการดูครับ ผมจะช่วยกรอกฟอร์มให้! 😊";
      }
      
      if (lowerInput.includes('วิธี') || lowerInput.includes('ยังไง') || lowerInput.includes('how')) {
        return "ง่ายมากครับ! เพียงแค่พิมพ์ความต้องการของคุณ เช่น:\n\n📝 **ตัวอย่าง:**\n• \"ขอยืมโน้ตบุ๊คพรุ่งนี้ 9:00-17:00 เพื่อทำงาน\"\n• \"ต้องการโปรเจคเตอร์วันศุกร์ ห้องประชุม A เพื่อนำเสนอ\"\n• \"ขอ Hub 2 ตัว สำหรับติดตั้งในแลป\"\n\nผมจะแยกข้อมูลและกรอกฟอร์มให้โดยอัตโนมัติครับ! 🚀";
      }
      
      if (isRequest) {
        return "เยี่ยมครับ! ผมได้อัพเดทฟอร์มตามข้อมูลที่คุณให้มาแล้ว ✅\n\nกรุณาตรวจสอบข้อมูลในฟอร์มด้านขวา และเพิ่มรายละเอียดส่วนตัว (ชื่อ, รหัสพนักงาน, ภาควิชา ฯลฯ) ก่อนส่งครับ\n\nหากต้องการแก้ไขหรือเพิ่มเติมอะไร บอกผมได้เลยครับ! 😊";
      }
      
      // Casual conversation responses
      const casualResponses = [
        "น่าสนใจครับ! มีอะไรให้ผมช่วยเหลือเพิ่มเติมไหมครับ? 😊",
        "เข้าใจแล้วครับ คุณต้องการให้ผมช่วยกรอกฟอร์มอะไรไหมครับ?",
        "ครับ! หากมีคำขอยืมอุปกรณ์ สามารถบอกผมได้เลยนะครับ 📝"
      ];
      
      return casualResponses[Math.floor(Math.random() * casualResponses.length)];
      
    } else {
      // English responses
      if (lowerInput.includes('thank') || lowerInput.includes('thanks') || lowerInput.includes('ขอบคุณ')) {
        return "You're very welcome! Feel free to ask if you need any further assistance! 😊";
      }
      
      if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('สวัสดี')) {
        return "Hello there! I'm ready to help you with form filling. What can I do for you today? 😄";
      }
      
      if (lowerInput.includes('help') || lowerInput.includes('ช่วย')) {
        return "Of course! Here's what I can do:\n\n1. **General chat** - Ask questions or just chat casually\n2. **Equipment requests** - e.g., \"I need to borrow a projector next Monday 2-4 PM\"\n3. **Form assistance** - Ask about how to fill out forms\n\nTry telling me what you need and I'll help fill out the form! 😊";
      }
      
      if (lowerInput.includes('how') || lowerInput.includes('วิธี')) {
        return "It's super easy! Just type your request naturally, like:\n\n📝 **Examples:**\n• \"I need a laptop tomorrow 9 AM to 5 PM for work\"\n• \"Can I borrow a projector Friday in meeting room A for presentation?\"\n• \"Need 2 hubs for lab installation\"\n\nI'll automatically extract the info and fill the form for you! 🚀";
      }
      
      if (isRequest) {
        return "Perfect! I've updated the form based on your request ✅\n\nPlease check the form on the right and add your personal details (name, employee ID, department, etc.) before submitting.\n\nLet me know if you'd like to modify or add anything! 😊";
      }
      
      // Casual conversation responses
      const casualResponses = [
        "That's interesting! Is there anything I can help you with today? 😊",
        "I see! Do you need help filling out any forms?",
        "Got it! If you have any equipment requests, just let me know! 📝"
      ];
      
      return casualResponses[Math.floor(Math.random() * casualResponses.length)];
    }
  }
}

export const llmService = new LLMService();
