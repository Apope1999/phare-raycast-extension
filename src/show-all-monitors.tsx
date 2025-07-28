import { List, getPreferenceValues } from "@raycast/api";
import { Preferences } from "./types";
import { useMonitors } from "./hooks/useMonitors";
import { groupMonitorsByStatus } from "./utils/monitorUtils";
import { MonitorItem } from "./components/MonitorItem";
import { ErrorView } from "./components/ErrorView";

export default function Command() {
  const { phareApiKey } = getPreferenceValues<Preferences>();
  const { monitors, isLoading, error } = useMonitors(phareApiKey);

  if (error) {
    return <ErrorView error={error} />;
  }

  // Group monitors by status for sections
  const groupedMonitors = groupMonitorsByStatus(monitors);

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
            {items.map((monitor) => (
              <MonitorItem
                key={`${monitor.id}-${monitor.status}`}
                monitor={monitor}
                apiKey={phareApiKey}
              />
            ))}
          </List.Section>
        ) : null,
      )}
    </List>
  );
}
