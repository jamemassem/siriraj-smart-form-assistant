
export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

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
