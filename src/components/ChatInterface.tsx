
import React, { useState, useEffect } from 'react';
import { Send, MessageCircle, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { llmService } from '@/services/llmService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onMessageSent: (message: string, parsedData: any) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onMessageSent }) => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: Message = {
      id: '1',
      text: language === 'th' 
        ? 'สวัสดีครับ ผมเป็นผู้ช่วยในการกรอกแบบฟอร์มอัตโนมัติ\nพิมพ์หรือพูดได้เลย เช่น\n"ขอยืมโปรเจคเตอร์ศุกร์หน้า 13:00–15:00 ที่ห้องประชุมชั้น 2"\n\nHello! I\'m a Smart Form Assistant.\nJust tell me something like:\n"I want to borrow a projector next Friday from 1 PM to 3 PM."\nI\'ll fill the form automatically.'
        : 'Hello! I\'m a Smart Form Assistant.\nJust tell me something like:\n"I want to borrow a projector next Friday from 1 PM to 3 PM."\nI\'ll fill the form automatically.\n\nสวัสดีครับ ผมเป็นผู้ช่วยในการกรอกแบบฟอร์มอัตโนมัติ\nพิมพ์หรือพูดได้เลย เช่น\n"ขอยืมโปรเจคเตอร์ศุกร์หน้า 13:00–15:00 ที่ห้องประชุมชั้น 2"',
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    
    // Initialize LLM service
    llmService.initialize();

    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = language === 'th' ? 'th-TH' : 'en-US';
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };
      
      recognitionInstance.onerror = () => {
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, [language]);

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.lang = language === 'th' ? 'th-TH' : 'en-US';
      recognition.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    const currentInput = inputValue;
    setInputValue('');

    try {
      // Detect language and check if it's an equipment request
      const detectedLanguage = llmService.detectLanguage(currentInput);
      const isRequest = llmService.isEquipmentRequest(currentInput);
      
      console.log('Detected language:', detectedLanguage, 'Is request:', isRequest);
      
      let parsedData = null;
      let responseMessage = '';
      
      // If it's an equipment request, parse it and update form
      if (isRequest) {
        parsedData = await llmService.parseEquipmentRequest(currentInput);
        onMessageSent(currentInput, parsedData);
        
        // Check for missing required fields and generate appropriate response
        const missingFields = [];
        if (!parsedData.purpose) missingFields.push(detectedLanguage === 'th' ? 'วัตถุประสงค์ในการยืม' : 'purpose');
        if (!parsedData.startDate || !parsedData.startTime) missingFields.push(detectedLanguage === 'th' ? 'วันและเวลาที่ต้องการใช้งาน' : 'start date/time');
        if (!parsedData.installLocation) missingFields.push(detectedLanguage === 'th' ? 'สถานที่ติดตั้ง' : 'installation location');
        
        if (missingFields.length > 0) {
          responseMessage = detectedLanguage === 'th' 
            ? `ได้กรอกข้อมูลบางส่วนให้แล้วครับ ✅\n\nยังต้องการข้อมูลเพิ่มเติม:\n${missingFields.map(field => `❗ กรุณาระบุ${field}`).join('\n')}`
            : `I've filled in some information for you ✅\n\nStill need:\n${missingFields.map(field => `❗ Please specify ${field}`).join('\n')}`;
        } else {
          responseMessage = llmService.generateResponse(currentInput, detectedLanguage, true);
        }
      } else {
        // Generate AI response for general conversation
        responseMessage = llmService.generateResponse(currentInput, detectedLanguage, false);
      }
      
      // Add assistant response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: responseMessage,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsProcessing(false);
      }, 500);
      
    } catch (error) {
      console.error('Error processing message:', error);
      setIsProcessing(false);
      
      // Fallback response
      const fallbackResponse = language === 'th' 
        ? "ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้งครับ 🙏"
        : "Sorry, there was an error processing your request. Please try again. 🙏";
        
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          ผู้ช่วยกรอกแบบฟอร์มอัตโนมัติ
        </CardTitle>
        <p className="text-xs text-gray-600 mt-1">
          {language === 'th' ? '💬 คุยได้ทุกเรื่อง | 📝 ขอยืมอุปกรณ์ได้เลย | 🎤 พูดได้' : '💬 Chat about anything | 📝 Request equipment easily | 🎤 Voice input'}
        </p>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col h-full">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  <p className={`text-xs mt-2 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-sm p-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={language === 'th' ? 'พิมพ์ข้อความหรือใช้เสียง...' : 'Type a message or use voice...'}
              className="flex-1 text-base resize-none"
              disabled={isProcessing}
            />
            {recognition && (
              <Button
                onClick={isListening ? stopListening : startListening}
                className={`px-3 transition-colors ${
                  isListening 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
                disabled={isProcessing}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            )}
            <Button 
              onClick={handleSendMessage} 
              className="px-4 bg-blue-600 hover:bg-blue-700 transition-colors"
              disabled={isProcessing || !inputValue.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {language === 'th' 
              ? 'Enter = ส่ง | Shift+Enter = บรรทัดใหม่ | 🎤 = เสียง'
              : 'Enter = Send | Shift+Enter = New line | 🎤 = Voice'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
