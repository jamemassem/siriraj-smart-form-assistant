
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'th';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    title: 'Smart Form Assistant',
    subtitle: 'Describe what you need in natural language, and I\'ll fill out the form for you',
    
    // Language switcher
    english: 'EN',
    thai: 'TH',
    
    // Chat interface
    chatTitle: 'Form Assistant',
    chatSubtitle: 'Describe what you need and I\'ll fill the form for you',
    chatPlaceholder: 'Type your request here (e.g., \'Borrow a notebook this Friday morning\')',
    initialMessage: 'Hi! I\'m here to help you fill out forms using natural language. Just tell me what you need - for example: \'I want to borrow a projector for my presentation next Monday from 2 PM to 4 PM\'',
    assistantResponse: 'I\'ve updated the form based on your request. Please review the details and make any necessary changes before submitting.',
    
    // Form
    formTitle: 'Dynamic Form',
    formSubtitle: 'Review and edit the auto-filled information',
    formType: 'Form Type',
    category: 'Category',
    date: 'Date',
    startTime: 'Start Time',
    endTime: 'End Time',
    purpose: 'Purpose',
    userInfo: 'User Information',
    name: 'Name',
    department: 'Department',
    contact: 'Contact',
    submitButton: 'Submit Request',
    required: '*',
    
    // Form options
    'equipment-request': 'Equipment Request',
    'room-booking': 'Room Booking',
    'service-request': 'Service Request',
    'maintenance': 'Maintenance Request',
    'notebook': 'Notebook',
    'projector': 'Projector',
    'meeting-room': 'Meeting Room',
    'conference-room': 'Conference Room',
    'laptop': 'Laptop',
    'printer': 'Printer',
    'camera': 'Camera',
    
    // Placeholders
    selectFormType: 'Select form type',
    selectCategory: 'Select category',
    purposePlaceholder: 'Describe the purpose of your request...',
    namePlaceholder: 'Your full name',
    departmentPlaceholder: 'Your department',
    contactPlaceholder: 'Phone or email',
    
    // Messages
    missingInfo: 'Missing Information',
    fillRequired: 'Please fill in',
    submitSuccess: 'Form Submitted Successfully!',
    submitMessage: 'Your request has been processed and submitted.',
  },
  th: {
    // Header
    title: 'ผู้ช่วยฟอร์มอัจฉริยะ',
    subtitle: 'อธิบายสิ่งที่คุณต้องการด้วยภาษาธรรมชาติ และฉันจะกรอกฟอร์มให้คุณ',
    
    // Language switcher
    english: 'EN',
    thai: 'TH',
    
    // Chat interface
    chatTitle: 'ผู้ช่วยฟอร์ม',
    chatSubtitle: 'อธิบายสิ่งที่คุณต้องการ และฉันจะกรอกฟอร์มให้คุณ',
    chatPlaceholder: 'พิมพ์คำขอของคุณที่นี่ (เช่น \'ขอยืมโน้ตบุ๊คเช้าวันศุกร์นี้\')',
    initialMessage: 'สวัสดี! ฉันมาช่วยคุณกรอกฟอร์มด้วยภาษาธรรมชาติ เพียงบอกฉันว่าคุณต้องการอะไร - เช่น: \'ฉันต้องการยืมโปรเจคเตอร์สำหรับการนำเสนอในวันจันทร์หน้า ตั้งแต่บ่าย 2 ถึง 4 โมง\'',
    assistantResponse: 'ฉันได้อัปเดตฟอร์มตามคำขอของคุณแล้ว กรุณาตรวจสอบรายละเอียดและแก้ไขหากจำเป็นก่อนส่ง',
    
    // Form
    formTitle: 'ฟอร์มแบบไดนามิค',
    formSubtitle: 'ตรวจสอบและแก้ไขข้อมูลที่กรอกอัตโนมัติ',
    formType: 'ประเภทฟอร์ม',
    category: 'หมวดหมู่',
    date: 'วันที่',
    startTime: 'เวลาเริ่ม',
    endTime: 'เวลาสิ้นสุด',
    purpose: 'วัตถุประสงค์',
    userInfo: 'ข้อมูลผู้ใช้',
    name: 'ชื่อ',
    department: 'แผนก',
    contact: 'ติดต่อ',
    submitButton: 'ส่งคำขอ',
    required: '*',
    
    // Form options
    'equipment-request': 'คำขอยืมอุปกรณ์',
    'room-booking': 'จองห้อง',
    'service-request': 'คำขอบริการ',
    'maintenance': 'คำขอซ่อมบำรุง',
    'notebook': 'โน้ตบุ๊ค',
    'projector': 'โปรเจคเตอร์',
    'meeting-room': 'ห้องประชุม',
    'conference-room': 'ห้องคอนเฟอเรนซ์',
    'laptop': 'แล็ปท็อป',
    'printer': 'เครื่องพิมพ์',
    'camera': 'กล้อง',
    
    // Placeholders
    selectFormType: 'เลือกประเภทฟอร์ม',
    selectCategory: 'เลือกหมวดหมู่',
    purposePlaceholder: 'อธิบายวัตถุประสงค์ของคำขอ...',
    namePlaceholder: 'ชื่อเต็มของคุณ',
    departmentPlaceholder: 'แผนกของคุณ',
    contactPlaceholder: 'โทรศัพท์หรืออีเมล',
    
    // Messages
    missingInfo: 'ข้อมูลไม่ครบ',
    fillRequired: 'กรุณากรอก',
    submitSuccess: 'ส่งฟอร์มสำเร็จ!',
    submitMessage: 'คำขอของคุณได้รับการประมวลผลและส่งแล้ว',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
