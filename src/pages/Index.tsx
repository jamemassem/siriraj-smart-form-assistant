
import React, { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import MultiPageForm from '@/components/MultiPageForm';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { ComputerEquipmentFormData } from '@/types/formTypes';

const IndexContent = () => {
  const { t } = useLanguage();
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

  const handleMessageSent = (message: string, parsedData: any) => {
    console.log('Processing message:', message);
    console.log('Parsed data:', parsedData);
    
    if (parsedData) {
      // Update form data with parsed information
      const updatedFormData = { ...formData };
      
      Object.keys(parsedData).forEach(key => {
        const value = parsedData[key];
        if (value !== undefined && value !== '' && key in updatedFormData) {
          updatedFormData[key as keyof ComputerEquipmentFormData] = value;
        }
      });
      
      setFormData(updatedFormData);
    }
  };

  const handleFormDataChange = (newFormData: ComputerEquipmentFormData) => {
    setFormData(newFormData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Language Switcher */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 text-center">
              {t('title')}
            </h1>
            <p className="text-center text-gray-600 mt-2 text-sm">
              คณะแพทยศาสตร์ศิริราชพยาบาล มหาวิทยาลัยมหิดล
            </p>
          </div>
          <div className="ml-4">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Left Panel - Chat Interface */}
          <div className="order-2 lg:order-1">
            <ChatInterface onMessageSent={handleMessageSent} />
          </div>

          {/* Right Panel - Multi-Page Form */}
          <div className="order-1 lg:order-2">
            <MultiPageForm 
              formData={formData} 
              onFormDataChange={handleFormDataChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <LanguageProvider>
      <IndexContent />
    </LanguageProvider>
  );
};

export default Index;
