
export interface ComputerEquipmentFormData {
  // Page 1 - Recorder Information
  employeeId: string;
  fullName: string;
  position: string;
  department: string;
  division: string;
  unit: string;
  phone: string;
  email: string;
  
  // Document Details
  subject: string;
  equipmentType: string;
  quantity: string;
  equipmentDetails: string;
  purpose: string;
  
  // Time Details
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  
  // Page 2 - Installation and Coordination
  installLocation: string;
  basicSoftware: string[];
  additionalSoftware: 'no' | 'yes';
  additionalSoftwareDetails: string;
  coordinatorName: string;
  coordinatorPhone: string;
  receiver: string;
  receiveDateTime: string;
  notes: string;
  attachments: File[];
}

// New Smart Form Data structure for AI processing
export interface SmartFormData {
  employee_id: string | null;
  full_name: string | null;
  position: string | null;
  department: string | null;
  division: string | null;
  unit: string | null;
  phone: string | null;
  email: string | null;
  doc_ref_no: string | null;
  doc_date: string | null;
  subject: string | null;
  equipment_type: string | null;
  quantity: string | null;
  purpose: string | null;
  start_datetime: string | null;
  end_datetime: string | null;
  install_location: string | null;
  default_software: boolean;
  extra_software_choice: string;
  extra_software_name: string | null;
  coordinator: string | null;
  coordinator_phone: string | null;
  receiver: string | null;
  receive_datetime: string | null;
  remark: string | null;
  attachment: string | null;
}

// Utility function to convert SmartFormData to ComputerEquipmentFormData
export function convertSmartFormToFormData(smartForm: SmartFormData): Partial<ComputerEquipmentFormData> {
  const startDateTime = smartForm.start_datetime ? new Date(smartForm.start_datetime) : null;
  const endDateTime = smartForm.end_datetime ? new Date(smartForm.end_datetime) : null;
  
  return {
    employeeId: smartForm.employee_id || '',
    fullName: smartForm.full_name || '',
    position: smartForm.position || '',
    department: smartForm.department || '',
    division: smartForm.division || '',
    unit: smartForm.unit || '',
    phone: smartForm.phone || '',
    email: smartForm.email || '',
    subject: smartForm.subject || '',
    equipmentType: smartForm.equipment_type || '',
    quantity: smartForm.quantity || '',
    purpose: smartForm.purpose || '',
    startDate: startDateTime ? startDateTime.toISOString().split('T')[0] : '',
    startTime: startDateTime ? startDateTime.toTimeString().slice(0, 5) : '',
    endDate: endDateTime ? endDateTime.toISOString().split('T')[0] : '',
    endTime: endDateTime ? endDateTime.toTimeString().slice(0, 5) : '',
    installLocation: smartForm.install_location || '',
    basicSoftware: smartForm.default_software ? ['basic'] : [],
    additionalSoftware: smartForm.extra_software_choice === 'yes' ? 'yes' : 'no',
    additionalSoftwareDetails: smartForm.extra_software_name || '',
    coordinatorName: smartForm.coordinator || '',
    coordinatorPhone: smartForm.coordinator_phone || '',
    receiver: smartForm.receiver || '',
    receiveDateTime: smartForm.receive_datetime || '',
    notes: smartForm.remark || '',
    attachments: []
  };
}
