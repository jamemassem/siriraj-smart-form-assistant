
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

  // Parse form type and category
  if (lowerInput.includes('borrow') || lowerInput.includes('need') || lowerInput.includes('get')) {
    parsed.formType = 'equipment-request';
  } else if (lowerInput.includes('book') || lowerInput.includes('reserve') || lowerInput.includes('room')) {
    parsed.formType = 'room-booking';
  }

  // Parse category
  if (lowerInput.includes('notebook') || lowerInput.includes('laptop')) {
    parsed.category = 'notebook';
  } else if (lowerInput.includes('projector')) {
    parsed.category = 'projector';
  } else if (lowerInput.includes('meeting room')) {
    parsed.category = 'meeting-room';
  } else if (lowerInput.includes('conference room')) {
    parsed.category = 'conference-room';
  } else if (lowerInput.includes('printer')) {
    parsed.category = 'printer';
  } else if (lowerInput.includes('camera')) {
    parsed.category = 'camera';
  }

  // Parse date
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (lowerInput.includes('today')) {
    parsed.date = today.toISOString().split('T')[0];
  } else if (lowerInput.includes('tomorrow')) {
    parsed.date = tomorrow.toISOString().split('T')[0];
  } else if (lowerInput.includes('friday')) {
    const friday = getNextWeekday(5); // Friday is day 5
    parsed.date = friday.toISOString().split('T')[0];
  } else if (lowerInput.includes('monday')) {
    const monday = getNextWeekday(1);
    parsed.date = monday.toISOString().split('T')[0];
  } else if (lowerInput.includes('tuesday')) {
    const tuesday = getNextWeekday(2);
    parsed.date = tuesday.toISOString().split('T')[0];
  } else if (lowerInput.includes('wednesday')) {
    const wednesday = getNextWeekday(3);
    parsed.date = wednesday.toISOString().split('T')[0];
  } else if (lowerInput.includes('thursday')) {
    const thursday = getNextWeekday(4);
    parsed.date = thursday.toISOString().split('T')[0];
  } else if (lowerInput.includes('saturday')) {
    const saturday = getNextWeekday(6);
    parsed.date = saturday.toISOString().split('T')[0];
  } else if (lowerInput.includes('sunday')) {
    const sunday = getNextWeekday(0);
    parsed.date = sunday.toISOString().split('T')[0];
  }

  // Parse time
  const timePatterns = [
    /(\d{1,2})\s*(?::|\.)\s*(\d{2})\s*(am|pm)/gi,
    /(\d{1,2})\s*(am|pm)/gi,
    /(\d{1,2})\s*(?::|\.)\s*(\d{2})/g
  ];

  const times: string[] = [];
  
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
      times.push(timeString);
    }
  });

  if (times.length >= 1) {
    parsed.startTime = times[0];
  }
  if (times.length >= 2) {
    parsed.endTime = times[1];
  }

  // Parse purpose from context
  if (lowerInput.includes('presentation') || lowerInput.includes('present')) {
    parsed.purpose = 'For presentation purposes';
  } else if (lowerInput.includes('meeting')) {
    parsed.purpose = 'For meeting purposes';
  } else if (lowerInput.includes('work') || lowerInput.includes('project')) {
    parsed.purpose = 'For work/project purposes';
  } else if (lowerInput.includes('class') || lowerInput.includes('lecture')) {
    parsed.purpose = 'For educational purposes';
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
