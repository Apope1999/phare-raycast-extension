import { showToast, Toast } from "@raycast/api";
import { useForm, FormValidation } from "@raycast/utils";
import { useMonitorActions } from "./useMonitorActions";
import { transformFormDataToMonitor } from "../utils/monitorUtils";
import { CreateMonitorForm } from "../types";

export function useCreateMonitor(apiKey: string) {
  const { createMonitor } = useMonitorActions(apiKey);

  const { handleSubmit, itemProps, isLoading } = useForm<CreateMonitorForm>({
    async onSubmit(values) {
      if (!apiKey) {
        await showToast({
          style: Toast.Style.Failure,
          title: "API Key Required",
          message: "Please set your Phare API key in preferences",
        });
        return;
      }

      try {
        const monitorData = transformFormDataToMonitor(values);
        await createMonitor(monitorData);
      } catch (error) {
        // Error handling is already done in createMonitor
        console.error("Failed to create monitor:", error);
      }
    },
    validation: {
      name: FormValidation.Required,
      url: (value) => {
        if (!value) {
          return "URL is required";
        }
        try {
          new URL(value);
        } catch {
          return "Please enter a valid URL";
        }
      },
      regions: (value) => {
        if (!value || value.length === 0) {
          return "At least one region must be selected";
        }
      },
    },
  });

  return {
    handleSubmit,
    itemProps,
    isLoading,
  };
}
