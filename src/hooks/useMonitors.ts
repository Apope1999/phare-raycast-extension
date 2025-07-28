import { useState, useEffect } from "react";
import { Monitor } from "../types";
import { PhareApiService } from "../services/phareApi";

export function useMonitors(apiKey: string) {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMonitors() {
      if (!apiKey) {
        setError("API key missing");
        setIsLoading(false);
        return;
      }

      try {
        const apiService = new PhareApiService(apiKey);
        const data = await apiService.getMonitors();
        setMonitors(data);
        setError(null);
      } catch (e: any) {
        setError(e.message || "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMonitors();
  }, [apiKey]);

  const updateMonitorStatus = (monitorId: number, status: string) => {
    console.log(`Updating monitor ${monitorId} status to: ${status}`);
    setMonitors((prevMonitors) => {
      const updated = prevMonitors.map((m) =>
        m.id === monitorId ? { ...m, status } : m,
      );
      console.log(
        "Updated monitors:",
        updated.map((m) => `${m.id}:${m.status}`),
      );
      return updated;
    });
  };

  const removeMonitor = (monitorId: number) => {
    console.log(`Removing monitor ${monitorId}`);
    setMonitors((prevMonitors) =>
      prevMonitors.filter((m) => m.id !== monitorId),
    );
  };

  return {
    monitors,
    isLoading,
    error,
    updateMonitorStatus,
    removeMonitor,
  };
}
