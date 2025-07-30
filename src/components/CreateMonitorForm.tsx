import { Form } from "@raycast/api";
import { FORM_OPTIONS } from "../utils/monitorUtils";

export function CreateMonitorForm() {
  return (
    <>
      <Form.TextField
        id="name"
        title="Monitor Name"
        placeholder="My Website Monitor"
      />

      <Form.TextField id="url" title="URL" placeholder="https://example.com" />

      <Form.Dropdown id="method" title="HTTP Method" defaultValue="GET">
        {FORM_OPTIONS.methods.map((method) => (
          <Form.Dropdown.Item
            key={method.value}
            value={method.value}
            title={method.title}
          />
        ))}
      </Form.Dropdown>

      <Form.Dropdown id="interval" title="Check Interval" defaultValue="60">
        {FORM_OPTIONS.intervals.map((interval) => (
          <Form.Dropdown.Item
            key={interval.value}
            value={interval.value}
            title={interval.title}
          />
        ))}
      </Form.Dropdown>

      <Form.Dropdown id="timeout" title="Timeout (seconds)" defaultValue="7000">
        {FORM_OPTIONS.timeouts.map((timeout) => (
          <Form.Dropdown.Item
            key={timeout.value}
            value={timeout.value}
            title={timeout.title}
          />
        ))}
      </Form.Dropdown>

      <Form.TagPicker
        id="regions"
        title="Regions"
        defaultValue={["as-jpn-hnd"]}
        info="Select one or more regions to monitor from"
      >
        {FORM_OPTIONS.regions.map((region) => (
          <Form.TagPicker.Item
            key={region.value}
            value={region.value}
            title={region.title}
          />
        ))}
      </Form.TagPicker>

      <Form.Dropdown
        id="incidentConfirmations"
        title="Incident Confirmations"
        defaultValue="1"
      >
        {FORM_OPTIONS.confirmations.map((confirmation) => (
          <Form.Dropdown.Item
            key={confirmation.value}
            value={confirmation.value}
            title={confirmation.title}
          />
        ))}
      </Form.Dropdown>

      <Form.Dropdown
        id="recoveryConfirmations"
        title="Recovery Confirmations"
        defaultValue="1"
      >
        {FORM_OPTIONS.confirmations.map((confirmation) => (
          <Form.Dropdown.Item
            key={confirmation.value}
            value={confirmation.value}
            title={confirmation.title}
          />
        ))}
      </Form.Dropdown>

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
    </>
  );
}
