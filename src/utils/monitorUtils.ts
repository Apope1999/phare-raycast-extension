import { Monitor } from "../types";

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
    Other: [],
  };

  monitors.forEach((monitor) => {
    if (monitor.status === "online") {
      grouped.Online.push(monitor);
    } else if (monitor.status === "offline") {
      grouped.Offline.push(monitor);
    } else {
      grouped.Other.push(monitor);
    }
  });

  return grouped;
}

interface Assertion {
  type: string;
  operator: string;
  value: string | number;
}

export function formatSuccessAssertions(assertions: Assertion[]): string {
  return assertions
    .map((a: Assertion) => `${a.type} ${a.operator} ${a.value}`)
    .join(", ");
}
