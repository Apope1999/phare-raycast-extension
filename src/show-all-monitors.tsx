import { ActionPanel, Detail, List, Action, Icon, getPreferenceValues, openExtensionPreferences, showToast, Toast } from "@raycast/api";
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
          setError(`API error: ${response.status}\n${JSON.stringify(data, null, 2)}`);
          return;
        }
        // Use the 'data' array from the API response
        if (!Array.isArray(data.data)) {
          setError(`Unexpected API response: no 'data' array`);
          return;
        }
        // Only show active (not paused) monitors
        const activeMonitors = data.data.filter((m: any) => !m.paused);
        setMonitors(activeMonitors);
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
            <Action title="Open Extension Preferences" onAction={openExtensionPreferences} />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search monitors..." navigationTitle="Phare Monitors" isShowingDetail>
      {monitors.length === 0 && !isLoading ? (
        <List.EmptyView title="No active monitors found" />
      ) : null}
      <List.Section title="Active Monitors">
        {monitors.map((monitor: Monitor) => {
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
                  markdown={`### ${monitor.name}\n\n**Status:** ${monitor.status}\n\n**URL:** [${monitor.request.url}](${monitor.request.url})\n\n**Protocol:** ${monitor.protocol.toUpperCase()}\n\n**Method:** ${monitor.request.method}\n\n**Response Time:** ${monitor.response_time}ms\n\n**Regions:** ${monitor.regions.join(", ")}\n\n**Interval:** ${monitor.interval}s\n**Timeout:** ${monitor.timeout}ms\n\n**Incident Confirmations:** ${monitor.incident_confirmations}\n**Recovery Confirmations:** ${monitor.recovery_confirmations}\n\n**Follow Redirects:** ${monitor.request.follow_redirects ? "Yes" : "No"}\n**TLS Skip Verify:** ${monitor.request.tls_skip_verify ? "Yes" : "No"}\n\n**Success Assertions:**\n${monitor.success_assertions.map((a: any) => `- ${a.type} ${a.operator} ${a.value}`).join("\n")}\n\n**Created:** ${new Date(monitor.created_at).toLocaleString()}\n**Updated:** ${new Date(monitor.updated_at).toLocaleString()}`}
                  metadata={
                    <List.Item.Detail.Metadata>
                      <List.Item.Detail.Metadata.TagList title="Status">
                        <List.Item.Detail.Metadata.TagList.Item text={monitor.status} color={statusColor} />
                      </List.Item.Detail.Metadata.TagList>
                      <List.Item.Detail.Metadata.Label title="Protocol" text={monitor.protocol.toUpperCase()} icon={monitor.protocol === "https" ? Icon.Lock : Icon.Globe} />
                      <List.Item.Detail.Metadata.Label title="Method" text={monitor.request.method} />
                      <List.Item.Detail.Metadata.Label title="URL" text={monitor.request.url} />
                      <List.Item.Detail.Metadata.Label title="Response Time" text={`${monitor.response_time}ms`} icon={Icon.Clock} />
                      <List.Item.Detail.Metadata.Label title="Regions" text={monitor.regions.join(", ")} />
                      <List.Item.Detail.Metadata.Label title="Interval" text={`${monitor.interval}s`} />
                      <List.Item.Detail.Metadata.Label title="Timeout" text={`${monitor.timeout}ms`} />
                      <List.Item.Detail.Metadata.Label title="Incident Confirmations" text={String(monitor.incident_confirmations)} />
                      <List.Item.Detail.Metadata.Label title="Recovery Confirmations" text={String(monitor.recovery_confirmations)} />
                      <List.Item.Detail.Metadata.Label title="Follow Redirects" text={monitor.request.follow_redirects ? "Yes" : "No"} />
                      <List.Item.Detail.Metadata.Label title="TLS Skip Verify" text={monitor.request.tls_skip_verify ? "Yes" : "No"} />
                      <List.Item.Detail.Metadata.Label title="Success Assertions" text={monitor.success_assertions.map((a: any) => `${a.type} ${a.operator} ${a.value}`).join(", ")} />
                      <List.Item.Detail.Metadata.Label title="Created" text={new Date(monitor.created_at).toLocaleString()} />
                      <List.Item.Detail.Metadata.Label title="Updated" text={new Date(monitor.updated_at).toLocaleString()} />
                    </List.Item.Detail.Metadata>
                  }
                />
              }
            />
          );
        })}
      </List.Section>
    </List>
  );
}
