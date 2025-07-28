import { Monitor, Assertion } from "../types";

export function getEffectiveStatus(monitor: Monitor): string {
  if (monitor.paused) {
    return "paused";
  }
  return monitor.status;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "fetching":
      return "#38bdf8"; // blue
    case "online":
      return "#4ade80"; // green
    case "offline":
      return "#f87171"; // red
    case "partial":
      return "#facc15"; // yellow
    case "paused":
      return "#a1a1aa"; // gray
    default:
      return "#a1a1aa"; // default gray
  }
}

export function groupMonitorsByStatus(monitors: Monitor[]): {
  [key: string]: Monitor[];
} {
  const grouped: { [key: string]: Monitor[] } = {
    Online: [],
    Offline: [],
    Paused: [],
    Partial: [],
    Fetching: [],
    Other: [],
  };

  monitors.forEach((monitor) => {
    const effectiveStatus = getEffectiveStatus(monitor);
    switch (effectiveStatus) {
      case "online":
        grouped.Online.push(monitor);
        break;
      case "offline":
        grouped.Offline.push(monitor);
        break;
      case "paused":
        grouped.Paused.push(monitor);
        break;
      case "partial":
        grouped.Partial.push(monitor);
        break;
      case "fetching":
        grouped.Fetching.push(monitor);
        break;
      default:
        grouped.Other.push(monitor);
        break;
    }
  });

  Object.keys(grouped).forEach((key) => {
    if (grouped[key].length === 0) {
      delete grouped[key];
    }
  });

  return grouped;
}

export function formatSuccessAssertions(assertions: Assertion[]): string {
  return assertions
    .map((a: Assertion) => `${a.type} ${a.operator} ${a.value}`)
    .join(", ");
}
