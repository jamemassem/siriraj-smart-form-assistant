
// src/components/ChatInterface.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { ComputerEquipmentFormData, convertSmartFormToFormData } from '@/types/formTypes';
import { toast } from '@/hooks/use-toast';
import * as openRouter from '@/services/openRouter';

interface Message {
  id: string;
  text: string;
  role: 'user' | 'assistant';
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
    // Welcome message only once on initial render
    setMessages([{ 
        id: '1', 
        text: 'สวัสดีครับ ระบบช่วยกรอกแบบฟอร์มอัตโนมัติ โปรดแจ้งความประสงค์ของท่านได้เลยครับ', 
        role: 'assistant' 
    }]);
  }, []); // Empty dependency array ensures this runs only once

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userInput = inputValue;
    const newMessages: Message[] = [...messages, { id: Date.now().toString(), text: userInput, role: 'user' }];
    
    setIsProcessing(true);
    setMessages(newMessages);
    setInputValue('');

    try {
      const history = newMessages.map(m => ({ role: m.role, content: m.text }));
      const extractedData = await openRouter.getLLMResponse(history, userInput);
      
      if (Object.keys(extractedData).length > 0) {
        const converted = convertSmartFormToFormData(extractedData);
        const nextFormData = { ...formData, ...converted };
        onFormDataChange(nextFormData);

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
          setMessages(prev => [...prev, { id: Date.now().toString(), text: questions[firstMissingField] || 'กรุณาระบุข้อมูลเพิ่มเติมครับ', role: 'assistant' }]);
        } else {
          setMessages(prev => [...prev, { id: Date.now().toString(), text: 'ข้อมูลในแบบฟอร์มครบถ้วนแล้วครับ กรุณาตรวจสอบความถูกต้องอีกครั้งก่อนส่งคำขอ', role: 'assistant' }]);
        }
      } else {
        const generalResponse = await openRouter.getGeneralResponse(userInput);
        setMessages(prev => [...prev, { id: Date.now().toString(), text: generalResponse || "ขออภัยค่ะ ไม่เข้าใจคำถาม ลองใหม่อีกครั้งนะคะ", role: 'assistant' }]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => [...prev, { id: Date.now().toString(), text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง', role: 'assistant' }]);
      toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' });
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
        <p className="text-xs text-gray-600 mt-1">แชทบอทอัจฉริยะใช้ Gemini 2.0 Flash</p>
      </CardHeader>
      <CardContent ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
            </div>
          </div>
        ))}
        {isProcessing && <div className="text-center text-sm text-gray-500">กำลังประมวลผล...</div>}
      </CardContent>
      <div className="flex-none p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            placeholder="พิมพ์ข้อความ..."
            className="flex-1 text-base"
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
