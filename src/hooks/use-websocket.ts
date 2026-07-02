import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL } from "@/constants/api-url.cont";
import { getStoredTenant } from "@/lib/api-client";

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const listeners = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  const connect = useCallback(() => {
    if (ws.current) return;

    const tenant = getStoredTenant();
    if (!tenant) return;

    // Convert http(s) to ws(s)
    const wsUrl = new URL(API_URL);
    wsUrl.protocol = wsUrl.protocol === "https:" ? "wss:" : "ws:";
    wsUrl.pathname = "/ws";
    wsUrl.searchParams.set("token", tenant.accessToken);
    wsUrl.searchParams.set("connection_type", "CLIENT");
    wsUrl.searchParams.set("connection_name", "dashboard");

    const socket = new WebSocket(wsUrl.toString());
    ws.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      // Re-subscribe all active listeners on the server
      for (const eventName of listeners.current.keys()) {
        const set = listeners.current.get(eventName);
        if (set && set.size > 0) {
          socket.send(
            JSON.stringify({
              event: "subscribe-event",
              data: { eventName },
            }),
          );
        }
      }
    };

    socket.onmessage = (event) => {
      if (socket !== ws.current) return;
      try {
        const rawData = event.data;
        if (typeof rawData !== "string") return;

        // Split messages by newline in case Go's writePump batched multiple events
        const lines = rawData.split("\n").filter((line) => line.trim() !== "");
        for (const line of lines) {
          const message = JSON.parse(line);
          let { event: eventName, data } = message;

          // Extract real event name and data if wrapped by Go hub's BroadcastEvent
          if (
            eventName === "event" &&
            data &&
            typeof data === "object" &&
            "eventName" in data &&
            "payload" in data
          ) {
            eventName = data.eventName;
            data = data.payload;
          }

          // Notify subscribers
          const set = listeners.current.get(eventName);
          if (set) {
            for (const callback of set) {
              callback(data);
            }
          }
        }
      } catch (err) {
        console.error("[WS Client] Error in onmessage:", err);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      ws.current = null;
      // Reconnect after 3 seconds
      setTimeout(connect, 3000);
    };

    socket.onerror = () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [connect]);

  const subscribe = useCallback(
    (event: string, callback: (data: any) => void) => {
      let isFirst = false;
      if (!listeners.current.has(event)) {
        listeners.current.set(event, new Set());
        isFirst = true;
      }
      const set = listeners.current.get(event);
      if (set) {
        if (set.size === 0) {
          isFirst = true;
        }
        set.add(callback);
      }

      if (isFirst && ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            event: "subscribe-event",
            data: { eventName: event },
          }),
        );
      }

      // Return unsubscribe function
      return () => {
        const set = listeners.current.get(event);
        if (set) {
          set.delete(callback);
          if (set.size === 0) {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
              ws.current.send(
                JSON.stringify({
                  event: "unsubscribe-event",
                  data: { eventName: event },
                }),
              );
            }
          }
        }
      };
    },
    [],
  );

  const send = useCallback((event: string, data: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ event, data }));
    }
  }, []);

  return { isConnected, subscribe, send };
}
