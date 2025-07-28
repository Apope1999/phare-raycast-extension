import { List, Icon } from "@raycast/api";
import { Monitor } from "../types";
import { MonitorDetail } from "./MonitorDetail";
import { MonitorActions } from "./MonitorActions";

interface MonitorItemProps {
  monitor: Monitor;
  apiKey: string;
}

export function MonitorItem({ monitor, apiKey }: MonitorItemProps) {
  return (
    <List.Item
      key={monitor.id}
      icon={Icon.Network}
      title={monitor.name}
      detail={<MonitorDetail monitor={monitor} />}
      actions={<MonitorActions monitor={monitor} apiKey={apiKey} />}
    />
  );
}
