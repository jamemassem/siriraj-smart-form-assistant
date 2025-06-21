import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Mic, MicOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { openRouterService } from '@/services/openRouter';
import { toast } from '@/hooks/use-toast';

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
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const apiKeyInputRef = useRef<HTMLInputElement>(null);

  // Check if speech recognition is available
  const isSpeechAvailable = typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: Message = {
      id: '1',
      text: language === 'th' 
        ? 'ระบบช่วยกรอกแบบฟอร์มอัตโนมัติ\nกรุณาพิมพ์หรือบอกความต้องการ เช่น\n"ขอยืมโปรเจคเตอร์วันศุกร์หน้า เวลา 13:00-15:00 ที่ห้องประชุมชั้น 2"\n\nระบบจะกรอกแบบฟอร์มให้โดยอัตโนมัติ'
        : 'Smart Form Assistant\nPlease type or tell me your request, for example:\n"I want to borrow a projector next Friday from 1 PM to 3 PM in meeting room on 2nd floor"\n\nThe system will automatically fill the form for you.',
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);

    // Initialize Speech Recognition if available
    if (isSpeechAvailable) {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const recognitionInstance = new SpeechRecognitionClass() as SpeechRecognition;
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = language === 'th' ? 'th-TH' : 'en-US';
        
        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
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
    }
  }, [language, isSpeechAvailable]);

  const startListening = () => {
    if (recognition && !isListening && isSpeechAvailable) {
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

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      openRouterService.setApiKey(apiKey);
      setShowApiKeyInput(false);
      toast({
        title: language === 'th' ? 'ตั้งค่า API Key สำเร็จ' : 'API Key Set Successfully',
        description: language === 'th' ? 'สามารถใช้งานระบบได้แล้ว' : 'System is now ready to use',
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    if (!apiKey) {
      setShowApiKeyInput(true);
      toast({
        title: language === 'th' ? 'ต้องการ API Key' : 'API Key Required',
        description: language === 'th' ? 'กรุณากรอก OpenRouter API Key เพื่อใช้งาน' : 'Please enter OpenRouter API Key to continue',
        variant: "destructive"
      });
      return;
    }

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
      const detectedLanguage = openRouterService.detectLanguage(currentInput);
      const isRequest = openRouterService.isEquipmentRequest(currentInput);
      
      console.log('Detected language:', detectedLanguage, 'Is request:', isRequest);
      
      let parsedData = null;
      let responseMessage = '';
      
      if (isRequest) {
        parsedData = await openRouterService.parseEquipmentRequest(currentInput, detectedLanguage);
        onMessageSent(currentInput, parsedData);
        
        const missingFields = [];
        if (!parsedData.purpose) missingFields.push(detectedLanguage === 'th' ? 'วัตถุประสงค์ในการยืม' : 'purpose');
        if (!parsedData.startDate || !parsedData.startTime) missingFields.push(detectedLanguage === 'th' ? 'วันและเวลาที่ต้องการใช้งาน' : 'start date/time');
        if (!parsedData.installLocation) missingFields.push(detectedLanguage === 'th' ? 'สถานที่ติดตั้ง' : 'installation location');
        
        if (missingFields.length > 0) {
          responseMessage = detectedLanguage === 'th' 
            ? `ได้อัพเดทข้อมูลในแบบฟอร์มแล้ว\n\nยังต้องการข้อมูลเพิ่มเติม:\n${missingFields.map(field => `• กรุณาระบุ${field}`).join('\n')}`
            : `Form has been updated with available information.\n\nStill need:\n${missingFields.map(field => `• Please specify ${field}`).join('\n')}`;
        } else {
          responseMessage = await openRouterService.generateResponse(currentInput, detectedLanguage, true);
        }
      } else {
        responseMessage = await openRouterService.generateResponse(currentInput, detectedLanguage, false);
      }
      
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
      
      const fallbackResponse = language === 'th' 
        ? "ขออภัย เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง"
        : "Sorry, there was an error processing your request. Please try again.";
        
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

  if (showApiKeyInput) {
    return (
      <Card className="h-full">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Settings className="w-5 h-5 text-blue-600" />
            การตั้งค่า API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {language === 'th' 
                ? 'กรุณากรอก OpenRouter API Key เพื่อใช้งานระบบ'
                : 'Please enter your OpenRouter API Key to use the system'
              }
            </p>
            <Input
              ref={apiKeyInputRef}
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              onKeyPress={(e) => e.key === 'Enter' && handleApiKeySubmit()}
            />
            <div className="flex gap-2">
              <Button onClick={handleApiKeySubmit} className="flex-1">
                {language === 'th' ? 'ยืนยัน' : 'Confirm'}
              </Button>
              <Button variant="outline" onClick={() => setShowApiKeyInput(false)}>
                {language === 'th' ? 'ยกเลิก' : 'Cancel'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          ระบบช่วยกรอกแบบฟอร์มอัตโนมัติ
        </CardTitle>
        <p className="text-xs text-gray-600 mt-1">
          {language === 'th' ? 'สนทนาได้ | ขอยืมอุปกรณ์ได้ | รองรับเสียง' : 'Chat available | Equipment requests | Voice supported'}
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
            {isSpeechAvailable && (
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
              ? 'Enter = ส่ง | Shift+Enter = บรรทัดใหม่'
              : 'Enter = Send | Shift+Enter = New line'
            }
            {isSpeechAvailable && (language === 'th' ? ' | ไมค์ = เสียง' : ' | Mic = Voice')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
