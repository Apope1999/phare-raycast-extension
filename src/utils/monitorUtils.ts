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

// Form data transformation
export function transformFormDataToMonitor(values: {
  name: string;
  url: string;
  method: string;
  interval: string;
  timeout: string;
  regions: string[];
  incidentConfirmations: string;
  recoveryConfirmations: string;
  followRedirects: boolean;
  tlsSkipVerify: boolean;
  keyword: string;
  userAgentSecret: string;
  statusCodeAssertion: string;
}) {
  return {
    name: values.name,
    protocol: "http",
    request: {
      method: values.method.toUpperCase(),
      url: values.url,
      tls_skip_verify: values.tlsSkipVerify,
      follow_redirects: values.followRedirects,
      ...(values.keyword && { keyword: values.keyword }),
      ...(values.userAgentSecret && {
        user_agent_secret: values.userAgentSecret,
      }),
    },
    interval: parseInt(values.interval),
    timeout: parseInt(values.timeout),
    success_assertions: [
      {
        type: "status_code",
        operator: "in",
        value: values.statusCodeAssertion || "2xx,30x",
      },
    ],
    incident_confirmations: parseInt(values.incidentConfirmations),
    recovery_confirmations: parseInt(values.recoveryConfirmations),
    regions: values.regions,
  };
}

// Form options constants
export const FORM_OPTIONS = {
  methods: [
    { value: "GET", title: "GET" },
    { value: "HEAD", title: "HEAD" },
  ],
  intervals: [
    { value: "30", title: "30 seconds" },
    { value: "60", title: "1 minute" },
    { value: "120", title: "2 minutes" },
    { value: "180", title: "3 minutes" },
    { value: "300", title: "5 minutes" },
    { value: "600", title: "10 minutes" },
    { value: "900", title: "15 minutes" },
    { value: "1800", title: "30 minutes" },
    { value: "3600", title: "1 hour" },
  ],
  timeouts: [
    { value: "1000", title: "1 second" },
    { value: "2000", title: "2 seconds" },
    { value: "3000", title: "3 seconds" },
    { value: "4000", title: "4 seconds" },
    { value: "5000", title: "5 seconds" },
    { value: "6000", title: "6 seconds" },
    { value: "7000", title: "7 seconds" },
    { value: "8000", title: "8 seconds" },
    { value: "9000", title: "9 seconds" },
    { value: "10000", title: "10 seconds" },
    { value: "15000", title: "15 seconds" },
    { value: "20000", title: "20 seconds" },
    { value: "25000", title: "25 seconds" },
    { value: "30000", title: "30 seconds" },
  ],
  regions: [
    { value: "as-jpn-hnd", title: "Tokyo, Japan" },
    { value: "as-sgp-sin", title: "Singapore" },
    { value: "as-tha-bkk", title: "Bangkok, Thailand" },
    { value: "eu-deu-fra", title: "Frankfurt, Germany" },
    { value: "eu-gbr-lhr", title: "London, UK" },
    { value: "eu-swe-arn", title: "Stockholm, Sweden" },
    { value: "na-mex-mex", title: "Mexico City, Mexico" },
    { value: "na-usa-iad", title: "Washington DC, USA" },
    { value: "na-usa-sea", title: "Seattle, USA" },
    { value: "oc-aus-syd", title: "Sydney, Australia" },
    { value: "sa-bra-gru", title: "São Paulo, Brazil" },
  ],
  confirmations: [
    { value: "1", title: "1 confirmation" },
    { value: "2", title: "2 confirmations" },
    { value: "3", title: "3 confirmations" },
    { value: "4", title: "4 confirmations" },
    { value: "5", title: "5 confirmations" },
  ],
} as const;
