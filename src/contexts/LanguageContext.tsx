
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'th' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  th: {
    // Header
    title: 'ระบบช่วยกรอกแบบฟอร์มอัตโนมัติ',
    
    // Language switcher
    thai: 'TH',
    english: 'EN',
    
    // Chat interface
    chatTitle: 'ผู้ช่วยระบบฟอร์ม',
    initialMessage: 'สวัสดีครับ ผมเป็นระบบช่วยเหลือในการกรอกแบบฟอร์มต่างๆ ท่านสามารถบอกความต้องการได้เลย เช่น "ต้องการยืมโปรเจคเตอร์สำหรับการนำเสนอในวันจันทร์หน้า เวลา 14.00-16.00 น."\n\nHello! I\'m a Smart Form Assistant to assist you in filling out various forms. You can simply tell me what you need, for example: "I want to borrow a projector for a presentation next Monday from 2 PM to 4 PM."',
    chatPlaceholder: 'กรุณาพิมพ์ความต้องการของท่าน...',
    
    // Form
    formTitle: 'แบบฟอร์มขอยืมครุภัณฑ์คอมพิวเตอร์',
    formSubtitle: 'กรุณาตรวจสอบและกรอกข้อมูลให้ครบถ้วน',
    
    // Form fields
    borrowerName: 'ชื่อ-นามสกุลผู้ยืม',
    position: 'ตำแหน่ง',
    department: 'ภาควิชา/หน่วยงาน',
    phone: 'เบอร์โทรศัพท์',
    email: 'อีเมล',
    equipmentType: 'ประเภทอุปกรณ์ที่ต้องการยืม',
    equipmentDetails: 'รายละเอียดอุปกรณ์/รุ่น',
    quantity: 'จำนวน',
    borrowDate: 'วันที่ยืม',
    returnDate: 'วันที่คืน',
    purpose: 'วัตถุประสงค์การใช้งาน',
    attachments: 'เอกสารแนบ',
    
    // Placeholders
    borrowerNamePlaceholder: 'กรุณากรอกชื่อ-นามสกุล',
    positionPlaceholder: 'เช่น อาจารย์, นักศึกษา, เจ้าหน้าที่',
    departmentPlaceholder: 'กรุณาระบุภาควิชาหรือหน่วยงาน',
    phonePlaceholder: 'หมายเลขโทรศัพท์',
    emailPlaceholder: 'อีเมลที่สามารถติดต่อได้',
    equipmentDetailsPlaceholder: 'ระบุรายละเอียด เช่น MacBook Pro 13" หรือ HP EliteBook',
    purposePlaceholder: 'กรุณาระบุวัตถุประสงค์ในการใช้งาน...',
    
    // Equipment options
    selectEquipment: 'กรุณาเลือกประเภทอุปกรณ์',
    'notebook': 'เครื่องคอมพิวเตอร์โน้ตบุ๊ค',
    'hub': 'Hub',
    'router': 'Router',
    'mouse': 'เมาส์',
    'keyboard': 'คีย์บอร์ด',
    'external-monitor': 'จอภาพภายนอก',
    'docking-station': 'Docking Station',
    'projector': 'เครื่องฉายภาพ',
    'speaker': 'ลำโพง',
    'webcam': 'กล้องเว็บแคม',
    
    // Buttons and actions
    submitButton: 'ส่งแบบฟอร์ม',
    attachFile: 'แนบไฟล์',
    required: '*',
    
    // Messages
    missingInfo: 'ข้อมูลไม่ครบถ้วน',
    fillRequired: 'กรุณากรอกข้อมูล',
    submitSuccess: 'ส่งคำขอเรียบร้อยแล้ว!',
    submitMessage: 'แบบฟอร์มขอยืมครุภัณฑ์ของท่านได้รับการบันทึกเรียบร้อยแล้ว',
  },
  en: {
    // Header
    title: 'Smart Form Assistant',
    
    // Language switcher
    thai: 'TH',
    english: 'EN',
    
    // Chat interface
    chatTitle: 'Form Assistant',
    initialMessage: 'Hello! I\'m a Smart Form Assistant to assist you in filling out various forms. You can simply tell me what you need, for example: "I want to borrow a projector for a presentation next Monday from 2 PM to 4 PM."\n\nสวัสดีครับ ผมเป็นระบบช่วยเหลือในการกรอกแบบฟอร์มต่างๆ ท่านสามารถบอกความต้องการได้เลย เช่น "ต้องการยืมโปรเจคเตอร์สำหรับการนำเสนอในวันจันทร์หน้า เวลา 14.00-16.00 น."',
    chatPlaceholder: 'Please type your request here...',
    
    // Form
    formTitle: 'Computer Equipment Borrowing Form',
    formSubtitle: 'Please review and complete all required information',
    
    // Form fields
    borrowerName: 'Borrower Name',
    position: 'Position',
    department: 'Department/Unit',
    phone: 'Phone Number',
    email: 'Email',
    equipmentType: 'Equipment Type',
    equipmentDetails: 'Equipment Details/Model',
    quantity: 'Quantity',
    borrowDate: 'Borrow Date',
    returnDate: 'Return Date',
    purpose: 'Purpose of Use',
    attachments: 'Attachments',
    
    // Placeholders
    borrowerNamePlaceholder: 'Please enter your full name',
    positionPlaceholder: 'e.g., Professor, Student, Staff',
    departmentPlaceholder: 'Please specify your department or unit',
    phonePlaceholder: 'Phone number',
    emailPlaceholder: 'Contactable email address',
    equipmentDetailsPlaceholder: 'Specify details e.g. MacBook Pro 13" or HP EliteBook',
    purposePlaceholder: 'Please describe the purpose of use...',
    
    // Equipment options
    selectEquipment: 'Please select equipment type',
    'notebook': 'Notebook Computer',
    'hub': 'Hub',
    'router': 'Router',
    'mouse': 'Mouse',
    'keyboard': 'Keyboard',
    'external-monitor': 'External Monitor',
    'docking-station': 'Docking Station',
    'projector': 'Projector',
    'speaker': 'Speaker',
    'webcam': 'Webcam',
    
    // Buttons and actions
    submitButton: 'Submit Form',
    attachFile: 'Attach File',
    required: '*',
    
    // Messages
    missingInfo: 'Missing Information',
    fillRequired: 'Please fill in',
    submitSuccess: 'Form Submitted Successfully!',
    submitMessage: 'Your equipment borrowing request has been recorded successfully.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('th'); // Default to Thai

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['th']] || key;
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
