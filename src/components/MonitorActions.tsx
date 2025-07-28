import { ActionPanel, Action, Icon, showToast, Toast } from "@raycast/api";
import { useMemo } from "react";
import { Monitor } from "../types";
import { PhareApiService } from "../services/phareApi";

interface MonitorActionsProps {
  monitor: Monitor;
  apiKey: string;
  onStatusUpdate: (monitorId: number, status: string) => void;
  onRemove: (monitorId: number) => void;
}

export function MonitorActions({
  monitor,
  apiKey,
  onStatusUpdate,
  onRemove,
}: MonitorActionsProps) {
  const apiService = useMemo(() => new PhareApiService(apiKey), [apiKey]);

  const handlePause = async () => {
    console.log(`Attempting to pause monitor ${monitor.id}`);
    try {
      await apiService.pauseMonitor(monitor.id);
      console.log(`Successfully paused monitor ${monitor.id}`);
      await showToast({
        style: Toast.Style.Success,
        title: "Monitor Paused",
        message: `Successfully paused "${monitor.name}"`,
      });
      onStatusUpdate(monitor.id, "paused");
    } catch (error: any) {
      console.error(`Failed to pause monitor ${monitor.id}:`, error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Pause Failed",
        message: error.message || "Failed to pause monitor",
      });
    }
  };

  const handleResume = async () => {
    console.log(`Attempting to resume monitor ${monitor.id}`);
    try {
      await apiService.resumeMonitor(monitor.id);
      console.log(`Successfully resumed monitor ${monitor.id}`);
      await showToast({
        style: Toast.Style.Success,
        title: "Monitor Resumed",
        message: `Successfully resumed "${monitor.name}"`,
      });
      onStatusUpdate(monitor.id, "online");
    } catch (error: any) {
      console.error(`Failed to resume monitor ${monitor.id}:`, error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Resume Failed",
        message: error.message || "Failed to resume monitor",
      });
    }
  };

  const handleDelete = async () => {
    console.log(`Attempting to delete monitor ${monitor.id}`);
    try {
      await apiService.deleteMonitor(monitor.id);
      console.log(`Successfully deleted monitor ${monitor.id}`);
      await showToast({
        style: Toast.Style.Success,
        title: "Monitor Deleted",
        message: `Successfully deleted "${monitor.name}"`,
      });
      onRemove(monitor.id);
    } catch (error: any) {
      console.error(`Failed to delete monitor ${monitor.id}:`, error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Delete Failed",
        message: error.message || "Failed to delete monitor",
      });
    }
  };

  return (
    <ActionPanel>
      <Action.OpenInBrowser
        title="Open Monitor in Browser"
        url={`https://app.phare.io/uptime/monitors/${monitor.id}`}
      />
      {monitor.status !== "paused" ? (
        <Action
          title="Pause Monitor"
          icon={Icon.Pause}
          shortcut={{ modifiers: ["cmd", "shift"], key: "p" }}
          onAction={handlePause}
        />
      ) : (
        <Action
          title="Resume Monitor"
          icon={Icon.Play}
          shortcut={{ modifiers: ["cmd", "shift"], key: "r" }}
          onAction={handleResume}
        />
      )}
      <Action
        title="Delete Monitor"
        icon={Icon.Trash}
        style={Action.Style.Destructive}
        shortcut={{ modifiers: ["cmd", "shift"], key: "d" }}
        onAction={handleDelete}
      />
    </ActionPanel>
  );
}
