
import React, { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import DynamicForm, { FormData } from '@/components/DynamicForm';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { parseNaturalLanguage } from '@/utils/naturalLanguageParser';

const IndexContent = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    formType: '',
    category: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    userName: '',
    department: '',
    contact: ''
  });

  const handleMessageSent = (message: string) => {
    console.log('Processing message:', message);
    
    const parsedData = parseNaturalLanguage(message);
    console.log('Parsed data:', parsedData);
    
    // Update form data with parsed information
    const updatedFormData = { ...formData };
    
    Object.keys(parsedData).forEach(key => {
      const value = parsedData[key as keyof typeof parsedData];
      if (value) {
        updatedFormData[key as keyof FormData] = value;
      }
    });
    
    setFormData(updatedFormData);
  };

  const handleFormDataChange = (newFormData: FormData) => {
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

          {/* Right Panel - Dynamic Form */}
          <div className="order-1 lg:order-2">
            <DynamicForm 
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
