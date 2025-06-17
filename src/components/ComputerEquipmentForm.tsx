
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, Send, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export interface ComputerEquipmentFormData {
  borrowerName: string;
  position: string;
  department: string;
  phone: string;
  email: string;
  equipmentType: string;
  equipmentDetails: string;
  quantity: string;
  borrowDate: string;
  returnDate: string;
  purpose: string;
  attachments: File[];
}

interface ComputerEquipmentFormProps {
  formData: ComputerEquipmentFormData;
  onFormDataChange: (data: ComputerEquipmentFormData) => void;
}

const ComputerEquipmentForm: React.FC<ComputerEquipmentFormProps> = ({ formData, onFormDataChange }) => {
  const { t } = useLanguage();
  const [localFormData, setLocalFormData] = useState<ComputerEquipmentFormData>(formData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalFormData(formData);
  }, [formData]);

  const handleFieldChange = (field: keyof ComputerEquipmentFormData, value: string | File[]) => {
    const updatedData = { ...localFormData, [field]: value };
    setLocalFormData(updatedData);
    onFormDataChange(updatedData);
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    const validFiles = files.filter(file => allowedTypes.includes(file.type));
    if (validFiles.length !== files.length) {
      toast({
        title: 'ไฟล์ไม่ถูกต้อง',
        description: 'กรุณาเลือกไฟล์ประเภท PDF, JPG, PNG หรือ DOCX เท่านั้น',
        variant: "destructive"
      });
    }
    
    const updatedFiles = [...localFormData.attachments, ...validFiles];
    handleFieldChange('attachments', updatedFiles);
  };

  const removeFile = (index: number) => {
    const updatedFiles = localFormData.attachments.filter((_, i) => i !== index);
    handleFieldChange('attachments', updatedFiles);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!localFormData.borrowerName.trim()) {
      errors.borrowerName = t('fillRequired') + ' ' + t('borrowerName');
    }
    if (!localFormData.department.trim()) {
      errors.department = t('fillRequired') + ' ' + t('department');
    }
    if (!localFormData.phone.trim()) {
      errors.phone = t('fillRequired') + ' ' + t('phone');
    }
    if (!localFormData.equipmentType) {
      errors.equipmentType = t('fillRequired') + ' ' + t('equipmentType');
    }
    if (!localFormData.borrowDate) {
      errors.borrowDate = t('fillRequired') + ' ' + t('borrowDate');
    }
    if (!localFormData.returnDate) {
      errors.returnDate = t('fillRequired') + ' ' + t('returnDate');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: t('missingInfo'),
        description: 'กรุณากรอกข้อมูลในช่องที่มีสีแดงให้ครบถ้วน',
        variant: "destructive"
      });
      return;
    }

    toast({
      title: t('submitSuccess'),
      description: t('submitMessage'),
    });
    
    console.log('Computer Equipment Form submitted:', localFormData);
  };

  return (
    <Card className="h-full">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <FileText className="w-5 h-5 text-blue-600" />
          {t('formTitle')}
        </CardTitle>
        <p className="text-sm text-gray-600">{t('formSubtitle')}</p>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Borrower Information - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="borrowerName" className="text-sm font-medium text-gray-700">
                {t('borrowerName')} <span className="text-red-500">{t('required')}</span>
              </Label>
              <Input
                value={localFormData.borrowerName}
                onChange={(e) => handleFieldChange('borrowerName', e.target.value)}
                placeholder={t('borrowerNamePlaceholder')}
                className={validationErrors.borrowerName ? 'border-red-500' : ''}
              />
              {validationErrors.borrowerName && (
                <p className="text-red-500 text-xs">{validationErrors.borrowerName}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position" className="text-sm font-medium text-gray-700">
                {t('position')}
              </Label>
              <Input
                value={localFormData.position}
                onChange={(e) => handleFieldChange('position', e.target.value)}
                placeholder={t('positionPlaceholder')}
              />
            </div>
          </div>

          {/* Department and Contact - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                {t('department')} <span className="text-red-500">{t('required')}</span>
              </Label>
              <Input
                value={localFormData.department}
                onChange={(e) => handleFieldChange('department', e.target.value)}
                placeholder={t('departmentPlaceholder')}
                className={validationErrors.department ? 'border-red-500' : ''}
              />
              {validationErrors.department && (
                <p className="text-red-500 text-xs">{validationErrors.department}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                {t('phone')} <span className="text-red-500">{t('required')}</span>
              </Label>
              <Input
                value={localFormData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder={t('phonePlaceholder')}
                className={validationErrors.phone ? 'border-red-500' : ''}
              />
              {validationErrors.phone && (
                <p className="text-red-500 text-xs">{validationErrors.phone}</p>
              )}
            </div>
          </div>

          {/* Email - full width */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              {t('email')}
            </Label>
            <Input
              type="email"
              value={localFormData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              placeholder={t('emailPlaceholder')}
            />
          </div>

          {/* Equipment Type and Details - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="equipmentType" className="text-sm font-medium text-gray-700">
                {t('equipmentType')} <span className="text-red-500">{t('required')}</span>
              </Label>
              <Select value={localFormData.equipmentType} onValueChange={(value) => handleFieldChange('equipmentType', value)}>
                <SelectTrigger className={validationErrors.equipmentType ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t('selectEquipment')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notebook">{t('notebook')}</SelectItem>
                  <SelectItem value="hub">{t('hub')}</SelectItem>
                  <SelectItem value="router">{t('router')}</SelectItem>
                  <SelectItem value="mouse">{t('mouse')}</SelectItem>
                  <SelectItem value="keyboard">{t('keyboard')}</SelectItem>
                  <SelectItem value="external-monitor">{t('external-monitor')}</SelectItem>
                  <SelectItem value="docking-station">{t('docking-station')}</SelectItem>
                  <SelectItem value="projector">{t('projector')}</SelectItem>
                  <SelectItem value="speaker">{t('speaker')}</SelectItem>
                  <SelectItem value="webcam">{t('webcam')}</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.equipmentType && (
                <p className="text-red-500 text-xs">{validationErrors.equipmentType}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                {t('quantity')}
              </Label>
              <Input
                type="number"
                min="1"
                value={localFormData.quantity}
                onChange={(e) => handleFieldChange('quantity', e.target.value)}
                placeholder="1"
              />
            </div>
          </div>

          {/* Equipment Details */}
          <div className="space-y-2">
            <Label htmlFor="equipmentDetails" className="text-sm font-medium text-gray-700">
              {t('equipmentDetails')}
            </Label>
            <Input
              value={localFormData.equipmentDetails}
              onChange={(e) => handleFieldChange('equipmentDetails', e.target.value)}
              placeholder={t('equipmentDetailsPlaceholder')}
            />
          </div>

          {/* Dates - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="borrowDate" className="text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4 inline mr-1" />
                {t('borrowDate')} <span className="text-red-500">{t('required')}</span>
              </Label>
              <Input
                type="date"
                value={localFormData.borrowDate}
                onChange={(e) => handleFieldChange('borrowDate', e.target.value)}
                className={validationErrors.borrowDate ? 'border-red-500' : ''}
              />
              {validationErrors.borrowDate && (
                <p className="text-red-500 text-xs">{validationErrors.borrowDate}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="returnDate" className="text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4 inline mr-1" />
                {t('returnDate')} <span className="text-red-500">{t('required')}</span>
              </Label>
              <Input
                type="date"
                value={localFormData.returnDate}
                onChange={(e) => handleFieldChange('returnDate', e.target.value)}
                className={validationErrors.returnDate ? 'border-red-500' : ''}
              />
              {validationErrors.returnDate && (
                <p className="text-red-500 text-xs">{validationErrors.returnDate}</p>
              )}
            </div>
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose" className="text-sm font-medium text-gray-700">
              {t('purpose')}
            </Label>
            <Textarea
              value={localFormData.purpose}
              onChange={(e) => handleFieldChange('purpose', e.target.value)}
              placeholder={t('purposePlaceholder')}
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              {t('attachments')}
            </Label>
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
                      {t('attachFile')}
                    </span>
                  </Button>
                </Label>
                <span className="text-xs text-gray-500">PDF, JPG, PNG, DOCX</span>
              </div>
              
              {localFormData.attachments.length > 0 && (
                <div className="space-y-1">
                  {localFormData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Paperclip className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 flex-1">{file.name}</span>
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

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 transition-all duration-200"
            >
              <Send className="w-4 h-4 mr-2" />
              {t('submitButton')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ComputerEquipmentForm;
