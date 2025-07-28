import { ActionPanel, Action, Icon } from "@raycast/api";
import { Monitor } from "../types";
import { useMonitorActions } from "../hooks/useMonitorActions";

interface MonitorActionsProps {
  monitor: Monitor;
  apiKey: string;
}

export function MonitorActions({ monitor, apiKey }: MonitorActionsProps) {
  const { pauseMonitor, resumeMonitor, deleteMonitor } =
    useMonitorActions(apiKey);

  const handlePause = () => pauseMonitor(monitor.id, monitor.name);
  const handleResume = () => resumeMonitor(monitor.id, monitor.name);
  const handleDelete = () => deleteMonitor(monitor.id, monitor.name);

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
