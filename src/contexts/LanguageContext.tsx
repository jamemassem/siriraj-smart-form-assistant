
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
    
    // Language switcher
    english: 'EN',
    thai: 'TH',
    
    // Chat interface
    chatTitle: 'Form Assistant',
    chatSubtitle: 'Describe what you need and I\'ll fill the form for you',
    chatPlaceholder: 'Type your request here (e.g., \'Borrow a notebook this Friday morning\')',
    initialMessage: 'Hello! I\'m here to help you fill out forms using natural language. Just tell me what you need - for example: \'I want to borrow a projector for my presentation next Monday from 2 PM to 4 PM\'',
    assistantResponse: 'I\'ve updated the form based on your request. Please review the details and make any necessary changes before submitting.',
    
    // Form
    formTitle: 'Request Form',
    formSubtitle: 'Please review and complete the form details',
    formType: 'Request Type',
    category: 'Category',
    date: 'Date',
    startTime: 'Start Time',
    endTime: 'End Time',
    purpose: 'Purpose',
    userInfo: 'Requester Information',
    name: 'Full Name',
    department: 'Department/Faculty',
    contact: 'Contact Information',
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
    selectFormType: 'Please select request type',
    selectCategory: 'Please select category',
    purposePlaceholder: 'Please describe the purpose of your request...',
    namePlaceholder: 'Your full name',
    departmentPlaceholder: 'Your department or faculty',
    contactPlaceholder: 'Phone number or email address',
    
    // Messages
    missingInfo: 'Missing Information',
    fillRequired: 'Please fill in',
    submitSuccess: 'Request Submitted Successfully!',
    submitMessage: 'Your request has been processed and submitted.',
  },
  th: {
    // Header
    title: 'ระบบช่วยกรอกแบบฟอร์มอัตโนมัติ',
    
    // Language switcher
    english: 'EN',
    thai: 'TH',
    
    // Chat interface
    chatTitle: 'ผู้ช่วยกรอกแบบฟอร์ม',
    chatSubtitle: 'กรุณาอธิบายความต้องการของท่าน ระบบจะช่วยกรอกแบบฟอร์มให้',
    chatPlaceholder: 'กรุณาพิมพ์คำขอของท่าน (เช่น "ขอยืมโน้ตบุ๊ควันศุกร์นี้ช่วงเช้า")',
    initialMessage: 'สวัสดีครับ/ค่ะ กระผมเป็นระบบช่วยเหลือในการกรอกแบบฟอร์มต่างๆ ท่านสามารถบอกความต้องการได้เลย เช่น "ต้องการยืมโปรเจคเตอร์สำหรับการนำเสนอในวันจันทร์หน้า เวลา 14.00-16.00 น."',
    assistantResponse: 'กระผมได้ดำเนินการกรอกแบบฟอร์มตามคำขอของท่านแล้ว กรุณาตรวจสอบรายละเอียดและแก้ไขหากจำเป็นก่อนส่ง',
    
    // Form
    formTitle: 'แบบฟอร์มคำขอ',
    formSubtitle: 'กรุณาตรวจสอบและกรอกข้อมูลให้ครบถ้วน',
    formType: 'ประเภทคำขอ',
    category: 'หมวดหมู่',
    date: 'วันที่',
    startTime: 'เวลาเริ่มต้น',
    endTime: 'เวลาสิ้นสุด',
    purpose: 'วัตถุประสงค์',
    userInfo: 'ข้อมูลผู้ขอใช้บริการ',
    name: 'ชื่อ-นามสกุล',
    department: 'ภาควิชา/หน่วยงาน',
    contact: 'ข้อมูลติดต่อ',
    submitButton: 'ส่งคำขอ',
    required: '*',
    
    // Form options
    'equipment-request': 'คำขอยืมอุปกรณ์',
    'room-booking': 'คำขอจองห้อง',
    'service-request': 'คำขอใช้บริการ',
    'maintenance': 'คำขอซ่อมบำรุง',
    'notebook': 'เครื่องคอมพิวเตอร์โน้ตบุ๊ค',
    'projector': 'เครื่องฉายภาพ',
    'meeting-room': 'ห้องประชุม',
    'conference-room': 'ห้องสัมมนา',
    'laptop': 'เครื่องคอมพิวเตอร์แล็ปท็อป',
    'printer': 'เครื่องพิมพ์',
    'camera': 'กล้องถ่ายรูป',
    
    // Placeholders
    selectFormType: 'กรุณาเลือกประเภทคำขอ',
    selectCategory: 'กรุณาเลือกหมวดหมู่',
    purposePlaceholder: 'กรุณาระบุวัตถุประสงค์ในการขอใช้บริการ...',
    namePlaceholder: 'ชื่อ-นามสกุล',
    departmentPlaceholder: 'ภาควิชา หรือ หน่วยงาน',
    contactPlaceholder: 'หมายเลขโทรศัพท์ หรือ อีเมล',
    
    // Messages
    missingInfo: 'ข้อมูลไม่ครบถ้วน',
    fillRequired: 'กรุณากรอกข้อมูล',
    submitSuccess: 'ส่งคำขอเรียบร้อยแล้ว!',
    submitMessage: 'คำขอของท่านได้รับการบันทึกและส่งเรียบร้อยแล้ว',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('th'); // Default to Thai

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
