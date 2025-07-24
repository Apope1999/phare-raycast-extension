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
        const response = await fetch("https://api.phare.io/v1/monitors", {
          headers: {
            Authorization: `Bearer ${phareApiKey}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = (await response.json()) as { monitors: Monitor[] };
        setMonitors(data.monitors || []);
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
      {monitors.map((monitor) => (
        <List.Item
          key={monitor.id}
          icon={monitor.status === "up" ? Icon.CheckCircle : Icon.XMarkCircle}
          title={monitor.name}
          accessories={[{ text: monitor.status }]}
        />
      ))}
    </List>
  );
}
