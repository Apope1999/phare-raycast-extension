import { ActionPanel, Detail, List, Action, Icon, getPreferenceValues, openExtensionPreferences, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";

interface Monitor {
  id: string;
  name: string;
  status: string;
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
    <List isLoading={isLoading} searchBarPlaceholder="Search monitors...">
      {monitors.map((monitor: any) => (
        <List.Item
          key={monitor.id}
          icon={monitor.status === "online" ? Icon.CheckCircle : Icon.XMarkCircle}
          title={monitor.name}
          accessories={[{ text: monitor.status }]}
        />
      ))}
    </List>
  );
}
