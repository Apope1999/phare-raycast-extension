import { useState } from "react";
import { showToast, Toast } from "@raycast/api";
import { useMonitorActions } from "./useMonitorActions";
import {
  validateMonitorForm,
  transformFormDataToMonitor,
} from "../utils/monitorUtils";
import { CreateMonitorForm } from "../types";

export function useCreateMonitor(apiKey: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { createMonitor } = useMonitorActions(apiKey);

  const handleSubmit = async (values: CreateMonitorForm) => {
    if (!apiKey) {
      await showToast({
        style: Toast.Style.Failure,
        title: "API Key Required",
        message: "Please set your Phare API key in preferences",
      });
      return;
    }

    const validation = validateMonitorForm(values);
    if (!validation.isValid) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Validation Error",
        message: validation.error || "Please check your input",
      });
      return;
    }

    setIsLoading(true);

    try {
      const monitorData = transformFormDataToMonitor(values);
      await createMonitor(monitorData);
    } catch (error) {
      // Error handling is already done in createMonitor
      console.error("Failed to create monitor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSubmit,
    isLoading,
  };
}
