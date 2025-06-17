
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, Send, Paperclip, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ComputerEquipmentFormData } from '@/types/formTypes';

interface MultiPageFormProps {
  formData: ComputerEquipmentFormData;
  onFormDataChange: (data: ComputerEquipmentFormData) => void;
}

const MultiPageForm: React.FC<MultiPageFormProps> = ({ formData, onFormDataChange }) => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [localFormData, setLocalFormData] = useState<ComputerEquipmentFormData>(formData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalFormData(formData);
  }, [formData]);

  const handleFieldChange = (field: keyof ComputerEquipmentFormData, value: any) => {
    const updatedData = { ...localFormData, [field]: value };
    setLocalFormData(updatedData);
    onFormDataChange(updatedData);
    
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

  const validatePage1 = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!localFormData.employeeId.trim()) errors.employeeId = t('fillRequired') + ' ' + t('employeeId');
    if (!localFormData.fullName.trim()) errors.fullName = t('fillRequired') + ' ' + t('fullName');
    if (!localFormData.position.trim()) errors.position = t('fillRequired') + ' ' + t('position');
    if (!localFormData.department.trim()) errors.department = t('fillRequired') + ' ' + t('department');
    if (!localFormData.division.trim()) errors.division = t('fillRequired') + ' ' + t('division');
    if (!localFormData.phone.trim()) errors.phone = t('fillRequired') + ' ' + t('phone');
    if (!localFormData.email.trim()) errors.email = t('fillRequired') + ' ' + t('email');
    if (!localFormData.subject.trim()) errors.subject = t('fillRequired') + ' ' + t('subject');
    if (!localFormData.equipmentType) errors.equipmentType = t('fillRequired') + ' ' + t('equipmentType');
    if (!localFormData.quantity.trim()) errors.quantity = t('fillRequired') + ' ' + t('quantity');
    if (!localFormData.purpose.trim()) errors.purpose = t('fillRequired') + ' ' + t('purpose');
    if (!localFormData.startDate) errors.startDate = t('fillRequired') + ' ' + t('startDate');
    if (!localFormData.startTime) errors.startTime = t('fillRequired') + ' ' + t('startTime');
    if (!localFormData.endDate) errors.endDate = t('fillRequired') + ' ' + t('endDate');
    if (!localFormData.endTime) errors.endTime = t('fillRequired') + ' ' + t('endTime');
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePage2 = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!localFormData.installLocation.trim()) errors.installLocation = t('fillRequired') + ' ' + t('installLocation');
    if (!localFormData.coordinatorName.trim()) errors.coordinatorName = t('fillRequired') + ' ' + t('coordinatorName');
    if (!localFormData.coordinatorPhone.trim()) errors.coordinatorPhone = t('fillRequired') + ' ' + t('coordinatorPhone');
    if (!localFormData.receiveDateTime) errors.receiveDateTime = t('fillRequired') + ' ' + t('receiveDateTime');
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextPage = () => {
    if (validatePage1()) {
      setCurrentPage(2);
    } else {
      toast({
        title: t('missingInfo'),
        description: 'กรุณากรอกข้อมูลในช่องที่มีสีแดงให้ครบถ้วน',
        variant: "destructive"
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePage2()) {
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

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="bg-[#29A9EF] text-white font-bold p-3 rounded-t-lg mb-4">
      <h3 className="text-sm">{title}</h3>
    </div>
  );

  const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
    <Label className="text-sm font-medium text-gray-700">
      {children} <span className="text-red-500">{t('required')}</span>
    </Label>
  );

  const OptionalLabel = ({ children }: { children: React.ReactNode }) => (
    <Label className="text-sm font-medium text-gray-700">{children}</Label>
  );

  return (
    <Card className="h-full">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <FileText className="w-5 h-5 text-blue-600" />
          {t('formTitle')}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {currentPage === 1 ? t('page1Title') : t('page2Title')}
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {currentPage === 1 && (
            <>
              {/* Recorder Section */}
              <div className="space-y-4">
                <SectionHeader title={t('recorderSection')} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <RequiredLabel>{t('employeeId')}</RequiredLabel>
                    <Input
                      value={localFormData.employeeId}
                      onChange={(e) => handleFieldChange('employeeId', e.target.value)}
                      placeholder={t('employeeIdPlaceholder')}
                      className={validationErrors.employeeId ? 'border-red-500' : ''}
                    />
                    {validationErrors.employeeId && (
                      <p className="text-red-500 text-xs">{validationErrors.employeeId}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <RequiredLabel>{t('fullName')}</RequiredLabel>
                    <Input
                      value={localFormData.fullName}
                      onChange={(e) => handleFieldChange('fullName', e.target.value)}
                      placeholder={t('fullNamePlaceholder')}
                      className={validationErrors.fullName ? 'border-red-500' : ''}
                    />
                    {validationErrors.fullName && (
                      <p className="text-red-500 text-xs">{validationErrors.fullName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <RequiredLabel>{t('position')}</RequiredLabel>
                    <Input
                      value={localFormData.position}
                      onChange={(e) => handleFieldChange('position', e.target.value)}
                      placeholder={t('positionPlaceholder')}
                      className={validationErrors.position ? 'border-red-500' : ''}
                    />
                    {validationErrors.position && (
                      <p className="text-red-500 text-xs">{validationErrors.position}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <RequiredLabel>{t('department')}</RequiredLabel>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <RequiredLabel>{t('division')}</RequiredLabel>
                    <Input
                      value={localFormData.division}
                      onChange={(e) => handleFieldChange('division', e.target.value)}
                      placeholder={t('divisionPlaceholder')}
                      className={validationErrors.division ? 'border-red-500' : ''}
                    />
                    {validationErrors.division && (
                      <p className="text-red-500 text-xs">{validationErrors.division}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <OptionalLabel>{t('unit')}</OptionalLabel>
                    <Input
                      value={localFormData.unit}
                      onChange={(e) => handleFieldChange('unit', e.target.value)}
                      placeholder={t('unitPlaceholder')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <RequiredLabel>{t('phone')}</RequiredLabel>
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
                  
                  <div className="space-y-2">
                    <RequiredLabel>{t('email')}</RequiredLabel>
                    <Input
                      type="email"
                      value={localFormData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      placeholder={t('emailPlaceholder')}
                      className={validationErrors.email ? 'border-red-500' : ''}
                    />
                    {validationErrors.email && (
                      <p className="text-red-500 text-xs">{validationErrors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Details Section */}
              <div className="space-y-4">
                <SectionHeader title={t('documentSection')} />
                
                <div className="space-y-2">
                  <RequiredLabel>{t('subject')}</RequiredLabel>
                  <Input
                    value={localFormData.subject}
                    onChange={(e) => handleFieldChange('subject', e.target.value)}
                    placeholder={t('subjectPlaceholder')}
                    className={validationErrors.subject ? 'border-red-500' : ''}
                  />
                  {validationErrors.subject && (
                    <p className="text-red-500 text-xs">{validationErrors.subject}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <RequiredLabel>{t('equipmentType')}</RequiredLabel>
                    <Select value={localFormData.equipmentType} onValueChange={(value) => handleFieldChange('equipmentType', value)}>
                      <SelectTrigger className={validationErrors.equipmentType ? 'border-red-500' : ''}>
                        <SelectValue placeholder={t('selectEquipment')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="notebook">{t('notebook')}</SelectItem>
                        <SelectItem value="hub">{t('hub')}</SelectItem>
                        <SelectItem value="projector">{t('projector')}</SelectItem>
                        <SelectItem value="router">{t('router')}</SelectItem>
                        <SelectItem value="mouse">{t('mouse')}</SelectItem>
                        <SelectItem value="dock">{t('dock')}</SelectItem>
                        <SelectItem value="keyboard">{t('keyboard')}</SelectItem>
                        <SelectItem value="monitor">{t('monitor')}</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.equipmentType && (
                      <p className="text-red-500 text-xs">{validationErrors.equipmentType}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <RequiredLabel>{t('quantity')}</RequiredLabel>
                    <Input
                      type="number"
                      min="1"
                      value={localFormData.quantity}
                      onChange={(e) => handleFieldChange('quantity', e.target.value)}
                      placeholder="1"
                      className={validationErrors.quantity ? 'border-red-500' : ''}
                    />
                    {validationErrors.quantity && (
                      <p className="text-red-500 text-xs">{validationErrors.quantity}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <OptionalLabel>{t('equipmentDetails')}</OptionalLabel>
                  <Input
                    value={localFormData.equipmentDetails}
                    onChange={(e) => handleFieldChange('equipmentDetails', e.target.value)}
                    placeholder={t('equipmentDetailsPlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <RequiredLabel>{t('purpose')}</RequiredLabel>
                  <Textarea
                    value={localFormData.purpose}
                    onChange={(e) => handleFieldChange('purpose', e.target.value)}
                    placeholder={t('purposePlaceholder')}
                    className={`min-h-[80px] resize-none ${validationErrors.purpose ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.purpose && (
                    <p className="text-red-500 text-xs">{validationErrors.purpose}</p>
                  )}
                </div>
              </div>

              {/* Time Section */}
              <div className="space-y-4">
                <SectionHeader title={t('timeSection')} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <RequiredLabel>
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {t('startDate')}
                    </RequiredLabel>
                    <Input
                      type="date"
                      value={localFormData.startDate}
                      onChange={(e) => handleFieldChange('startDate', e.target.value)}
                      className={validationErrors.startDate ? 'border-red-500' : ''}
                    />
                    {validationErrors.startDate && (
                      <p className="text-red-500 text-xs">{validationErrors.startDate}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <RequiredLabel>
                      <Clock className="w-4 h-4 inline mr-1" />
                      {t('startTime')}
                    </RequiredLabel>
                    <Select value={localFormData.startTime} onValueChange={(value) => handleFieldChange('startTime', value)}>
                      <SelectTrigger className={validationErrors.startTime ? 'border-red-500' : ''}>
                        <SelectValue placeholder={t('selectTime')} />
                      </SelectTrigger>
                      <SelectContent>
                        {generateTimeOptions().map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.startTime && (
                      <p className="text-red-500 text-xs">{validationErrors.startTime}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <RequiredLabel>
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {t('endDate')}
                    </RequiredLabel>
                    <Input
                      type="date"
                      value={localFormData.endDate}
                      onChange={(e) => handleFieldChange('endDate', e.target.value)}
                      className={validationErrors.endDate ? 'border-red-500' : ''}
                    />
                    {validationErrors.endDate && (
                      <p className="text-red-500 text-xs">{validationErrors.endDate}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <RequiredLabel>
                      <Clock className="w-4 h-4 inline mr-1" />
                      {t('endTime')}
                    </RequiredLabel>
                    <Select value={localFormData.endTime} onValueChange={(value) => handleFieldChange('endTime', value)}>
                      <SelectTrigger className={validationErrors.endTime ? 'border-red-500' : ''}>
                        <SelectValue placeholder={t('selectTime')} />
                      </SelectTrigger>
                      <SelectContent>
                        {generateTimeOptions().map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.endTime && (
                      <p className="text-red-500 text-xs">{validationErrors.endTime}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="button"
                  onClick={handleNextPage}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 transition-all duration-200"
                >
                  {t('nextPage')}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}

          {currentPage === 2 && (
            <>
              {/* Location Section */}
              <div className="space-y-4">
                <SectionHeader title={t('locationSection')} />
                
                <div className="space-y-2">
                  <RequiredLabel>{t('installLocation')}</RequiredLabel>
                  <Input
                    value={localFormData.installLocation}
                    onChange={(e) => handleFieldChange('installLocation', e.target.value)}
                    placeholder={t('installLocationPlaceholder')}
                    className={validationErrors.installLocation ? 'border-red-500' : ''}
                  />
                  {validationErrors.installLocation && (
                    <p className="text-red-500 text-xs">{validationErrors.installLocation}</p>
                  )}
                </div>
              </div>

              {/* Software Section */}
              <div className="space-y-4">
                <SectionHeader title={t('softwareSection')} />
                
                <div className="space-y-4">
                  <div>
                    <OptionalLabel>{t('basicSoftware')}</OptionalLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {[
                        'Windows 7 32 bit',
                        'MS Office 2007–2010',
                        'Ashampoo burning 6.0',
                        'Adobe Acrobat Reader v.11',
                        'Google Chrome',
                        'IE 11',
                        'IBM Lotus Notes'
                      ].map((software) => (
                        <div key={software} className="flex items-center space-x-2">
                          <Checkbox
                            id={software}
                            checked={localFormData.basicSoftware.includes(software)}
                            onCheckedChange={(checked) => {
                              const updated = checked 
                                ? [...localFormData.basicSoftware, software]
                                : localFormData.basicSoftware.filter(s => s !== software);
                              handleFieldChange('basicSoftware', updated);
                            }}
                          />
                          <Label htmlFor={software} className="text-sm">{software}</Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{t('additionalSoftwareNote')}</p>
                  </div>

                  <div className="space-y-3">
                    <OptionalLabel>{t('additionalSoftware')}</OptionalLabel>
                    <RadioGroup
                      value={localFormData.additionalSoftware}
                      onValueChange={(value: 'no' | 'yes') => handleFieldChange('additionalSoftware', value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="no-additional" />
                        <Label htmlFor="no-additional">{t('noAdditionalSoftware')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="yes-additional" />
                        <Label htmlFor="yes-additional">{t('needAdditionalSoftware')}</Label>
                      </div>
                    </RadioGroup>
                    
                    {localFormData.additionalSoftware === 'yes' && (
                      <Input
                        value={localFormData.additionalSoftwareDetails}
                        onChange={(e) => handleFieldChange('additionalSoftwareDetails', e.target.value)}
                        placeholder={t('additionalSoftwarePlaceholder')}
                        className="mt-2"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Coordinator Section */}
              <div className="space-y-4">
                <SectionHeader title={t('coordinatorSection')} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <RequiredLabel>{t('coordinatorName')}</RequiredLabel>
                    <Input
                      value={localFormData.coordinatorName}
                      onChange={(e) => handleFieldChange('coordinatorName', e.target.value)}
                      placeholder={t('coordinatorNamePlaceholder')}
                      className={validationErrors.coordinatorName ? 'border-red-500' : ''}
                    />
                    {validationErrors.coordinatorName && (
                      <p className="text-red-500 text-xs">{validationErrors.coordinatorName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <RequiredLabel>{t('coordinatorPhone')}</RequiredLabel>
                    <Input
                      value={localFormData.coordinatorPhone}
                      onChange={(e) => handleFieldChange('coordinatorPhone', e.target.value)}
                      placeholder={t('coordinatorPhonePlaceholder')}
                      className={validationErrors.coordinatorPhone ? 'border-red-500' : ''}
                    />
                    {validationErrors.coordinatorPhone && (
                      <p className="text-red-500 text-xs">{validationErrors.coordinatorPhone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <OptionalLabel>{t('receiver')}</OptionalLabel>
                    <Input
                      value={localFormData.receiver}
                      onChange={(e) => handleFieldChange('receiver', e.target.value)}
                      placeholder={t('receiverPlaceholder')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <RequiredLabel>{t('receiveDateTime')}</RequiredLabel>
                    <Input
                      type="datetime-local"
                      value={localFormData.receiveDateTime}
                      onChange={(e) => handleFieldChange('receiveDateTime', e.target.value)}
                      className={validationErrors.receiveDateTime ? 'border-red-500' : ''}
                    />
                    {validationErrors.receiveDateTime && (
                      <p className="text-red-500 text-xs">{validationErrors.receiveDateTime}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes and Attachments Section */}
              <div className="space-y-4">
                <SectionHeader title={t('notesSection')} />
                
                <div className="space-y-2">
                  <OptionalLabel>{t('notes')}</OptionalLabel>
                  <Textarea
                    value={localFormData.notes}
                    onChange={(e) => handleFieldChange('notes', e.target.value)}
                    placeholder={t('notesPlaceholder')}
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <OptionalLabel>{t('attachments')}</OptionalLabel>
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
              </div>

              <div className="flex justify-between pt-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentPage(1)}
                  className="font-medium py-3 px-6"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  {t('previousPage')}
                </Button>
                
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 transition-all duration-200"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {t('submitButton')}
                </Button>
              </div>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default MultiPageForm;
