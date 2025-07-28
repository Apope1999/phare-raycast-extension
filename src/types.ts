export interface Monitor {
  id: number;
  name: string;
  status: string;
  protocol: string;
  request: {
    url: string;
    method: string;
    tls_skip_verify: boolean;
    follow_redirects: boolean;
  };
  interval: number;
  timeout: number;
  success_assertions: unknown[];
  incident_confirmations: number;
  recovery_confirmations: number;
  regions: string[];
  response_time: number;
  updated_at: string;
  created_at: string;
}

export interface Preferences {
  phareApiKey: string;
}

export interface ApiResponse<T> {
  data: T;
}
