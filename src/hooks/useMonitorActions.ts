import { useFetch } from "@raycast/utils";
import { showToast, Toast } from "@raycast/api";
import { Monitor } from "../types";

const API_BASE_URL = "https://api.phare.io/uptime";

export function useMonitorActions(apiKey: string) {
  const { mutate } = useFetch<{ data: Monitor[] }>(`${API_BASE_URL}/monitors`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    execute: false, // We don't want to fetch here, just use the mutate function
  });

  const pauseMonitor = async (monitorId: number, monitorName: string) => {
    console.log(`Attempting to pause monitor ${monitorId}`);

    try {
      await mutate(
        fetch(`${API_BASE_URL}/monitors/${monitorId}/pause`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }),
        {
          optimisticUpdate: (data) => {
            if (!data?.data) return data;
            return {
              ...data,
              data: data.data.map((monitor) =>
                monitor.id === monitorId
                  ? { ...monitor, status: "paused" }
                  : monitor,
              ),
            };
          },
        },
      );

      console.log(`Successfully paused monitor ${monitorId}`);
      await showToast({
        style: Toast.Style.Success,
        title: "Monitor Paused",
        message: `Successfully paused "${monitorName}"`,
      });
    } catch (error: unknown) {
      console.error(`Failed to pause monitor ${monitorId}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to pause monitor";
      await showToast({
        style: Toast.Style.Failure,
        title: "Pause Failed",
        message: errorMessage,
      });
      throw error;
    }
  };

  const resumeMonitor = async (monitorId: number, monitorName: string) => {
    console.log(`Attempting to resume monitor ${monitorId}`);

    try {
      await mutate(
        fetch(`${API_BASE_URL}/monitors/${monitorId}/resume`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }),
        {
          optimisticUpdate: (data) => {
            if (!data?.data) return data;
            return {
              ...data,
              data: data.data.map((monitor) =>
                monitor.id === monitorId
                  ? { ...monitor, status: "online" }
                  : monitor,
              ),
            };
          },
        },
      );

      console.log(`Successfully resumed monitor ${monitorId}`);
      await showToast({
        style: Toast.Style.Success,
        title: "Monitor Resumed",
        message: `Successfully resumed "${monitorName}"`,
      });
    } catch (error: unknown) {
      console.error(`Failed to resume monitor ${monitorId}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to resume monitor";
      await showToast({
        style: Toast.Style.Failure,
        title: "Resume Failed",
        message: errorMessage,
      });
      throw error;
    }
  };

  const deleteMonitor = async (monitorId: number, monitorName: string) => {
    console.log(`Attempting to delete monitor ${monitorId}`);

    try {
      await mutate(
        fetch(`${API_BASE_URL}/monitors/${monitorId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }),
        {
          optimisticUpdate: (data) => {
            if (!data?.data) return data;
            return {
              ...data,
              data: data.data.filter((monitor) => monitor.id !== monitorId),
            };
          },
        },
      );

      console.log(`Successfully deleted monitor ${monitorId}`);
      await showToast({
        style: Toast.Style.Success,
        title: "Monitor Deleted",
        message: `Successfully deleted "${monitorName}"`,
      });
    } catch (error: unknown) {
      console.error(`Failed to delete monitor ${monitorId}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete monitor";
      await showToast({
        style: Toast.Style.Failure,
        title: "Delete Failed",
        message: errorMessage,
      });
      throw error;
    }
  };

  return {
    pauseMonitor,
    resumeMonitor,
    deleteMonitor,
  };
}
