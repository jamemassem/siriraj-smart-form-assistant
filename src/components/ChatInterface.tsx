
// src/components/ChatInterface.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { ComputerEquipmentFormData, convertSmartFormToFormData, SmartFormData } from '@/types/formTypes';
import { toast } from '@/hooks/use-toast';
import ApiKeyModal from '@/components/ApiKeyModal';
import * as openRouter from '@/services/openRouter';

interface Message {
  id: string;
  text: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatInterfaceProps {
  formData: ComputerEquipmentFormData;
  onFormDataChange: (newFormData: ComputerEquipmentFormData) => void;
}

const priorityFieldOrder: (keyof ComputerEquipmentFormData)[] = [
  'equipmentType', 'startDate', 'startTime', 'endDate', 'endTime', 
  'installLocation', 'purpose', 'coordinatorName', 'coordinatorPhone', 'phone'
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ formData, onFormDataChange }) => {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      text: language === 'th' 
        ? 'สวัสดีครับ ระบบช่วยกรอกแบบฟอร์มอัตโนมัติ โปรดแจ้งความประสงค์ของท่านได้เลยครับ'
        : 'Hello! I am the Smart Form Assistant. Please state your request.',
      role: 'assistant',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [language]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);
  
  const addMessage = (text: string, role: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      role,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    setIsProcessing(true);
    const userInput = inputValue;
    setInputValue('');
    addMessage(userInput, 'user');

    try {
      // 1. Get LLM response (data extraction OR empty object)
      const history = messages.map(m => ({ role: m.role, content: m.text }));
      const extractedData = await openRouter.getLLMResponse(history, userInput);
      console.log("Extracted Data:", extractedData);

      // 2. Check if the response is for data extraction or general chat
      if (Object.keys(extractedData).length > 0) {
        // --- DATA EXTRACTION FLOW ---
        
        // 3. Create the next version of the form data
        const converted = convertSmartFormToFormData(extractedData);
        const nextFormData = { ...formData };
        Object.keys(converted).forEach(key => {
          const typedKey = key as keyof ComputerEquipmentFormData;
          const value = converted[typedKey];
          if (value !== null && value !== undefined && value !== '') {
            (nextFormData as any)[typedKey] = value;
          }
        });

        // 4. Update the UI form state
        onFormDataChange(nextFormData);
        
        // 5. Check for the next missing field USING the new `nextFormData`
        const firstMissingField = priorityFieldOrder.find(field => !nextFormData[field]);

        if (firstMissingField) {
          const questions: Record<string, string> = {
              equipmentType: 'ต้องการยืมอุปกรณ์ประเภทใดครับ (เช่น โปรเจคเตอร์, โน้ตบุ๊ก)',
              startDate: 'ต้องการใช้งานวันไหนครับ',
              startTime: 'ต้องการเริ่มใช้งานเวลาใดครับ',
              endDate: 'จะใช้งานจนถึงวันไหนครับ',
              endTime: 'จะใช้งานจนถึงเวลาใดครับ',
              installLocation: 'ต้องการติดตั้งหรือใช้งานที่ไหนครับ',
              purpose: 'ต้องการใช้เพื่อวัตถุประสงค์อะไรครับ',
              coordinatorName: 'ใครจะเป็นผู้ประสานงานสำหรับคำขอนี้ครับ',
              coordinatorPhone: 'ขอเบอร์โทรศัพท์ของผู้ประสานงานด้วยครับ',
              phone: 'ขอเบอร์โทรศัพท์ติดต่อกลับของผู้ยืมด้วยครับ',
          };
          addMessage(questions[firstMissingField] || 'กรุณาระบุข้อมูลเพิ่มเติมครับ', 'assistant');
        } else {
          addMessage('ข้อมูลในแบบฟอร์มครบถ้วนแล้วครับ กรุณาตรวจสอบความถูกต้องอีกครั้งก่อนส่งคำขอ', 'assistant');
        }

      } else {
        // --- GENERAL CONVERSATION FLOW ---
        const generalResponse = await openRouter.getGeneralResponse(userInput);
        addMessage(generalResponse, 'assistant');
      }

    } catch (error) {
      console.error('Error processing message:', error);
      toast({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถประมวลผลคำขอได้', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 flex-none">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            แชทบอทช่วยกรอกแบบฟอร์ม
          </CardTitle>
          <p className="text-xs text-gray-600 mt-1">แชทบอทอัจฉริยะใช้ Gemini 2.0 Flash | รองรับเสียง | ตรวจสอบอัตโนมัติ</p>
        </CardHeader>
      <CardContent ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
              <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start"><div className="bg-gray-100 text-gray-800 rounded-lg p-3"><div className="flex items-center gap-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div></div></div></div>
        )}
      </CardContent>
      <div className="flex-none p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            placeholder={language === 'th' ? 'พิมพ์ข้อความ...' : 'Type a message...'}
            className="flex-1 text-base resize-none"
            disabled={isProcessing}
          />
          <Button onClick={handleSendMessage} className="px-4 bg-blue-600 hover:bg-blue-700" disabled={isProcessing || !inputValue.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;
