
import React, { useState, useEffect } from 'react';
import { User, FileText, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { ComputerEquipmentFormData } from '@/types/formTypes';

interface ComputerEquipmentFormPart1Props {
  formData: ComputerEquipmentFormData;
  onFormDataChange: (data: ComputerEquipmentFormData) => void;
}

const ComputerEquipmentFormPart1: React.FC<ComputerEquipmentFormPart1Props> = ({ 
  formData, 
  onFormDataChange 
}) => {
  const { t } = useLanguage();
  const [localFormData, setLocalFormData] = useState<ComputerEquipmentFormData>(formData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalFormData(formData);
  }, [formData]);

  const handleFieldChange = (field: keyof ComputerEquipmentFormData, value: string | string[]) => {
    const updatedData = { ...localFormData, [field]: value };
    setLocalFormData(updatedData);
    onFormDataChange(updatedData);
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Generate time options
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeString);
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="bg-[#29A9EF] text-white">
        <CardTitle className="flex items-center gap-2 text-white font-bold">
          <FileText className="w-5 h-5" />
          {t('formTitle')}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        <div className="space-y-6">
          {/* Recorder Section */}
          <div className="space-y-4">
            <div className="bg-[#29A9EF] text-white p-3 font-bold rounded">
              <h3 className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {t('recorderSection')}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('employeeId')}</Label>
                <Input
                  value={localFormData.employeeId}
                  onChange={(e) => handleFieldChange('employeeId', e.target.value)}
                  placeholder={t('employeeIdPlaceholder')}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('fullName')}</Label>
                <Input
                  value={localFormData.fullName}
                  onChange={(e) => handleFieldChange('fullName', e.target.value)}
                  placeholder={t('fullNamePlaceholder')}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('position')}</Label>
                <Input
                  value={localFormData.position}
                  onChange={(e) => handleFieldChange('position', e.target.value)}
                  placeholder={t('positionPlaceholder')}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('department')}</Label>
                <Input
                  value={localFormData.department}
                  onChange={(e) => handleFieldChange('department', e.target.value)}
                  placeholder={t('departmentPlaceholder')}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('division')}</Label>
                <Input
                  value={localFormData.division}
                  onChange={(e) => handleFieldChange('division', e.target.value)}
                  placeholder={t('divisionPlaceholder')}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('unit')}</Label>
                <Input
                  value={localFormData.unit}
                  onChange={(e) => handleFieldChange('unit', e.target.value)}
                  placeholder={t('unitPlaceholder')}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t('phone')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={localFormData.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  placeholder={t('phonePlaceholder')}
                  className={validationErrors.phone ? 'border-red-500' : ''}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('email')}</Label>
                <Input
                  type="email"
                  value={localFormData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  placeholder={t('emailPlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Document Details Section */}
          <div className="space-y-4">
            <div className="bg-[#29A9EF] text-white p-3 font-bold rounded">
              <h3>{t('documentSection')}</h3>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t('subject')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={localFormData.subject}
                  onChange={(e) => handleFieldChange('subject', e.target.value)}
                  placeholder={t('subjectPlaceholder')}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t('equipmentType')} <span className="text-red-500">*</span>
                </Label>
                <Select value={localFormData.equipmentType} onValueChange={(value) => handleFieldChange('equipmentType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectEquipment')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notebook">Notebook</SelectItem>
                    <SelectItem value="hub">Hub</SelectItem>
                    <SelectItem value="router">Router</SelectItem>
                    <SelectItem value="projector">Projector</SelectItem>
                    <SelectItem value="mouse">Mouse</SelectItem>
                    <SelectItem value="dock">Dock</SelectItem>
                    <SelectItem value="monitor">Monitor</SelectItem>
                    <SelectItem value="external-hdd">External HDD</SelectItem>
                    <SelectItem value="hdmi-cable">สายแปลง HDMI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t('quantity')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={localFormData.quantity}
                  onChange={(e) => handleFieldChange('quantity', e.target.value)}
                  placeholder="1"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t('purpose')} <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  value={localFormData.purpose}
                  onChange={(e) => handleFieldChange('purpose', e.target.value)}
                  placeholder={t('purposePlaceholder')}
                  className="min-h-[60px] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Time Section */}
          <div className="space-y-4">
            <div className="bg-[#29A9EF] text-white p-3 font-bold rounded">
              <h3 className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t('timeSection')}
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t('startDate')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={localFormData.startDate}
                    onChange={(e) => handleFieldChange('startDate', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t('startTime')} <span className="text-red-500">*</span>
                  </Label>
                  <Select value={localFormData.startTime} onValueChange={(value) => handleFieldChange('startTime', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectTime')} />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t('endDate')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={localFormData.endDate}
                    onChange={(e) => handleFieldChange('endDate', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t('endTime')} <span className="text-red-500">*</span>
                  </Label>
                  <Select value={localFormData.endTime} onValueChange={(value) => handleFieldChange('endTime', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectTime')} />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComputerEquipmentFormPart1;
