"use client";

import { useCallback, useMemo, useRef, useState, type FormEvent } from "react";
import {
  ALERT_DURATION,
  CONTACT_ERROR_MESSAGE,
  CONTACT_SUCCESS_MESSAGE,
  INITIAL_FORM_STATE,
  REQUIRED_FIELDS,
} from "@/constants/contact-constants";
import {
  type AlertState,
  type AlertType,
  type ContactField,
  type ContactFormData,
} from "@/types/contact-types";

const HIDDEN_ALERT: AlertState = {
  visible: false,
  type: "success",
  message: "",
};

/** Form state, validation progress and submission for the contact form. */
export const useContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>(HIDDEN_ALERT);
  const alertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback((key: ContactField, value: string) => {
    setFormData((previous) => ({ ...previous, [key]: value }));
  }, []);

  /** 0–1 across the required fields, driving the progress bar. */
  const completion = useMemo(() => {
    const filled = REQUIRED_FIELDS.filter((key) => formData[key].trim()).length;
    return filled / REQUIRED_FIELDS.length;
  }, [formData]);

  const showAlert = useCallback((type: AlertType, message: string) => {
    if (alertTimer.current) clearTimeout(alertTimer.current);
    setAlert({ visible: true, type, message });
    alertTimer.current = setTimeout(
      () => setAlert(HIDDEN_ALERT),
      ALERT_DURATION
    );
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      setIsLoading(true);

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };

        if (!response.ok) throw new Error(data.error || "Submission failed.");

        setFormData(INITIAL_FORM_STATE);
        showAlert("success", CONTACT_SUCCESS_MESSAGE);
      } catch (error) {
        // The route hands back a usable message for the cases a visitor can act
        // on — an unconfigured deployment, a validation failure — so it is
        // shown rather than replaced with something generic.
        showAlert(
          "danger",
          error instanceof Error ? error.message : CONTACT_ERROR_MESSAGE
        );
      } finally {
        setIsLoading(false);
      }
    },
    [formData, showAlert]
  );

  return { formData, update, completion, isLoading, alert, handleSubmit };
};
