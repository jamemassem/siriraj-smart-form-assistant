
import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { openRouterService } from '@/services/openRouter';
import { SmartFormData } from '@/types/formTypes';
import { toast } from '@/hooks/use-toast';
import ApiKeyModal from '@/components/ApiKeyModal';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onMessageSent: (message: string, parsedData: SmartFormData | null) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onMessageSent }) => {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showMic, setShowMic] = useState(true);
  const recognitionRef = useRef<any>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Check if API key is needed (development only)
  const needKey = !import.meta.env.VITE_OPENROUTER_API_KEY && 
                  !localStorage.getItem('or_key') &&
                  process.env.NODE_ENV !== 'production';

  // Check if speech recognition is available
  const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // ✅ Auto-scroll ทุกครั้งที่ messages เปลี่ยน
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({ 
        top: chatBoxRef.current.scrollHeight,
        behavior: 'smooth' 
      });
    }
  }, [messages]);

  useEffect(() => {
    // Initialize with welcome message (professional tone, no emojis)
    const welcomeMessage: Message = {
      id: '1',
      text: language === 'th' 
        ? 'สวัสดีครับ ระบบช่วยกรอกแบบฟอร์มอัตโนมัติ โปรดแจ้งความประสงค์ของท่าน เช่น\n"ขอยืมโปรเจคเตอร์วันศุกร์หน้า เวลา 13:00-15:00 ที่ห้องประชุมชั้น 2"\n\nระบบจะกรอกแบบฟอร์มให้โดยอัตโนมัติ'
        : 'Hello! Smart Form Assistant. Please tell me your request, for example:\n"I want to borrow a projector next Friday from 1 PM to 3 PM in meeting room on 2nd floor"\n\nThe system will automatically fill the form for you.',
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);

    // Initialize Speech Recognition if available
    if (!hasSpeechRecognition) {
      setShowMic(false);
    } else {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const recognitionInstance = new SpeechRecognitionClass();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = language === 'th' ? 'th-TH' : 'en-US';
        
        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setIsListening(false);
        };
        
        recognitionInstance.onerror = () => {
          setIsListening(false);
          toast({
            title: language === 'th' ? 'ข้อผิดพลาดการรับเสียง' : 'Voice Recognition Error',
            description: language === 'th' ? 'ไม่สามารถรับเสียงได้ กรุณาลองใหม่' : 'Could not recognize voice. Please try again.',
            variant: "destructive"
          });
        };
        
        recognitionInstance.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = recognitionInstance;
      }
    }
  }, [language, hasSpeechRecognition]);

  const startListening = () => {
    if (recognitionRef.current && !isListening && hasSpeechRecognition) {
      recognitionRef.current.lang = language === 'th' ? 'th-TH' : 'en-US';
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // ✅ ปรับ workflow ตาม PATCH - extract first + validate after
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
      // ▶️ 1. Detect language + isRequest
      const isRequest = openRouterService.isEquipmentRequest(currentInput);
      const detectedLanguage = openRouterService.detectLanguage(currentInput);
      
      console.log('Detected language:', detectedLanguage, 'Is request:', isRequest);
      
      let parsedData: SmartFormData | null = null;
      
      // ▶️ 2. ถ้าเป็นคำขอยืม ให้ LLM สกัดข้อมูล
      if (isRequest) {
        parsedData = await openRouterService.parseEquipmentRequest(currentInput, detectedLanguage);
        console.log('Extracted data:', parsedData);
        
        // ▶️ 3. ส่งข้อมูลไปยัง parent component เพื่อ merge เข้า state ฟอร์ม **ก่อน** validate
        onMessageSent(currentInput, parsedData);
      } else {
        // สำหรับข้อความทั่วไป ส่ง null เป็น parsedData
        onMessageSent(currentInput, null);
      }
      
      // ▶️ 4. สร้างคำตอบ (parent จะจัดการ validation เอง)
      const responseMessage = await openRouterService.generateResponse(currentInput, detectedLanguage, isRequest);
      
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
        ? "ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ LLM กรุณาลองใหม่อีกครั้ง"
        : "Sorry, there was an error connecting to LLM. Please try again.";
        
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: language === 'th' ? 'ข้อผิดพลาด' : 'Error',
        description: language === 'th' ? 'เกิดข้อผิดพลาดในการเชื่อมต่อ LLM' : 'Error connecting to LLM',
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Development API Key Modal */}
      {needKey && (
        <ApiKeyModal onSave={(apiKey) => localStorage.setItem('or_key', apiKey)} />
      )}

      <Card className="h-full chat-panel">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 flex-none">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            เเชทบอทช่วยกรอกแบบฟอร์มอัตโนมัติ
          </CardTitle>
          <p className="text-xs text-gray-600 mt-1">
            {language === 'th' ? 'เเชทบอทอัจฉริยะวิเคราะห์ภาษาไทย | รองรับเสียง | ตรวจสอบอัตโนมัติ' : 'Smart Thai AI | Voice supported | Auto validation'}
          </p>
        </CardHeader>
        
        <CardContent className="p-0 flex flex-col h-full">
          {/* ✅ Scroll container with ref */}
          <div 
            ref={chatBoxRef}
            className="flex-1 overflow-y-auto p-4"
          >
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
          </div>
          
          {/* ✅ Input section - flex-none */}
          <div className="flex-none p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language === 'th' ? 'พิมพ์ข้อความหรือใช้เสียง...' : 'Type a message or use voice...'}
                className="flex-1 text-base resize-none"
                disabled={isProcessing}
              />
              {showMic && hasSpeechRecognition && (
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
              {showMic && hasSpeechRecognition && (language === 'th' ? ' | ไมค์ = เสียง' : ' | Mic = Voice')}
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ChatInterface;
