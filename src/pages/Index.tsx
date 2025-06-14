
import React, { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import DynamicForm, { FormData } from '@/components/DynamicForm';
import { parseNaturalLanguage } from '@/utils/naturalLanguageParser';

const Index = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Smart Form Assistant
          </h1>
          <p className="text-lg text-gray-600">
            Describe what you need in natural language, and I'll fill out the form for you
          </p>
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

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Try saying: "I need to borrow a projector for my presentation next Monday from 2 PM to 4 PM"</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
