
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

  // Required fields mapping and priority order
  const requiredFieldsMap: Record<string, string> = {
    'equipmentType': 'ประเภทอุปกรณ์',
    'startDate': 'วันที่เริ่มใช้งาน',
    'startTime': 'เวลาเริ่มใช้งาน',
    'endDate': 'วันที่สิ้นสุดการใช้งาน',
    'endTime': 'เวลาสิ้นสุดการใช้งาน',
    'installLocation': 'สถานที่ติดตั้ง/ใช้งาน',
    'purpose': 'วัตถุประสงค์การใช้งาน',
    'coordinatorName': 'ชื่อผู้ประสานงาน',
    'coordinatorPhone': 'เบอร์โทรผู้ประสานงาน',
    'phone': 'เบอร์โทรศัพท์ผู้ขอยืม'
  };

  const priorityFieldOrder = [
    'equipmentType', 'startDate', 'startTime', 'endDate', 'endTime', 
    'installLocation', 'purpose', 'coordinatorName', 'coordinatorPhone', 'phone'
  ];

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
    // Initialize with welcome message
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

  // Get the first missing required field in priority order using specific form data
  const getFirstMissingField = (checkFormData: ComputerEquipmentFormData): string | null => {
    for (const field of priorityFieldOrder) {
      const value = checkFormData[field as keyof ComputerEquipmentFormData];
      if (!value || value === '') {
        return field;
      }
    }
    return null;
  };

  // Generate conversation context from recent messages
  const getConversationContext = (): string[] => {
    return messages.slice(-6).map(msg => 
      `${msg.isUser ? 'User' : 'Assistant'}: ${msg.text}`
    );
  };

  // Generate smart question for missing field
  const generateSmartQuestion = (missingField: string, lang: 'th' | 'en'): string => {
    const questions: Record<string, Record<string, string>> = {
      'equipmentType': {
        'th': 'ต้องการยืมอุปกรณ์ประเภทใดครับ (เช่น โปรเจคเตอร์, โน้ตบุ๊ก, หรือ อื่นๆ)',
        'en': 'What type of equipment would you like to borrow? (e.g., projector, notebook, etc.)'
      },
      'startDate': {
        'th': 'ต้องการใช้งานวันไหนครับ',
        'en': 'What date would you like to use it?'
      },
      'startTime': {
        'th': 'ต้องการเริ่มใช้งานเวลาใดครับ',
        'en': 'What time would you like to start using it?'
      },
      'endDate': {
        'th': 'จะใช้งานจนถึงวันไหนครับ',
        'en': 'Until what date will you use it?'
      },
      'endTime': {
        'th': 'จะใช้งานจนถึงเวลาใดครับ',
        'en': 'Until what time will you use it?'
      },
      'installLocation': {
        'th': 'ต้องการติดตั้งหรือใช้งานที่ไหนครับ',
        'en': 'Where would you like to install or use it?'
      },
      'purpose': {
        'th': 'ต้องการใช้เพื่อวัตถุประสงค์อะไรครับ',
        'en': 'What is the purpose of using this equipment?'
      },
      'coordinatorName': {
        'th': 'ใครจะเป็นผู้ประสานงานสำหรับคำขอนี้ครับ',
        'en': 'Who will be the coordinator for this request?'
      },
      'coordinatorPhone': {
        'th': 'เบอร์โทรของผู้ประสานงานครับ',
        'en': 'What is the coordinator\'s phone number?'
      },
      'phone': {
        'th': 'ขอเบอร์โทรศัพท์ติดต่อด้วยครับ',
        'en': 'May I have your contact phone number?'
      }
    };

    return questions[missingField]?.[lang] || 
           (lang === 'th' ? 'กรุณาระบุข้อมูลเพิ่มเติมครับ' : 'Please provide additional information');
  };

  const addBot = (text: string) => {
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      text,
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, assistantMessage]);
  };

  const updateForm = (extracted: any): ComputerEquipmentFormData => {
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
    
    // Create nextFormData by merging current formData with new convertedData
    const nextFormData = { ...formData };
    Object.keys(convertedData).forEach(key => {
      const value = convertedData[key as keyof ComputerEquipmentFormData];
      if (value !== undefined && value !== null && value !== '') {
        nextFormData[key as keyof ComputerEquipmentFormData] = value as any;
      }
    });
    
    return nextFormData;
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

  // CHAIN OF THOUGHT WORKFLOW IMPLEMENTATION
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
      // 1. [รวบรวม Context] - Get conversation history
      const conversationHistory = getConversationContext();
      
      // 2. Detect language and intent
      const lang = openRouter.detectLang(userInput);
      const isRequest = openRouter.isEquipmentRequest(userInput);
      
      if (isRequest || conversationHistory.some(msg => msg.includes('ยืม') || msg.includes('borrow'))) {
        // 3. [สกัดข้อมุล] - Extract information using context
        const extracted = await openRouter.parseEquipmentRequest(conversationHistory, userInput, lang);
        console.log('Extracted data:', extracted);
        
        // 4. [สร้างข้อมูลชุดถัดไป - CRITICAL STEP] - Create nextFormData
        let nextFormData = formData;
        if (Object.keys(extracted).length > 0) {
          nextFormData = updateForm(extracted);
        }
        
        // 5. [สั่งอัปเดต UI] - Update form with nextFormData
        onFormDataChange(nextFormData);
        
        // 6. [ตรวจสอบหาจุดถัดไป] - Check for next missing field using nextFormData
        const firstMissingField = getFirstMissingField(nextFormData);
        
        if (firstMissingField) {
          // 7. [สร้างการตอบสนองอัจฉริยะ] - Generate smart question
          const smartQuestion = generateSmartQuestion(firstMissingField, lang);
          addBot(smartQuestion);
        } else {
          // All required fields are filled
          addBot(lang === 'th'
            ? 'ข้อมูลในแบบฟอร์มครบถ้วนแล้วครับ กรุณาตรวจสอบความถูกต้องอีกครั้งก่อนส่งคำขอ'
            : 'All required information has been collected. Please review the form before submitting.'
          );
        }
        
      } else {
        // Handle general questions
        addBot(lang === 'th'
          ? 'รับทราบครับ หากมีเรื่องการยืมอุปกรณ์คอมพิวเตอร์ให้ช่วยเหลือ โปรดแจ้งมาได้เลยครับ'
          : 'I understand. If you need help with computer equipment borrowing, please let me know.'
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
            {language === 'th' ? 'แชทบอทอัจฉริยะใช้ Gemini 2.0 Flash | รองรับเสียง | ตรวจสอบอัตโนมัติ' : 'Smart AI using Gemini 2.0 Flash | Voice supported | Auto validation'}
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
