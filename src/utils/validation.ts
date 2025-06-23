
import { SmartFormData } from '@/types/openRouterTypes';

export const getRequiredFields = (): string[] => {
  return [
    'phone', 'subject', 'equipment_type', 'quantity', 'purpose',
    'start_datetime', 'end_datetime', 'install_location', 
    'coordinator', 'coordinator_phone', 'receive_datetime'
  ];
};

export const validateFormData = (formData: SmartFormData): string[] => {
  const missingFields: string[] = [];
  const requiredFields = getRequiredFields();

  requiredFields.forEach(field => {
    const value = formData[field as keyof SmartFormData];
    if (!value || value === null || value === '') {
      missingFields.push(field);
    }
  });

  return missingFields;
};
