
// src/types/formTypes.ts
export interface ComputerEquipmentFormData {
  employeeId: string;
  fullName: string;
  position: string;
  department: string;
  division: string;
  unit: string;
  phone: string;
  email: string;
  subject: string;
  equipmentType: string;
  quantity: string;
  equipmentDetails: string;
  purpose: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
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

export interface SmartFormData {
  employee_id?: string | null;
  full_name?: string | null;
  position?: string | null;
  department?: string | null;
  division?: string | null;
  unit?: string | null;
  phone?: string | null;
  email?: string | null;
  subject?: string | null;
  equipment_type?: string | null;
  quantity?: string | null;
  purpose?: string | null;
  start_datetime?: string | null;
  end_datetime?: string | null;
  install_location?: string | null;
  coordinator?: string | null;
  coordinator_phone?: string | null;
  receive_datetime?: string | null;
  remark?: string | null;
}

export function convertSmartFormToFormData(smartForm: SmartFormData): Partial<ComputerEquipmentFormData> {
  const startDateTime = smartForm.start_datetime ? new Date(smartForm.start_datetime) : null;
  const endDateTime = smartForm.end_datetime ? new Date(smartForm.end_datetime) : null;

  const converted: Partial<ComputerEquipmentFormData> = {};
  if (smartForm.employee_id) converted.employeeId = smartForm.employee_id;
  if (smartForm.full_name) converted.fullName = smartForm.full_name;
  if (smartForm.position) converted.position = smartForm.position;
  if (smartForm.department) converted.department = smartForm.department;
  if (smartForm.division) converted.division = smartForm.division;
  if (smartForm.unit) converted.unit = smartForm.unit;
  if (smartForm.phone) converted.phone = smartForm.phone;
  if (smartForm.email) converted.email = smartForm.email;
  if (smartForm.subject) converted.subject = smartForm.subject;
  if (smartForm.equipment_type) converted.equipmentType = smartForm.equipment_type;
  if (smartForm.quantity) converted.quantity = smartForm.quantity;
  if (smartForm.purpose) converted.purpose = smartForm.purpose;
  if (smartForm.install_location) converted.installLocation = smartForm.install_location;
  if (smartForm.coordinator) converted.coordinatorName = smartForm.coordinator;
  if (smartForm.coordinator_phone) converted.coordinatorPhone = smartForm.coordinator_phone;
  if (smartForm.receive_datetime) converted.receiveDateTime = smartForm.receive_datetime;
  if (smartForm.remark) converted.notes = smartForm.remark;

  if (startDateTime) {
    converted.startDate = startDateTime.toISOString().split('T')[0];
    converted.startTime = startDateTime.toTimeString().slice(0, 5);
  }
  if (endDateTime) {
    converted.endDate = endDateTime.toISOString().split('T')[0];
    converted.endTime = endDateTime.toTimeString().slice(0, 5);
  }
  return converted;
}
