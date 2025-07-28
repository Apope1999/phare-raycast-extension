import { Monitor, ApiResponse } from "../types";

const API_BASE_URL = "https://api.phare.io/uptime";

export class PhareApiService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const text = await response.text();
    let data: any;

    // Only try to parse JSON if there's actual content
    if (text.trim()) {
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        throw new Error(`Failed to parse JSON: ${text}`);
      }
    } else {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        `API error: ${response.status}\n${data ? JSON.stringify(data, null, 2) : text}`,
      );
    }

    return data;
  }

  private async makeSimpleRequest(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMessage = `API error: ${response.status}`;

      try {
        const errorData = JSON.parse(text);
        errorMessage += `\n${JSON.stringify(errorData, null, 2)}`;
      } catch {
        errorMessage += `\n${text}`;
      }

      throw new Error(errorMessage);
    }
  }

  async getMonitors(): Promise<Monitor[]> {
    const response =
      await this.makeRequest<ApiResponse<Monitor[]>>("/monitors");

    if (!Array.isArray(response.data)) {
      throw new Error("Unexpected API response: no 'data' array");
    }

    return response.data;
  }

  async pauseMonitor(monitorId: number): Promise<void> {
    await this.makeSimpleRequest(`/monitors/${monitorId}/pause`, {
      method: "POST",
    });
  }

  async resumeMonitor(monitorId: number): Promise<void> {
    await this.makeSimpleRequest(`/monitors/${monitorId}/resume`, {
      method: "POST",
    });
  }

  async deleteMonitor(monitorId: number): Promise<void> {
    await this.makeSimpleRequest(`/monitors/${monitorId}`, {
      method: "DELETE",
    });
  }
}
