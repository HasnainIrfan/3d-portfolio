export interface ContactFormData {
  name: string;
  email: string;
  budget: string;
  message: string;
}

export type ContactField = keyof ContactFormData;

export type AlertType = "success" | "danger";

export interface AlertState {
  visible: boolean;
  type: AlertType;
  message: string;
}

export interface FloatingFieldProps {
  id: ContactField;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  autoComplete?: string;
}

export interface BudgetFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export interface ContactInfoCardProps {
  icon: string;
  label: string;
  value: string;
  href?: string;
  gradient: string;
}
