import { List, Icon } from "@raycast/api";
import { Monitor } from "../types";
import { MonitorDetail } from "./MonitorDetail";
import { MonitorActions } from "./MonitorActions";

interface MonitorItemProps {
  monitor: Monitor;
  apiKey: string;
  onStatusUpdate: (monitorId: number, status: string) => void;
  onRemove: (monitorId: number) => void;
}

export function MonitorItem({
  monitor,
  apiKey,
  onStatusUpdate,
  onRemove,
}: MonitorItemProps) {
  return (
    <List.Item
      key={monitor.id}
      icon={Icon.Network}
      title={monitor.name}
      detail={<MonitorDetail monitor={monitor} />}
      actions={
        <MonitorActions
          monitor={monitor}
          apiKey={apiKey}
          onStatusUpdate={onStatusUpdate}
          onRemove={onRemove}
        />
      }
    />
  );
}
