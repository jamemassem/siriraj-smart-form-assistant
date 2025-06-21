
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Settings, Users, MessageSquare, Paperclip, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ComputerEquipmentFormData } from '@/types/formTypes';

interface ComputerEquipmentFormPart2Props {
  formData: ComputerEquipmentFormData;
  onFormDataChange: (data: ComputerEquipmentFormData) => void;
}

const ComputerEquipmentFormPart2: React.FC<ComputerEquipmentFormPart2Props> = ({ 
  formData, 
  onFormDataChange 
}) => {
  const { t } = useLanguage();
  const [localFormData, setLocalFormData] = useState<ComputerEquipmentFormData>(formData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const errorRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    setLocalFormData(formData);
  }, [formData]);

  const handleFieldChange = (field: keyof ComputerEquipmentFormData, value: string | string[] | File[]) => {
    const updatedData = { ...localFormData, [field]: value };
    setLocalFormData(updatedData);
    onFormDataChange(updatedData);
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBasicSoftwareChange = (checked: boolean) => {
    if (checked) {
      handleFieldChange('basicSoftware', ['basic']);
    } else {
      handleFieldChange('basicSoftware', []);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    files.forEach(file => {
      if (file.size > maxSize) {
        errors.push(`ไฟล์ ${file.name} มีขนาดเกิน 10 MB`);
      } else if (!allowedTypes.includes(file.type)) {
        errors.push(`ไฟล์ ${file.name} ประเภทไม่ถูกต้อง`);
      } else {
        validFiles.push(file);
      }
    });
    
    if (errors.length > 0) {
      toast({
        title: 'ไฟล์ไม่ถูกต้อง',
        description: 'ไฟล์ต้องเป็น PDF/JPG/PNG/DOCX และไม่เกิน 10 MB',
        variant: "destructive"
      });
    }
    
    if (validFiles.length > 0) {
      const updatedFiles = [...localFormData.attachments, ...validFiles];
      handleFieldChange('attachments', updatedFiles);
    }
    
    // Reset input
    event.target.value = '';
  };

  const removeFile = (index: number) => {
    const updatedFiles = localFormData.attachments.filter((_, i) => i !== index);
    handleFieldChange('attachments', updatedFiles);
  };

  const scrollToError = (fieldName: string) => {
    const element = errorRefs.current[fieldName];
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!localFormData.phone.trim()) {
      errors.phone = 'กรุณากรอกหมายเลขโทรศัพท์';
    }
    if (!localFormData.subject.trim()) {
      errors.subject = 'กรุณากรอกหัวข้อเรื่อง';
    }
    if (!localFormData.equipmentType) {
      errors.equipmentType = 'กรุณาเลือกประเภทอุปกรณ์';
    }
    if (!localFormData.purpose.trim()) {
      errors.purpose = 'กรุณาระบุวัตถุประสงค์';
    }
    if (!localFormData.startDate) {
      errors.startDate = 'กรุณาเลือกวันที่เริ่มต้น';
    }
    if (!localFormData.startTime) {
      errors.startTime = 'กรุณาเลือกเวลาเริ่มต้น';
    }
    if (!localFormData.endDate) {
      errors.endDate = 'กรุณาเลือกวันที่สิ้นสุด';
    }
    if (!localFormData.endTime) {
      errors.endTime = 'กรุณาเลือกเวลาสิ้นสุด';
    }
    if (!localFormData.installLocation.trim()) {
      errors.installLocation = 'กรุณาระบุสถานที่ติดตั้ง';
    }
    if (!localFormData.coordinatorName.trim()) {
      errors.coordinatorName = 'กรุณากรอกชื่อผู้ประสานงาน';
    }
    if (!localFormData.coordinatorPhone.trim()) {
      errors.coordinatorPhone = 'กรุณากรอกเบอร์โทรผู้ประสานงาน';
    }
    if (!localFormData.receiveDateTime.trim()) {
      errors.receiveDateTime = 'กรุณาระบุวันเวลาที่รับ';
    }
    
    setValidationErrors(errors);
    
    // Scroll to first error
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      setTimeout(() => scrollToError(firstErrorField), 100);
    }
    
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'ข้อมูลไม่ครบถ้วน',
        description: 'กรุณากรอกข้อมูลในช่องที่แสดงสีแดงให้ครบถ้วน',
        variant: "destructive"
      });
      return;
    }

    toast({
      title: 'ส่งคำขอสำเร็จ',
      description: 'คำขอยืมอุปกรณ์ของท่านได้รับการบันทึกแล้ว',
    });
    
    console.log('Computer Equipment Form submitted:', localFormData);
  };

  return (
    <Card className="h-full">
      <CardHeader className="bg-[#29A9EF] text-white">
        <CardTitle className="text-white font-bold">
          รายละเอียดติดตั้งและผู้เกี่ยวข้อง
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Installation Location Section */}
          <div className="space-y-4">
            <div className="bg-[#29A9EF] text-white p-3 font-bold rounded">
              <h3 className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                สถานที่ติดตั้ง
              </h3>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                สถานที่ติดตั้ง <span className="text-red-500">*</span>
              </Label>
              <Input
                ref={(el) => errorRefs.current.installLocation = el}
                value={localFormData.installLocation}
                onChange={(e) => handleFieldChange('installLocation', e.target.value)}
                placeholder="เช่น ห้องประชุม A ชั้น 2 อาคารศิริราช"
                className={validationErrors.installLocation ? 'border-red-500' : ''}
              />
              {validationErrors.installLocation && (
                <p className="text-xs text-red-600">{validationErrors.installLocation}</p>
              )}
            </div>
          </div>

          {/* Software Section */}
          <div className="space-y-4">
            <div className="bg-[#29A9EF] text-white p-3 font-bold rounded">
              <h3 className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                โปรแกรม
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="basicSoftware"
                  checked={localFormData.basicSoftware.includes('basic')}
                  onCheckedChange={handleBasicSoftwareChange}
                />
                <div className="space-y-1">
                  <Label htmlFor="basicSoftware" className="text-sm leading-relaxed">
                    Windows 7 32 bit, MS Office 2007-2010, Ashampoo burning 6.0 (freeware ไร้ท์แผ่น cd +dvd), 
                    Adobe acrobate reader v.11 (freeware auto update version), IE 11 ,Google chorm (bownser), 
                    IBM v.9.0 (Lotus note) สารบรรณทั่วไป, โปรแกรมพื้นฐานที่มากับ Windows 7
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Software Section */}
          <div className="space-y-4">
            <div className="bg-[#29A9EF] text-white p-3 font-bold rounded">
              <h3>โปรแกรมเพิ่มเติม</h3>
            </div>
            
            <RadioGroup 
              value={localFormData.additionalSoftware} 
              onValueChange={(value: 'no' | 'yes') => handleFieldChange('additionalSoftware', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no-additional" />
                <Label htmlFor="no-additional">ไม่ต้องการ</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes-additional" />
                <Label htmlFor="yes-additional">ต้องการ</Label>
              </div>
            </RadioGroup>
            
            {localFormData.additionalSoftware === 'yes' && (
              <div className="space-y-2">
                <Input
                  value={localFormData.additionalSoftwareDetails}
                  onChange={(e) => handleFieldChange('additionalSoftwareDetails', e.target.value)}
                  placeholder="โปรดระบุชื่อโปรแกรมที่ต้องการเพิ่มเติม"
                />
              </div>
            )}
          </div>

          {/* Coordinator Section */}
          <div className="space-y-4">
            <div className="bg-[#29A9EF] text-white p-3 font-bold rounded">
              <h3 className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                ผู้ประสานงาน
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  ชื่อผู้ประสานงาน <span className="text-red-500">*</span>
                </Label>
                <Input
                  ref={(el) => errorRefs.current.coordinatorName = el}
                  value={localFormData.coordinatorName}
                  onChange={(e) => handleFieldChange('coordinatorName', e.target.value)}
                  placeholder="ชื่อ-นามสกุล ผู้ประสานงาน"
                  className={validationErrors.coordinatorName ? 'border-red-500' : ''}
                />
                {validationErrors.coordinatorName && (
                  <p className="text-xs text-red-600">{validationErrors.coordinatorName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  เบอร์โทรศัพท์ผู้ประสานงาน <span className="text-red-500">*</span>
                </Label>
                <Input
                  ref={(el) => errorRefs.current.coordinatorPhone = el}
                  value={localFormData.coordinatorPhone}
                  onChange={(e) => handleFieldChange('coordinatorPhone', e.target.value)}
                  placeholder="หมายเลขโทรศัพท์"
                  className={validationErrors.coordinatorPhone ? 'border-red-500' : ''}
                />
                {validationErrors.coordinatorPhone && (
                  <p className="text-xs text-red-600">{validationErrors.coordinatorPhone}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">ผู้รับ</Label>
                <Input
                  value={localFormData.receiver}
                  onChange={(e) => handleFieldChange('receiver', e.target.value)}
                  placeholder="ชื่อผู้รับอุปกรณ์"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  วันเวลาที่รับ <span className="text-red-500">*</span>
                </Label>
                <Input
                  ref={(el) => errorRefs.current.receiveDateTime = el}
                  type="datetime-local"
                  value={localFormData.receiveDateTime}
                  onChange={(e) => handleFieldChange('receiveDateTime', e.target.value)}
                  className={validationErrors.receiveDateTime ? 'border-red-500' : ''}
                />
                {validationErrors.receiveDateTime && (
                  <p className="text-xs text-red-600">{validationErrors.receiveDateTime}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes and Attachments Section */}
          <div className="space-y-4">
            <div className="bg-[#29A9EF] text-white p-3 font-bold rounded">
              <h3 className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                หมายเหตุและเอกสารแนบ
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">หมายเหตุ</Label>
                <Textarea
                  value={localFormData.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                  className="min-h-[80px] resize-none"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">สิ่งที่ส่งมาด้วย</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" asChild>
                        <span>
                          <Paperclip className="w-4 h-4 mr-2" />
                          แนบไฟล์
                        </span>
                      </Button>
                    </Label>
                    <span className="text-xs text-gray-500">PDF, JPG, PNG, DOCX (ไม่เกิน 10MB)</span>
                  </div>
                  
                  {localFormData.attachments.length > 0 && (
                    <div className="space-y-1">
                      {localFormData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Paperclip className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700 flex-1">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            {(file.size / (1024 * 1024)).toFixed(1)} MB
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 transition-all duration-200"
            >
              <Send className="w-4 h-4 mr-2" />
              ส่งคำขอยืมอุปกรณ์
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ComputerEquipmentFormPart2;
