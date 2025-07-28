import {
  ActionPanel,
  Detail,
  List,
  Action,
  Icon,
  getPreferenceValues,
  openExtensionPreferences,
  showToast,
  Toast,
} from "@raycast/api";
import { useEffect, useState } from "react";

interface Monitor {
  id: number;
  name: string;
  status: string;
  protocol: string;
  request: {
    url: string;
    method: string;
    tls_skip_verify: boolean;
    follow_redirects: boolean;
  };
  interval: number;
  timeout: number;
  success_assertions: any[];
  incident_confirmations: number;
  recovery_confirmations: number;
  regions: string[];
  response_time: number;
  updated_at: string;
  created_at: string;
}

interface Preferences {
  phareApiKey: string;
}

export default function Command() {
  const { phareApiKey } = getPreferenceValues<Preferences>();
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMonitors() {
      if (!phareApiKey) {
        setError("API key missing");
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch("https://api.phare.io/uptime/monitors", {
          headers: {
            Authorization: `Bearer ${phareApiKey}`,
            "Content-Type": "application/json",
          },
        });
        const text = await response.text();
        let data: any;
        try {
          data = JSON.parse(text);
        } catch (jsonErr) {
          setError(`Failed to parse JSON: ${text}`);
          return;
        }
        if (!response.ok) {
          setError(
            `API error: ${response.status}\n${JSON.stringify(data, null, 2)}`,
          );
          return;
        }
        // Use the 'data' array from the API response
        if (!Array.isArray(data.data)) {
          setError(`Unexpected API response: no 'data' array`);
          return;
        }
        // Show all monitors (including paused ones)
        setMonitors(data.data);
      } catch (e: any) {
        setError(e.message || "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }
    fetchMonitors();
  }, [phareApiKey]);

  if (error) {
    return (
      <Detail
        markdown={`# Error\n${error}\n\nPlease check your API key in the extension preferences.`}
        actions={
          <ActionPanel>
            <Action
              title="Open Extension Preferences"
              onAction={openExtensionPreferences}
            />
          </ActionPanel>
        }
      />
    );
  }

  // Group monitors by status for sections
  const groupedMonitors: { [key: string]: Monitor[] } = {
    Online: [],
    Offline: [],
    Other: [],
  };
  monitors.forEach((monitor) => {
    if (monitor.status === "online") groupedMonitors.Online.push(monitor);
    else if (monitor.status === "offline")
      groupedMonitors.Offline.push(monitor);
    else groupedMonitors.Other.push(monitor);
  });

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search monitors..."
      navigationTitle="Phare Monitors"
      isShowingDetail
    >
      {monitors.length === 0 && !isLoading ? (
        <List.EmptyView title="No active monitors found" />
      ) : null}
      {Object.entries(groupedMonitors).map(([section, items]) =>
        items.length > 0 ? (
          <List.Section key={section} title={section}>
            {items.map((monitor: Monitor) => {
              let statusColor = "#a1a1aa"; // default gray
              switch (monitor.status) {
                case "fetching":
                  statusColor = "#38bdf8"; // blue
                  break;
                case "online":
                  statusColor = "#4ade80"; // green
                  break;
                case "offline":
                  statusColor = "#f87171"; // red
                  break;
                case "partial":
                  statusColor = "#facc15"; // yellow
                  break;
              }
              return (
                <List.Item
                  key={monitor.id}
                  icon={Icon.Network}
                  title={monitor.name}
                  detail={
                    <List.Item.Detail
                      metadata={
                        <List.Item.Detail.Metadata>
                          <List.Item.Detail.Metadata.TagList title="Status">
                            <List.Item.Detail.Metadata.TagList.Item
                              text={monitor.status}
                              color={statusColor}
                            />
                          </List.Item.Detail.Metadata.TagList>
                          <List.Item.Detail.Metadata.Separator />
                          <List.Item.Detail.Metadata.Label
                            title="Protocol"
                            text={monitor.protocol.toUpperCase()}
                            icon={
                              monitor.protocol === "https"
                                ? Icon.Lock
                                : Icon.Globe
                            }
                          />
                          <List.Item.Detail.Metadata.Label
                            title="Method"
                            text={monitor.request.method}
                          />
                          <List.Item.Detail.Metadata.Label
                            title="URL"
                            text={monitor.request.url}
                          />
                          <List.Item.Detail.Metadata.Separator />
                          <List.Item.Detail.Metadata.Label
                            title="Response Time"
                            text={`${monitor.response_time}ms`}
                            icon={Icon.Clock}
                          />
                          <List.Item.Detail.Metadata.Label
                            title="Regions"
                            text={monitor.regions.join(", ")}
                          />
                          <List.Item.Detail.Metadata.Label
                            title="Interval"
                            text={`${monitor.interval}s`}
                          />
                          <List.Item.Detail.Metadata.Label
                            title="Timeout"
                            text={`${monitor.timeout}ms`}
                          />
                          <List.Item.Detail.Metadata.Separator />
                          <List.Item.Detail.Metadata.Label
                            title="Incident Confirmations"
                            text={String(monitor.incident_confirmations)}
                          />
                          <List.Item.Detail.Metadata.Label
                            title="Recovery Confirmations"
                            text={String(monitor.recovery_confirmations)}
                          />
                          <List.Item.Detail.Metadata.Separator />
                          <List.Item.Detail.Metadata.Label
                            title="Follow Redirects"
                            text={
                              monitor.request.follow_redirects ? "Yes" : "No"
                            }
                          />
                          <List.Item.Detail.Metadata.Label
                            title="TLS Skip Verify"
                            text={
                              monitor.request.tls_skip_verify ? "Yes" : "No"
                            }
                          />
                          <List.Item.Detail.Metadata.Label
                            title="Success Assertions"
                            text={monitor.success_assertions
                              .map(
                                (a: any) =>
                                  `${a.type} ${a.operator} ${a.value}`,
                              )
                              .join(", ")}
                          />
                          <List.Item.Detail.Metadata.Separator />
                          <List.Item.Detail.Metadata.Label
                            title="Created"
                            text={new Date(monitor.created_at).toLocaleString()}
                          />
                          <List.Item.Detail.Metadata.Label
                            title="Updated"
                            text={new Date(monitor.updated_at).toLocaleString()}
                          />
                        </List.Item.Detail.Metadata>
                      }
                    />
                  }
                  actions={
                    <ActionPanel>
                      <Action.OpenInBrowser
                        title="Open Monitor in Browser"
                        url={`https://app.phare.io/uptime/monitors/${monitor.id}`}
                      />
                      {monitor.status !== "paused" ? (
                        <Action
                          title="Pause Monitor"
                          icon={Icon.Pause}
                          shortcut={{ modifiers: ["cmd"], key: "p" }}
                          onAction={async () => {
                            try {
                              const response = await fetch(
                                `https://api.phare.io/uptime/monitors/${monitor.id}/pause`,
                                {
                                  method: "POST",
                                  headers: {
                                    Authorization: `Bearer ${phareApiKey}`,
                                    "Content-Type": "application/json",
                                  },
                                },
                              );

                              if (!response.ok) {
                                const errorText = await response.text();
                                let errorData;
                                try {
                                  errorData = JSON.parse(errorText);
                                } catch {
                                  errorData = { message: errorText };
                                }
                                throw new Error(
                                  `Failed to pause monitor: ${response.status} - ${errorData.message || "Unknown error"}`,
                                );
                              }

                              await showToast({
                                style: Toast.Style.Success,
                                title: "Monitor Paused",
                                message: `Successfully paused "${monitor.name}"`,
                              });

                              // Update the monitor status in local state
                              setMonitors((prevMonitors) =>
                                prevMonitors.map((m) =>
                                  m.id === monitor.id
                                    ? { ...m, status: "paused" }
                                    : m,
                                ),
                              );
                            } catch (error: any) {
                              await showToast({
                                style: Toast.Style.Failure,
                                title: "Pause Failed",
                                message:
                                  error.message || "Failed to pause monitor",
                              });
                            }
                          }}
                        />
                      ) : (
                        <Action
                          title="Resume Monitor"
                          icon={Icon.Play}
                          shortcut={{ modifiers: ["cmd"], key: "r" }}
                          onAction={async () => {
                            try {
                              const response = await fetch(
                                `https://api.phare.io/uptime/monitors/${monitor.id}/resume`,
                                {
                                  method: "POST",
                                  headers: {
                                    Authorization: `Bearer ${phareApiKey}`,
                                    "Content-Type": "application/json",
                                  },
                                },
                              );

                              if (!response.ok) {
                                const errorText = await response.text();
                                let errorData;
                                try {
                                  errorData = JSON.parse(errorText);
                                } catch {
                                  errorData = { message: errorText };
                                }
                                throw new Error(
                                  `Failed to resume monitor: ${response.status} - ${errorData.message || "Unknown error"}`,
                                );
                              }

                              await showToast({
                                style: Toast.Style.Success,
                                title: "Monitor Resumed",
                                message: `Successfully resumed "${monitor.name}"`,
                              });

                              // Update the monitor status in local state to "online" (or we could fetch fresh data)
                              setMonitors((prevMonitors) =>
                                prevMonitors.map((m) =>
                                  m.id === monitor.id
                                    ? { ...m, status: "online" }
                                    : m,
                                ),
                              );
                            } catch (error: any) {
                              await showToast({
                                style: Toast.Style.Failure,
                                title: "Resume Failed",
                                message:
                                  error.message || "Failed to resume monitor",
                              });
                            }
                          }}
                        />
                      )}
                      <Action
                        title="Delete Monitor"
                        icon={Icon.Trash}
                        style={Action.Style.Destructive}
                        shortcut={{ modifiers: ["cmd", "shift"], key: "d" }}
                        onAction={async () => {
                          try {
                            const response = await fetch(
                              `https://api.phare.io/uptime/monitors/${monitor.id}`,
                              {
                                method: "DELETE",
                                headers: {
                                  Authorization: `Bearer ${phareApiKey}`,
                                  "Content-Type": "application/json",
                                },
                              },
                            );

                            if (!response.ok) {
                              const errorText = await response.text();
                              let errorData;
                              try {
                                errorData = JSON.parse(errorText);
                              } catch {
                                errorData = { message: errorText };
                              }
                              throw new Error(
                                `Failed to delete monitor: ${response.status} - ${errorData.message || "Unknown error"}`,
                              );
                            }

                            await showToast({
                              style: Toast.Style.Success,
                              title: "Monitor Deleted",
                              message: `Successfully deleted "${monitor.name}"`,
                            });

                            // Remove the monitor from the local state
                            setMonitors((prevMonitors) =>
                              prevMonitors.filter((m) => m.id !== monitor.id),
                            );
                          } catch (error: any) {
                            await showToast({
                              style: Toast.Style.Failure,
                              title: "Delete Failed",
                              message:
                                error.message || "Failed to delete monitor",
                            });
                          }
                        }}
                      />
                    </ActionPanel>
                  }
                />
              );
            })}
          </List.Section>
        ) : null,
      )}
    </List>
  );
}
