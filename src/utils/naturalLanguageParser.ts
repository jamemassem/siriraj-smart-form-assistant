
export interface ParsedData {
  formType?: string;
  category?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  purpose?: string;
  userName?: string;
  department?: string;
  contact?: string;
}

export const parseNaturalLanguage = (input: string): ParsedData => {
  const lowerInput = input.toLowerCase();
  const parsed: ParsedData = {};

  // Enhanced form type detection (Thai and English)
  if (lowerInput.includes('borrow') || lowerInput.includes('need') || lowerInput.includes('get') || 
      lowerInput.includes('ยืม') || lowerInput.includes('ขอ') || lowerInput.includes('ต้องการ')) {
    parsed.formType = 'equipment-request';
  } else if (lowerInput.includes('book') || lowerInput.includes('reserve') || lowerInput.includes('room') ||
             lowerInput.includes('จอง') || lowerInput.includes('ห้อง')) {
    parsed.formType = 'room-booking';
  } else if (lowerInput.includes('service') || lowerInput.includes('บริการ')) {
    parsed.formType = 'service-request';
  } else if (lowerInput.includes('maintenance') || lowerInput.includes('repair') || 
             lowerInput.includes('ซ่อม') || lowerInput.includes('บำรุง')) {
    parsed.formType = 'maintenance';
  }

  // Enhanced category detection (Thai and English)
  if (lowerInput.includes('notebook') || lowerInput.includes('laptop') || 
      lowerInput.includes('โน้ตบุ๊ค') || lowerInput.includes('แล็ปท็อป')) {
    parsed.category = 'notebook';
  } else if (lowerInput.includes('projector') || lowerInput.includes('โปรเจคเตอร์') || 
             lowerInput.includes('โปรเจ็คเตอร์')) {
    parsed.category = 'projector';
  } else if (lowerInput.includes('meeting room') || lowerInput.includes('ห้องประชุม')) {
    parsed.category = 'meeting-room';
  } else if (lowerInput.includes('conference room') || lowerInput.includes('ห้องคอนเฟอเรนซ์')) {
    parsed.category = 'conference-room';
  } else if (lowerInput.includes('printer') || lowerInput.includes('เครื่องพิมพ์')) {
    parsed.category = 'printer';
  } else if (lowerInput.includes('camera') || lowerInput.includes('กล้อง')) {
    parsed.category = 'camera';
  }

  // Enhanced date parsing (Thai and English)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (lowerInput.includes('today') || lowerInput.includes('วันนี้')) {
    parsed.date = today.toISOString().split('T')[0];
  } else if (lowerInput.includes('tomorrow') || lowerInput.includes('พรุ่งนี้')) {
    parsed.date = tomorrow.toISOString().split('T')[0];
  } else if (lowerInput.includes('friday') || lowerInput.includes('วันศุกร์')) {
    const friday = getNextWeekday(5);
    parsed.date = friday.toISOString().split('T')[0];
  } else if (lowerInput.includes('monday') || lowerInput.includes('วันจันทร์')) {
    const monday = getNextWeekday(1);
    parsed.date = monday.toISOString().split('T')[0];
  } else if (lowerInput.includes('tuesday') || lowerInput.includes('วันอังคาร')) {
    const tuesday = getNextWeekday(2);
    parsed.date = tuesday.toISOString().split('T')[0];
  } else if (lowerInput.includes('wednesday') || lowerInput.includes('วันพุธ')) {
    const wednesday = getNextWeekday(3);
    parsed.date = wednesday.toISOString().split('T')[0];
  } else if (lowerInput.includes('thursday') || lowerInput.includes('วันพฤหัสบดี')) {
    const thursday = getNextWeekday(4);
    parsed.date = thursday.toISOString().split('T')[0];
  } else if (lowerInput.includes('saturday') || lowerInput.includes('วันเสาร์')) {
    const saturday = getNextWeekday(6);
    parsed.date = saturday.toISOString().split('T')[0];
  } else if (lowerInput.includes('sunday') || lowerInput.includes('วันอาทิตย์')) {
    const sunday = getNextWeekday(0);
    parsed.date = sunday.toISOString().split('T')[0];
  }

  // Enhanced time parsing (Thai and English)
  const timePatterns = [
    /(\d{1,2})\s*(?::|\.)\s*(\d{2})\s*(am|pm)/gi,
    /(\d{1,2})\s*(am|pm)/gi,
    /(\d{1,2})\s*(?::|\.)\s*(\d{2})/g,
    /(\d{1,2})\s*(?:น\.|นาฬิกา)/g, // Thai time patterns
    /บ่าย\s*(\d{1,2})/g, // Thai afternoon
    /เช้า\s*(\d{1,2})/g, // Thai morning
  ];

  const times: string[] = [];
  
  // Handle Thai time expressions
  if (lowerInput.includes('เช้า')) {
    const morningMatch = lowerInput.match(/เช้า.*?(\d{1,2})/);
    if (morningMatch) {
      const hour = parseInt(morningMatch[1]);
      times.push(`${hour.toString().padStart(2, '0')}:00`);
    } else {
      times.push('09:00'); // Default morning time
    }
  }
  
  if (lowerInput.includes('บ่าย')) {
    const afternoonMatch = lowerInput.match(/บ่าย.*?(\d{1,2})/);
    if (afternoonMatch) {
      let hour = parseInt(afternoonMatch[1]);
      if (hour < 12) hour += 12;
      times.push(`${hour.toString().padStart(2, '0')}:00`);
    } else {
      times.push('13:00'); // Default afternoon time
    }
  }

  timePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(input)) !== null) {
      let hour = parseInt(match[1]);
      const minute = match[2] ? parseInt(match[2]) : 0;
      const period = match[3]?.toLowerCase();
      
      if (period === 'pm' && hour !== 12) {
        hour += 12;
      } else if (period === 'am' && hour === 12) {
        hour = 0;
      }
      
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      if (!times.includes(timeString)) {
        times.push(timeString);
      }
    }
  });

  if (times.length >= 1) {
    parsed.startTime = times[0];
  }
  if (times.length >= 2) {
    parsed.endTime = times[1];
  }

  // Enhanced purpose detection (Thai and English)
  if (lowerInput.includes('presentation') || lowerInput.includes('present') || 
      lowerInput.includes('นำเสนอ') || lowerInput.includes('เพรซเซนต์')) {
    parsed.purpose = 'For presentation purposes / สำหรับการนำเสนอ';
  } else if (lowerInput.includes('meeting') || lowerInput.includes('ประชุม')) {
    parsed.purpose = 'For meeting purposes / สำหรับการประชุม';
  } else if (lowerInput.includes('work') || lowerInput.includes('project') || 
             lowerInput.includes('งาน') || lowerInput.includes('โปรเจค')) {
    parsed.purpose = 'For work/project purposes / สำหรับงาน/โปรเจค';
  } else if (lowerInput.includes('class') || lowerInput.includes('lecture') || 
             lowerInput.includes('เรียน') || lowerInput.includes('บรรยาย')) {
    parsed.purpose = 'For educational purposes / สำหรับการศึกษา';
  } else if (lowerInput.includes('training') || lowerInput.includes('อบรม')) {
    parsed.purpose = 'For training purposes / สำหรับการอบรม';
  }

  return parsed;
};

const getNextWeekday = (targetDay: number): Date => {
  const today = new Date();
  const currentDay = today.getDay();
  let daysUntilTarget = targetDay - currentDay;
  
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7;
  }
  
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntilTarget);
  return targetDate;
};
