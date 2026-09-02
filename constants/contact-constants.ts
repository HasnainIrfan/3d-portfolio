import {
  type ContactField,
  type ContactFormData,
} from "@/types/contact-types";

export const INITIAL_FORM_STATE: ContactFormData = {
  name: "",
  email: "",
  budget: "",
  message: "",
};

export const REQUIRED_FIELDS: ContactField[] = ["name", "email", "message"];

export const BUDGET_OPTIONS = [
  { value: "< $1k", label: "< $1k" },
  { value: "$1k - $5k", label: "$1k - $5k" },
  { value: "$5k - $15k", label: "$5k - $15k" },
  { value: "$15k+", label: "$15k+" },
  { value: "hourly", label: "Hourly" },
] as const;

export const ALERT_DURATION = 5000;

export const CONTACT_SUCCESS_MESSAGE =
  "Message sent. I'll reply within 24 hours.";
export const CONTACT_ERROR_MESSAGE =
  "Something went wrong, please try again.";
