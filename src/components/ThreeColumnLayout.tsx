
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatInterface from '@/components/ChatInterface';
import ComputerEquipmentFormPart1 from '@/components/ComputerEquipmentFormPart1';
import ComputerEquipmentFormPart2 from '@/components/ComputerEquipmentFormPart2';
import { useLanguage } from '@/contexts/LanguageContext';
import { ComputerEquipmentFormData, SmartFormData, convertSmartFormToFormData } from '@/types/formTypes';
import { openRouterService } from '@/services/openRouter';
import { toast } from '@/hooks/use-toast';

const ThreeColumnLayout: React.FC = () => {
  const { language } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState<ComputerEquipmentFormData>({
    // Page 1 - Recorder Information
    employeeId: '',
    fullName: '',
    position: '',
    department: '',
    division: '',
    unit: '',
    phone: '',
    email: '',
    
    // Document Details
    subject: '',
    equipmentType: '',
    quantity: '1',
    equipmentDetails: '',
    purpose: '',
    
    // Time Details
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    
    // Page 2 - Installation and Coordination
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
  });

  // Field name mapping for Thai error messages
  const fieldNameMap: Record<string, string> = {
    'phone': 'เบอร์โทรศัพท์',
    'subject': 'หัวข้อเรื่อง',
    'equipmentType': 'ประเภทอุปกรณ์',
    'quantity': 'จำนวน',
    'purpose': 'วัตถุประสงค์',
    'startDate': 'วันที่เริ่มต้น',
    'startTime': 'เวลาเริ่มต้น',
    'endDate': 'วันที่สิ้นสุด',
    'endTime': 'เวลาสิ้นสุด',
    'installLocation': 'สถานที่ติดตั้ง',
    'coordinatorName': 'ชื่อผู้ประสานงาน',
    'coordinatorPhone': 'เบอร์โทรผู้ประสานงาน',
    'receiveDateTime': 'วันและเวลารับของ'
  };

  // Required fields that must be filled
  const requiredFields = [
    'phone', 'subject', 'equipmentType', 'quantity', 'purpose',
    'startDate', 'startTime', 'endDate', 'endTime', 'installLocation',
    'coordinatorName', 'coordinatorPhone', 'receiveDateTime'
  ];

  // Get missing required fields
  const getMissingFields = (data: ComputerEquipmentFormData): string[] => {
    return requiredFields.filter(field => {
      const value = data[field as keyof ComputerEquipmentFormData];
      return !value || value === '';
    });
  };

  const handleMessageSent = (message: string, parsedData: SmartFormData | null) => {
    console.log('Processing message:', message);
    console.log('Parsed smart form data:', parsedData);
    
    if (parsedData) {
      // 2 ▶️ merge เข้า state ฟอร์มก่อน validate
      const convertedData = convertSmartFormToFormData(parsedData);
      
      // Merge with existing form data, keeping non-null values from converted data
      const updatedFormData = { ...formData };
      
      Object.keys(convertedData).forEach(key => {
        const value = convertedData[key as keyof ComputerEquipmentFormData];
        if (value !== undefined && value !== null && value !== '') {
          updatedFormData[key as keyof ComputerEquipmentFormData] = value as any;
        }
      });
      
      console.log('Updated form data:', updatedFormData);
      setFormData(updatedFormData);

      // 3 ▶️ ตรวจเฉพาะช่อง * ที่ยังว่าง และแสดง validation errors
      const missingFields = getMissingFields(updatedFormData);
      
      if (missingFields.length > 0) {
        // แสดง toast สำหรับ missing fields
        const missingFieldsText = missingFields
          .map(field => fieldNameMap[field] || field)
          .join(', ');
          
        toast({
          title: language === 'th' ? 'กรุณาระบุข้อมูลเพิ่มเติม' : 'Please provide additional information',
          description: language === 'th' 
            ? `กรุณาระบุ: ${missingFieldsText}`
            : `Please specify: ${missingFieldsText}`,
          variant: "destructive"
        });
      } else {
        // ถ้าครบทุกช่อง แสดง success message
        toast({
          title: language === 'th' ? 'สำเร็จ' : 'Success',
          description: language === 'th' 
            ? 'ข้อมูลครบถ้วนแล้ว พร้อมส่งคำขอ'
            : 'All required fields completed. Ready to submit.',
          variant: "default"
        });
      }
    }
  };

  const handleFormDataChange = (newFormData: ComputerEquipmentFormData) => {
    setFormData(newFormData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center">
                ระบบขอยืมอุปกรณ์คอมพิวเตอร์
              </h1>
              <p className="text-center text-gray-600 mt-1 text-xs md:text-sm">
                คณะแพทยศาสตร์ศิริราชพยาบาล มหาวิทยาลัยมหิดล
              </p>
            </div>
            
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Grid */}
      <div className="max-w-7xl mx-auto p-2 md:p-4">
        {/* Desktop: 3 columns ≥1024px, Tablet: 2 columns 768-1023px */}
        <div className="hidden md:block">
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-4 h-[calc(100vh-140px)]">
            {/* Chat Interface - Full width on tablet, 1/3 on desktop */}
            <div className="lg:col-span-1 md:col-span-2 lg:col-span-1">
              <ChatInterface onMessageSent={handleMessageSent} />
            </div>

            {/* Form Part 1 - 1/2 on tablet, 1/3 on desktop */}
            <div className="lg:col-span-1 md:col-span-1">
              <ComputerEquipmentFormPart1 
                formData={formData} 
                onFormDataChange={handleFormDataChange}
              />
            </div>

            {/* Form Part 2 - 1/2 on tablet, 1/3 on desktop */}
            <div className="lg:col-span-1 md:col-span-1">
              <ComputerEquipmentFormPart2 
                formData={formData} 
                onFormDataChange={handleFormDataChange}
              />
            </div>
          </div>
        </div>

        {/* Mobile Layout: 1 column <768px */}
        <div className="md:hidden">
          {/* Mobile Navigation */}
          <div className="mb-4">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <Button
                variant={!isMobileMenuOpen ? "default" : "outline"}
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="whitespace-nowrap"
              >
                แชท
              </Button>
              <Button
                variant={isMobileMenuOpen ? "default" : "outline"}
                size="sm"
                onClick={() => setIsMobileMenuOpen(true)}
                className="whitespace-nowrap"
              >
                แบบฟอร์ม
              </Button>
            </div>
          </div>

          {/* Mobile Content */}
          <div className="h-[calc(100vh-200px)]">
            {!isMobileMenuOpen ? (
              <ChatInterface onMessageSent={handleMessageSent} />
            ) : (
              <div className="space-y-4 overflow-y-auto h-full">
                <ComputerEquipmentFormPart1 
                  formData={formData} 
                  onFormDataChange={handleFormDataChange}
                />
                <ComputerEquipmentFormPart2 
                  formData={formData} 
                  onFormDataChange={handleFormDataChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeColumnLayout;
