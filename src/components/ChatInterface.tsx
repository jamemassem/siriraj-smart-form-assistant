
import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { SmartFormData, ComputerEquipmentFormData, convertSmartFormToFormData } from '@/types/formTypes';
import { toast } from '@/hooks/use-toast';
import ApiKeyModal from '@/components/ApiKeyModal';
import * as openRouter from '@/services/openRouter';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onMessageSent: (message: string, parsedData: SmartFormData | null) => void;
  formData: ComputerEquipmentFormData;
  onFormDataChange: (newFormData: ComputerEquipmentFormData) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onMessageSent, formData, onFormDataChange }) => {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showMic, setShowMic] = useState(true);
  const recognitionRef = useRef<any>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Field name mapping for Thai error messages
  const fieldNameMap: Record<string, string> = {
    'phone': 'เบอร์โทรศัพท์',
    'subject': 'หัวข้อเรื่อง',
    'equipmentType': 'ประเภทอุปกรณ์',
    'quantity': 'จำนวน',
    'purpose': 'วัตถุประสงค์',
    'startDate': 'วันที่เริ่มต้น',
    'startTime': 'เวลาเริ่มต้น',
    'endDate': 'วันที่สิ้นสุด',
    'endTime': 'เวลาสิ้นสุด',
    'installLocation': 'สถานที่ติดตั้ง',
    'coordinatorName': 'ชื่อผู้ประสานงาน',
    'coordinatorPhone': 'เบอร์โทรผู้ประสานงาน',
    'receiveDateTime': 'วันและเวลารับของ'
  };

  // Required fields that must be filled
  const requiredFields = [
    'phone', 'subject', 'equipmentType', 'quantity', 'purpose',
    'startDate', 'startTime', 'endDate', 'endTime', 'installLocation',
    'coordinatorName', 'coordinatorPhone', 'receiveDateTime'
  ];

  // Get missing required fields
  const getMissingRequiredFields = (): string[] => {
    return requiredFields.filter(field => {
      const value = formData[field as keyof ComputerEquipmentFormData];
      return !value || value === '';
    });
  };

  // Check if API key is needed (development only)
  const needKey = !import.meta.env.VITE_OPENROUTER_API_KEY && 
                  !localStorage.getItem('or_key') &&
                  process.env.NODE_ENV !== 'production';

  // Check if speech recognition is available
  const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Auto-scroll when messages change
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
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

  const addBot = (text: string) => {
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      text,
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, assistantMessage]);
  };

  const updateForm = (extracted: any) => {
    // Convert extracted data to form format
    const smartFormData: SmartFormData = {
      employee_id: extracted.employee_id || null,
      full_name: extracted.full_name || null,
      position: extracted.position || null,
      department: extracted.department || null,
      division: extracted.division || null,
      unit: extracted.unit || null,
      phone: extracted.phone || null,
      email: extracted.email || null,
      doc_ref_no: null,
      doc_date: null,
      subject: extracted.subject || null,
      equipment_type: extracted.equipment_type || null,
      quantity: extracted.quantity || null,
      purpose: extracted.purpose || null,
      start_datetime: extracted.start_datetime || null,
      end_datetime: extracted.end_datetime || null,
      install_location: extracted.install_location || null,
      default_software: extracted.default_software || false,
      extra_software_choice: extracted.extra_software_choice || "no",
      extra_software_name: extracted.extra_software_name || null,
      coordinator: extracted.coordinator || null,
      coordinator_phone: extracted.coordinator_phone || null,
      receiver: extracted.receiver || null,
      receive_datetime: extracted.receive_datetime || null,
      remark: extracted.remark || null,
      attachment: extracted.attachment || null
    };

    const convertedData = convertSmartFormToFormData(smartFormData);
    
    // Merge with existing form data
    const updatedFormData = { ...formData };
    Object.keys(convertedData).forEach(key => {
      const value = convertedData[key as keyof ComputerEquipmentFormData];
      if (value !== undefined && value !== null && value !== '') {
        updatedFormData[key as keyof ComputerEquipmentFormData] = value as any;
      }
    });
    
    onFormDataChange(updatedFormData);
  };

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

  // NEW EXTRACT-FIRST WORKFLOW
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
    
    const userInput = inputValue;
    setInputValue('');

    try {
      // 1. Detect language
      const lang = openRouter.detectLang(userInput);
      console.log('Detected language:', lang);
      
      // 2. Check if it's an equipment request
      const isRequest = openRouter.isEquipmentRequest(userInput);
      console.log('Is equipment request:', isRequest);
      
      if (isRequest) {
        // 3. EXTRACT step → fill form
        const extracted = await openRouter.parseEquipmentRequest(userInput, lang);
        console.log('Extracted data:', extracted);
        
        if (Object.keys(extracted).length) {
          updateForm(extracted);
        }
        
        // 4. VALIDATE after merge
        const missing = getMissingRequiredFields();
        console.log('Missing fields:', missing);
        
        if (missing.length) {
          const missingFieldsText = missing
            .map(field => fieldNameMap[field] || field)
            .join('\n❗ ');
          
          addBot(lang === 'th'
            ? `โปรดระบุข้อมูลเพิ่มเติมดังนี้:\n❗ ${missingFieldsText}`
            : `Please provide the following information:\n❗ ${missing.join('\n❗ ')}`
          );
        } else {
          addBot(lang === 'th'
            ? 'ได้อัพเดตข้อมูลในแบบฟอร์มเรียบร้อยแล้ว กรุณาตรวจสอบความถูกต้องก่อนส่งครับ'
            : 'I have updated the form. Please review before submitting.'
          );
        }
      } else {
        // General chat response
        addBot(lang === 'th'
          ? 'กรุณาระบุคำขอยืมอุปกรณ์ที่ชัดเจน เช่น "ขอยืมโปรเจคเตอร์วันศุกร์หน้า เวลา 13:00-15:00"'
          : 'Please specify your equipment borrowing request clearly, e.g., "I want to borrow a projector next Friday from 1-3 PM"'
        );
      }
      
      // Notify parent component
      onMessageSent(userInput, null);
      
    } catch (error) {
      console.error('Error processing message:', error);
      
      const fallbackResponse = language === 'th' 
        ? "ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง"
        : "Sorry, there was an error processing your request. Please try again.";
        
      addBot(fallbackResponse);
      
      toast({
        title: language === 'th' ? 'ข้อผิดพลาด' : 'Error',
        description: language === 'th' ? 'เกิดข้อผิดพลาดในการประมวลผล' : 'Error processing request',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
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
            แชทบอทช่วยกรอกแบบฟอร์มอัตโนมัติ
          </CardTitle>
          <p className="text-xs text-gray-600 mt-1">
            {language === 'th' ? 'แชทบอทอัจฉริยะวิเคราะห์ภาษาไทย | รองรับเสียง | ตรวจสอบอัตโนมัติ' : 'Smart Thai AI | Voice supported | Auto validation'}
          </p>
        </CardHeader>
        
        <CardContent className="p-0 flex flex-col h-full">
          {/* Chat messages container */}
          <div 
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 chat-box"
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
          
          {/* Input section */}
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

