
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
