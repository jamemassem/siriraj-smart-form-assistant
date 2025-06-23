
export class RequestDetection {
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
