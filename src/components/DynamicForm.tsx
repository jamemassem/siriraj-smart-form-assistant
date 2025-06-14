
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export interface FormData {
  formType: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  userName: string;
  department: string;
  contact: string;
}

interface DynamicFormProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ formData, onFormDataChange }) => {
  const { t } = useLanguage();
  const [localFormData, setLocalFormData] = useState<FormData>(formData);

  useEffect(() => {
    setLocalFormData(formData);
  }, [formData]);

  const handleFieldChange = (field: keyof FormData, value: string) => {
    const updatedData = { ...localFormData, [field]: value };
    setLocalFormData(updatedData);
    onFormDataChange(updatedData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const requiredFields = ['formType', 'category', 'date', 'userName'];
    const missingFields = requiredFields.filter(field => !localFormData[field as keyof FormData]);
    
    if (missingFields.length > 0) {
      toast({
        title: t('missingInfo'),
        description: `${t('fillRequired')}: ${missingFields.map(field => t(field)).join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: t('submitSuccess'),
      description: t('submitMessage'),
    });
    
    console.log('Form submitted:', localFormData);
  };

  return (
    <Card className="h-full">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <FileText className="w-5 h-5 text-indigo-600" />
          {t('formTitle')}
        </CardTitle>
        <p className="text-sm text-gray-600">{t('formSubtitle')}</p>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Type and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="formType" className="text-sm font-medium text-gray-700">
                {t('formType')} {t('required')}
              </Label>
              <Select value={localFormData.formType} onValueChange={(value) => handleFieldChange('formType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectFormType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipment-request">{t('equipment-request')}</SelectItem>
                  <SelectItem value="room-booking">{t('room-booking')}</SelectItem>
                  <SelectItem value="service-request">{t('service-request')}</SelectItem>
                  <SelectItem value="maintenance">{t('maintenance')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                {t('category')} {t('required')}
              </Label>
              <Select value={localFormData.category} onValueChange={(value) => handleFieldChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notebook">{t('notebook')}</SelectItem>
                  <SelectItem value="projector">{t('projector')}</SelectItem>
                  <SelectItem value="meeting-room">{t('meeting-room')}</SelectItem>
                  <SelectItem value="conference-room">{t('conference-room')}</SelectItem>
                  <SelectItem value="laptop">{t('laptop')}</SelectItem>
                  <SelectItem value="printer">{t('printer')}</SelectItem>
                  <SelectItem value="camera">{t('camera')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4 inline mr-1" />
                {t('date')} {t('required')}
              </Label>
              <Input
                type="date"
                value={localFormData.date}
                onChange={(e) => handleFieldChange('date', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-sm font-medium text-gray-700">
                <Clock className="w-4 h-4 inline mr-1" />
                {t('startTime')}
              </Label>
              <Input
                type="time"
                value={localFormData.startTime}
                onChange={(e) => handleFieldChange('startTime', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-sm font-medium text-gray-700">
                {t('endTime')}
              </Label>
              <Input
                type="time"
                value={localFormData.endTime}
                onChange={(e) => handleFieldChange('endTime', e.target.value)}
                className="w-full"
              />
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

          {/* User Information */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-medium text-gray-700">{t('userInfo')}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userName" className="text-sm font-medium text-gray-700">
                  {t('name')} {t('required')}
                </Label>
                <Input
                  value={localFormData.userName}
                  onChange={(e) => handleFieldChange('userName', e.target.value)}
                  placeholder={t('namePlaceholder')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                  {t('department')}
                </Label>
                <Input
                  value={localFormData.department}
                  onChange={(e) => handleFieldChange('department', e.target.value)}
                  placeholder={t('departmentPlaceholder')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact" className="text-sm font-medium text-gray-700">
                  {t('contact')}
                </Label>
                <Input
                  value={localFormData.contact}
                  onChange={(e) => handleFieldChange('contact', e.target.value)}
                  placeholder={t('contactPlaceholder')}
                />
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
              {t('submitButton')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DynamicForm;
