
import React, { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import ComputerEquipmentFormPart1 from '@/components/ComputerEquipmentFormPart1';
import ComputerEquipmentFormPart2 from '@/components/ComputerEquipmentFormPart2';
import { useLanguage } from '@/contexts/LanguageContext';
import { ComputerEquipmentFormData } from '@/types/formTypes';

const ThreeColumnLayout: React.FC = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800 text-center">
            {t('title')}
          </h1>
          <p className="text-center text-gray-600 mt-1 text-sm">
            คณะแพทยศาสตร์ศิริราชพยาบาล มหาวิทยาลัยมหิดล
          </p>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-140px)]">
          {/* Left Column - Chat Interface */}
          <div className="lg:col-span-1">
            <ChatInterface onMessageSent={handleMessageSent} />
          </div>

          {/* Middle Column - Form Part 1 */}
          <div className="lg:col-span-1">
            <ComputerEquipmentFormPart1 
              formData={formData} 
              onFormDataChange={handleFormDataChange}
            />
          </div>

          {/* Right Column - Form Part 2 */}
          <div className="lg:col-span-1">
            <ComputerEquipmentFormPart2 
              formData={formData} 
              onFormDataChange={handleFormDataChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeColumnLayout;
