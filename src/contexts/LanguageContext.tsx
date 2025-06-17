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
    initialMessage: 'สวัสดีครับ ผมเป็นผู้ช่วยในการกรอกแบบฟอร์มอัตโนมัติ\nท่านสามารถบอกความต้องการได้เลย เช่น\n"ขอยืมโน๊ตบุ๊คศุกร์หน้า 13.00–15.00 ที่ห้องประชุมชั้น 2"',
    chatPlaceholder: 'พิมพ์ข้อความที่นี่...',
    
    // Form navigation
    nextPage: 'หน้าถัดไป',
    previousPage: 'หน้าก่อนหน้า',
    page1Title: 'หน้าที่ 1: ข้อมูลผู้บันทึกและรายละเอียดคำขอ',
    page2Title: 'หน้าที่ 2: สถานที่ติดตั้งและผู้เกี่ยวข้อง',
    
    // Form headers
    formTitle: 'แบบฟอร์มขอยืมครุภัณฑ์คอมพิวเตอร์',
    formSubtitle: 'กรุณาตรวจสอบและกรอกข้อมูลให้ครบถ้วน',
    
    // Section headers
    recorderSection: 'ผู้บันทึก',
    documentSection: 'รายละเอียดของเอกสาร',
    timeSection: 'วันและเวลาใช้งาน',
    locationSection: 'สถานที่ติดตั้ง',
    softwareSection: 'โปรแกรมที่ต้องการใช้',
    coordinatorSection: 'ผู้ประสานงาน / ผู้รับอุปกรณ์',
    notesSection: 'หมายเหตุและแนบไฟล์',
    
    // Page 1 fields
    employeeId: 'รหัสพนักงาน',
    fullName: 'ชื่อ-สกุล',
    position: 'ตำแหน่ง',
    department: 'ภาควิชา / สถาบัน / ศูนย์ / ฝ่าย',
    division: 'สายงาน / งาน',
    unit: 'หน่วย',
    phone: 'เบอร์โทรศัพท์',
    email: 'อีเมล์',
    subject: 'เรื่อง',
    equipmentType: 'ประเภทของอุปกรณ์คอมพิวเตอร์ที่ต้องการยืม',
    quantity: 'จำนวน',
    equipmentDetails: 'รายละเอียดอุปกรณ์ / รุ่น',
    purpose: 'วัตถุประสงค์ในการยืม',
    startDate: 'วันที่เริ่มใช้งาน',
    startTime: 'เวลาเริ่มต้น',
    endDate: 'วันที่สิ้นสุด',
    endTime: 'เวลาสิ้นสุด',
    
    // Page 2 fields
    installLocation: 'สถานที่ที่ต้องการติดตั้ง',
    basicSoftware: 'โปรแกรมพื้นฐาน',
    additionalSoftware: 'โปรแกรมเพิ่มเติม',
    coordinatorName: 'ผู้ประสานงาน',
    coordinatorPhone: 'เบอร์โทรศัพท์ผู้ประสานงาน',
    receiver: 'ผู้รับอุปกรณ์',
    receiveDateTime: 'วันและเวลาที่รับอุปกรณ์',
    notes: 'หมายเหตุ',
    attachments: 'แนบไฟล์',
    
    // Software options
    noAdditionalSoftware: 'ไม่ต้องการ',
    needAdditionalSoftware: 'ต้องการ',
    additionalSoftwareNote: 'สำหรับกรณีทั่วไป โปรแกรมพื้นฐานทำงานกับ Windows 7',
    
    // Equipment options
    selectEquipment: 'กรุณาเลือกประเภทอุปกรณ์',
    'notebook': 'Notebook',
    'hub': 'Hub',
    'projector': 'Projector',
    'router': 'Router',
    'mouse': 'Mouse',
    'dock': 'Dock',
    'keyboard': 'Keyboard',
    'monitor': 'Monitor',
    
    // Time options
    selectTime: 'เลือกเวลา',
    
    // Placeholders
    employeeIdPlaceholder: 'กรอกรหัสพนักงาน',
    fullNamePlaceholder: 'กรอกชื่อ-นามสกุล',
    positionPlaceholder: 'เช่น อาจารย์, นักศึกษา, เจ้าหน้าที่',
    departmentPlaceholder: 'กรอกภาควิชา/สถาบัน/ศูนย์/ฝ่าย',
    divisionPlaceholder: 'กรอกสายงาน/งาน',
    unitPlaceholder: 'กรอกหน่วย (ไม่บังคับ)',
    phonePlaceholder: 'หมายเลขโทรศัพท์',
    emailPlaceholder: 'อีเมลที่สามารถติดต่อได้',
    subjectPlaceholder: 'ระบุเรื่องที่ต้องการยืม',
    equipmentDetailsPlaceholder: 'ระบุรายละเอียดหรือรุ่น',
    purposePlaceholder: 'ระบุวัตถุประสงค์ในการยืม',
    installLocationPlaceholder: 'ระบุสถานที่ที่ต้องการติดตั้ง',
    coordinatorNamePlaceholder: 'ชื่อผู้ประสานงาน',
    coordinatorPhonePlaceholder: 'เบอร์โทรผู้ประสานงาน',
    receiverPlaceholder: 'ชื่อผู้รับอุปกรณ์ (ไม่บังคับ)',
    notesPlaceholder: 'หมายเหตุเพิ่มเติม...',
    additionalSoftwarePlaceholder: 'ระบุชื่อโปรแกรมเพิ่มเติม',
    
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
    initialMessage: 'Hello! I\'m a Smart Form Assistant here to help you fill out any form.\nFeel free to chat or ask questions!\nAnd when you say something like:\n"I want to borrow a notebook next Friday from 1 PM to 3 PM"\nI\'ll fill the form for you right away.\n\nสวัสดีครับ ผมเป็นผู้ช่วยในการกรอกแบบฟอร์มอัตโนมัติ\nท่านสามารถบอกความต้องการได้เลย เช่น\n"ขอยืมโน๊ตบุ๊คศุกร์หน้า 13.00–15.00 ที่ห้องประชุมชั้น 2"',
    chatPlaceholder: 'Type your message here...',
    
    // Form navigation
    nextPage: 'Next Page',
    previousPage: 'Previous Page',
    page1Title: 'Page 1: Recorder Information and Request Details',
    page2Title: 'Page 2: Installation Location and Related Personnel',
    
    // Form headers
    formTitle: 'Computer Equipment Borrowing Form',
    formSubtitle: 'Please review and complete all required information',
    
    // Section headers
    recorderSection: 'Recorder',
    documentSection: 'Document Details',
    timeSection: 'Date and Time of Use',
    locationSection: 'Installation Location',
    softwareSection: 'Required Software',
    coordinatorSection: 'Coordinator / Equipment Receiver',
    notesSection: 'Notes and Attachments',
    
    // Page 1 fields
    employeeId: 'Employee ID',
    fullName: 'Full Name',
    position: 'Position',
    department: 'Department / Institute / Center / Division',
    division: 'Work Line / Work',
    unit: 'Unit',
    phone: 'Phone Number',
    email: 'Email',
    subject: 'Subject',
    equipmentType: 'Type of Computer Equipment to Borrow',
    quantity: 'Quantity',
    equipmentDetails: 'Equipment Details / Model',
    purpose: 'Purpose of Borrowing',
    startDate: 'Start Date',
    startTime: 'Start Time',
    endDate: 'End Date',
    endTime: 'End Time',
    
    // Page 2 fields
    installLocation: 'Installation Location',
    basicSoftware: 'Basic Software',
    additionalSoftware: 'Additional Software',
    coordinatorName: 'Coordinator Name',
    coordinatorPhone: 'Coordinator Phone',
    receiver: 'Equipment Receiver',
    receiveDateTime: 'Date and Time to Receive Equipment',
    notes: 'Notes',
    attachments: 'Attachments',
    
    // Software options
    noAdditionalSoftware: 'Not Required',
    needAdditionalSoftware: 'Required',
    additionalSoftwareNote: 'For general cases, basic software works with Windows 7',
    
    // Equipment options
    selectEquipment: 'Please select equipment type',
    'notebook': 'Notebook',
    'hub': 'Hub',
    'projector': 'Projector',
    'router': 'Router',
    'mouse': 'Mouse',
    'dock': 'Dock',
    'keyboard': 'Keyboard',
    'monitor': 'Monitor',
    
    // Time options
    selectTime: 'Select Time',
    
    // Placeholders
    employeeIdPlaceholder: 'Enter employee ID',
    fullNamePlaceholder: 'Enter full name',
    positionPlaceholder: 'e.g., Professor, Student, Staff',
    departmentPlaceholder: 'Enter department/institute/center/division',
    divisionPlaceholder: 'Enter work line/work',
    unitPlaceholder: 'Enter unit (optional)',
    phonePlaceholder: 'Phone number',
    emailPlaceholder: 'Contactable email address',
    subjectPlaceholder: 'Specify the subject for borrowing',
    equipmentDetailsPlaceholder: 'Specify details or model',
    purposePlaceholder: 'Specify purpose of borrowing',
    installLocationPlaceholder: 'Specify installation location',
    coordinatorNamePlaceholder: 'Coordinator name',
    coordinatorPhonePlaceholder: 'Coordinator phone',
    receiverPlaceholder: 'Equipment receiver name (optional)',
    notesPlaceholder: 'Additional notes...',
    additionalSoftwarePlaceholder: 'Specify additional software name',
    
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
