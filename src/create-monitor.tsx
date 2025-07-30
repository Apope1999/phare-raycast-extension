import {
  Form,
  ActionPanel,
  Action,
  getPreferenceValues,
  showToast,
  Toast,
} from "@raycast/api";
import { useState } from "react";
import { Preferences } from "./types";

interface CreateMonitorForm {
  name: string;
  url: string;
  method: string;
  interval: string;
  timeout: string;
  regions: string;
  incidentConfirmations: string;
  recoveryConfirmations: string;
  followRedirects: boolean;
  tlsSkipVerify: boolean;
  keyword: string;
  userAgentSecret: string;
  statusCodeAssertion: string;
}

const API_BASE_URL = "https://api.phare.io/uptime";

export default function Command() {
  const { phareApiKey } = getPreferenceValues<Preferences>();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: CreateMonitorForm) {
    if (!phareApiKey) {
      await showToast({
        style: Toast.Style.Failure,
        title: "API Key Required",
        message: "Please set your Phare API key in preferences",
      });
      return;
    }

    setIsLoading(true);

    try {
      const monitorData = {
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
        success_assertions: values.statusCodeAssertion
          ? [
              {
                type: "status_code",
                operator: "in",
                value: values.statusCodeAssertion,
              },
            ]
          : [],
        incident_confirmations: parseInt(values.incidentConfirmations),
        recovery_confirmations: parseInt(values.recoveryConfirmations),
        regions: values.regions
          .split(",")
          .map((region) => region.trim())
          .filter(Boolean),
      };

      const response = await fetch(`${API_BASE_URL}/monitors`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${phareApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(monitorData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      const monitor = await response.json();

      await showToast({
        style: Toast.Style.Success,
        title: "Monitor Created",
        message: `Successfully created monitor "${monitor.name}"`,
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to Create Monitor",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create Monitor" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="name"
        title="Monitor Name"
        placeholder="My Website Monitor"
        required
      />

      <Form.TextField
        id="url"
        title="URL"
        placeholder="https://example.com"
        required
      />

      <Form.Dropdown id="method" title="HTTP Method" defaultValue="GET">
        <Form.Dropdown.Item value="GET" title="GET" />
        <Form.Dropdown.Item value="POST" title="POST" />
        <Form.Dropdown.Item value="HEAD" title="HEAD" />
        <Form.Dropdown.Item value="PUT" title="PUT" />
        <Form.Dropdown.Item value="DELETE" title="DELETE" />
      </Form.Dropdown>

      <Form.TextField
        id="interval"
        title="Check Interval (seconds)"
        placeholder="60"
        defaultValue="60"
        required
      />

      <Form.TextField
        id="timeout"
        title="Timeout (milliseconds)"
        placeholder="7000"
        defaultValue="7000"
        required
      />

      <Form.TextField
        id="regions"
        title="Regions (comma-separated)"
        placeholder="as-jpn-hnd,us-nyc-nyc"
        defaultValue="as-jpn-hnd"
        info="Available regions: as-jpn-hnd, us-nyc-nyc, eu-fra-fra, etc."
      />

      <Form.TextField
        id="incidentConfirmations"
        title="Incident Confirmations"
        placeholder="1"
        defaultValue="1"
        required
      />

      <Form.TextField
        id="recoveryConfirmations"
        title="Recovery Confirmations"
        placeholder="1"
        defaultValue="1"
        required
      />

      <Form.TextField
        id="statusCodeAssertion"
        title="Status Code Assertion"
        placeholder="2xx,30x,418"
        info="Comma-separated status codes to consider as success"
      />

      <Form.TextField
        id="keyword"
        title="Keyword Check"
        placeholder="pong"
        info="Optional keyword to search for in response body"
      />

      <Form.TextField
        id="userAgentSecret"
        title="User Agent Secret"
        placeholder="definitely-not-a-bot"
        info="Optional custom user agent string"
      />

      <Form.Checkbox
        id="followRedirects"
        title="Follow Redirects"
        defaultValue={true}
      />

      <Form.Checkbox
        id="tlsSkipVerify"
        title="Skip TLS Verification"
        defaultValue={false}
      />
    </Form>
  );
}
