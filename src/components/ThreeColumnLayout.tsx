
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatInterface from '@/components/ChatInterface';
import ComputerEquipmentFormPart1 from '@/components/ComputerEquipmentFormPart1';
import ComputerEquipmentFormPart2 from '@/components/ComputerEquipmentFormPart2';
import { useLanguage } from '@/contexts/LanguageContext';
import { ComputerEquipmentFormData, SmartFormData } from '@/types/formTypes';

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
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-4 page-grid" style={{height: 'calc(100vh - 140px)'}}>
            {/* Chat Interface - Full width on tablet, 1/3 on desktop */}
            <div className="lg:col-span-1 md:col-span-2 lg:col-span-1">
              <ChatInterface 
                formData={formData}
                onFormDataChange={handleFormDataChange}
              />
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
          <div style={{height: 'calc(100vh - 200px)'}}>
            {!isMobileMenuOpen ? (
              <ChatInterface 
                formData={formData}
                onFormDataChange={handleFormDataChange}
              />
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
