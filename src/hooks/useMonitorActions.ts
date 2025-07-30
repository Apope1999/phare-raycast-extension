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

  const createMonitor = async (monitorData: Record<string, unknown>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/monitors`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(monitorData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      const monitor = await response.json();

      // Optimistically add the new monitor to the list
      await mutate(Promise.resolve({ data: [monitor] }), {
        optimisticUpdate: (data) => {
          if (!data?.data) return data;
          return {
            ...data,
            data: [...data.data, monitor],
          };
        },
      });

      await showToast({
        style: Toast.Style.Success,
        title: "Monitor Created",
        message: `Successfully created monitor "${monitor.name}"`,
      });

      return monitor;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to Create Monitor",
        message: errorMessage,
      });
      throw error;
    }
  };

  const pauseMonitor = async (monitorId: number, monitorName: string) => {
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
                  ? { ...monitor, paused: true }
                  : monitor,
              ),
            };
          },
        },
      );

      await showToast({
        style: Toast.Style.Success,
        title: "Monitor Paused",
        message: `Successfully paused "${monitorName}"`,
      });
    } catch (error: unknown) {
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
                  ? { ...monitor, paused: false }
                  : monitor,
              ),
            };
          },
        },
      );

      await showToast({
        style: Toast.Style.Success,
        title: "Monitor Resumed",
        message: `Successfully resumed "${monitorName}"`,
      });
    } catch (error: unknown) {
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

      await showToast({
        style: Toast.Style.Success,
        title: "Monitor Deleted",
        message: `Successfully deleted "${monitorName}"`,
      });
    } catch (error: unknown) {
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
    createMonitor,
    pauseMonitor,
    resumeMonitor,
    deleteMonitor,
  };
}
