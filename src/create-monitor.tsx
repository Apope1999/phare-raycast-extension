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
  regions: string[];
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

    if (!values.name || !values.url) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Required Fields Missing",
        message: "Please fill in the monitor name and URL",
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
      />

      <Form.TextField id="url" title="URL" placeholder="https://example.com" />

      <Form.Dropdown id="method" title="HTTP Method" defaultValue="GET">
        <Form.Dropdown.Item value="GET" title="GET" />
        <Form.Dropdown.Item value="HEAD" title="HEAD" />
      </Form.Dropdown>

      <Form.TextField
        id="interval"
        title="Check Interval (seconds)"
        placeholder="60"
        defaultValue="60"
      />

      <Form.Dropdown id="timeout" title="Timeout (seconds)" defaultValue="7000">
        <Form.Dropdown.Item value="1000" title="1 second" />
        <Form.Dropdown.Item value="2000" title="2 seconds" />
        <Form.Dropdown.Item value="3000" title="3 seconds" />
        <Form.Dropdown.Item value="4000" title="4 seconds" />
        <Form.Dropdown.Item value="5000" title="5 seconds" />
        <Form.Dropdown.Item value="6000" title="6 seconds" />
        <Form.Dropdown.Item value="7000" title="7 seconds" />
        <Form.Dropdown.Item value="8000" title="8 seconds" />
        <Form.Dropdown.Item value="9000" title="9 seconds" />
        <Form.Dropdown.Item value="10000" title="10 seconds" />
        <Form.Dropdown.Item value="15000" title="15 seconds" />
        <Form.Dropdown.Item value="20000" title="20 seconds" />
        <Form.Dropdown.Item value="25000" title="25 seconds" />
        <Form.Dropdown.Item value="30000" title="30 seconds" />
      </Form.Dropdown>

      <Form.TagPicker
        id="regions"
        title="Regions"
        defaultValue={["as-jpn-hnd"]}
        info="Select one or more regions to monitor from"
      >
        <Form.TagPicker.Item value="as-jpn-hnd" title="Tokyo, Japan" />
        <Form.TagPicker.Item value="as-sgp-sin" title="Singapore" />
        <Form.TagPicker.Item value="as-tha-bkk" title="Bangkok, Thailand" />
        <Form.TagPicker.Item value="eu-deu-fra" title="Frankfurt, Germany" />
        <Form.TagPicker.Item value="eu-gbr-lhr" title="London, UK" />
        <Form.TagPicker.Item value="eu-swe-arn" title="Stockholm, Sweden" />
        <Form.TagPicker.Item value="na-mex-mex" title="Mexico City, Mexico" />
        <Form.TagPicker.Item value="na-usa-iad" title="Washington DC, USA" />
        <Form.TagPicker.Item value="na-usa-sea" title="Seattle, USA" />
        <Form.TagPicker.Item value="oc-aus-syd" title="Sydney, Australia" />
        <Form.TagPicker.Item value="sa-bra-gru" title="São Paulo, Brazil" />
      </Form.TagPicker>

      <Form.TextField
        id="incidentConfirmations"
        title="Incident Confirmations"
        placeholder="1"
        defaultValue="1"
      />

      <Form.TextField
        id="recoveryConfirmations"
        title="Recovery Confirmations"
        placeholder="1"
        defaultValue="1"
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
        label="Follow Redirects"
        defaultValue={true}
      />

      <Form.Checkbox
        id="tlsSkipVerify"
        title="Skip TLS Verification"
        label="Skip TLS Verification"
        defaultValue={false}
      />
    </Form>
  );
}
