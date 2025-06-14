
import React, { useState } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onMessageSent: (message: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onMessageSent }) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t('initialMessage'),
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  // Function to detect if text is primarily English
  const isEnglish = (text: string): boolean => {
    const englishWords = text.match(/[a-zA-Z]+/g) || [];
    const thaiChars = text.match(/[\u0E00-\u0E7F]/g) || [];
    return englishWords.length > thaiChars.length;
  };

  // Generate contextual AI response based on user input
  const generateAIResponse = (userInput: string): string => {
    const isUserEnglish = isEnglish(userInput);
    const lowerInput = userInput.toLowerCase();
    
    // Conversational responses based on context
    if (isUserEnglish) {
      // English conversational responses
      if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
        return "You're welcome! Is there anything else I can help you with for your form?";
      }
      if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        return "Hello! I'm here to help you fill out forms. Just tell me what you need - like borrowing equipment or booking a room.";
      }
      if (lowerInput.includes('help')) {
        return "Of course! I can help you fill out various forms. For example, you can say things like 'I need to borrow a projector for tomorrow afternoon' or 'Book a meeting room for Friday morning'. What do you need help with?";
      }
      if (lowerInput.includes('borrow') || lowerInput.includes('need') || lowerInput.includes('request')) {
        return "Perfect! I've filled out the form based on what you told me. Please take a look at the details on the right and let me know if you'd like me to adjust anything.";
      }
      if (lowerInput.includes('book') || lowerInput.includes('reserve')) {
        return "Great! I've set up the booking form for you. Please review the information I've filled in and make any changes if needed before submitting.";
      }
      return "Got it! I've updated the form with your request. Please check the details on the right side and feel free to modify anything before submitting.";
    } else {
      // Thai formal responses
      if (lowerInput.includes('ขอบคุณ') || lowerInput.includes('ขอบใจ')) {
        return "ยินดีเป็นอย่างยิ่งครับ/ค่ะ หากท่านต้องการความช่วยเหลือเพิ่มเติมเกี่ยวกับแบบฟอร์ม กรุณาแจ้งให้ทราบครับ/ค่ะ";
      }
      if (lowerInput.includes('สวัสดี') || lowerInput.includes('หวัดดี') || lowerInput.includes('ฮัลโหล')) {
        return "สวัสดีครับ/ค่ะ กระผมเป็นระบบช่วยเหลือในการกรอกแบบฟอร์มต่างๆ เช่น การยืมอุปกรณ์ การจองห้อง หรือการขอใช้บริการต่างๆ ท่านสามารถบอกความต้องการได้เลยครับ/ค่ะ";
      }
      if (lowerInput.includes('ช่วย') || lowerInput.includes('ไม่รู้') || lowerInput.includes('งง')) {
        return "ได้เลยครับ/ค่ะ กระผมสามารถช่วยกรอกแบบฟอร์มได้หลายประเภท เช่น 'ขอยืมเครื่องฉายภาพวันพรุ่งนี้ช่วงบ่าย' หรือ 'จองห้องประชุมวันศุกร์ช่วงเช้า' ท่านต้องการความช่วยเหลือเรื่องใดครับ/ค่ะ";
      }
      if (lowerInput.includes('ยืม') || lowerInput.includes('ขอ') || lowerInput.includes('ต้องการ')) {
        return "เรียบร้อยครับ/ค่ะ กระผมได้ดำเนินการกรอกแบบฟอร์มตามคำขอของท่านแล้ว กรุณาตรวจสอบรายละเอียดทางด้านขวา และแจ้งให้ทราบหากต้องการแก้ไขข้อมูลใดครับ/ค่ะ";
      }
      if (lowerInput.includes('จอง') || lowerInput.includes('ห้อง')) {
        return "ดีมากครับ/ค่ะ กระผมได้จัดเตรียมแบบฟอร์มการจองให้ท่านแล้ว กรุณาตรวจสอบข้อมูลที่กระผมได้กรอกให้ และแก้ไขตามความเหมาะสมก่อนส่งครับ/ค่ะ";
      }
      return "เข้าใจแล้วครับ/ค่ะ กระผมได้ปรับปรุงแบบฟอร์มตามคำขอของท่านแล้ว กรุณาตรวจสอบรายละเอียดทางด้านขวา และสามารถแก้ไขได้ตามความต้องการก่อนส่งครับ/ค่ะ";
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    onMessageSent(inputValue);
    
    const currentInput = inputValue;
    setInputValue('');

    // Add assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(currentInput),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">{t('chatTitle')}</h2>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('chatPlaceholder')}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} className="px-4 bg-blue-600 hover:bg-blue-700">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
