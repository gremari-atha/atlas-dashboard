import { z } from "zod";
import {
  apiFetch,
  mapPaginatedResponse,
  parseApiResponse,
} from "@/lib/api-client";

export interface ConnectedBot {
  name: string;
  status: "ACTIVE" | "STANDBY";
  connectedAt: number;
}

export interface BotLog {
  id: string;
  bot_name: string;
  level: string;
  message: string;
  created_at: string;
}

export const BotLogsFilterSchema = z.object({
  botName: z.string(),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(50),
});

export type BotLogsFilter = z.infer<typeof BotLogsFilterSchema>;

export async function getActiveBots(): Promise<ConnectedBot[]> {
  const response = await apiFetch("/bot/active");
  if (!response.ok) {
    const errorData = await parseApiResponse(response);
    throw new Error(errorData.message || "Failed to fetch active bots");
  }
  const data = await response.json();
  return data.data || [];
}

export async function sendBotStandby(
  botName: string,
): Promise<{ message: string }> {
  const response = await apiFetch("/bot/standby", undefined, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ botName }),
  });
  if (!response.ok) {
    const errorData = await parseApiResponse(response);
    throw new Error(errorData.message || "Failed to standby bot");
  }
  return response.json();
}

export async function sendBotResume(
  botName: string,
): Promise<{ message: string }> {
  const response = await apiFetch("/bot/resume", undefined, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ botName }),
  });
  if (!response.ok) {
    const errorData = await parseApiResponse(response);
    throw new Error(errorData.message || "Failed to resume bot");
  }
  return response.json();
}

export async function sendBotRestart(
  botName: string,
): Promise<{ message: string }> {
  const response = await apiFetch("/bot/restart", undefined, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ botName }),
  });
  if (!response.ok) {
    const errorData = await parseApiResponse(response);
    throw new Error(errorData.message || "Failed to restart bot");
  }
  return response.json();
}

export async function getBotLogs(params: BotLogsFilter) {
  const response = await apiFetch("/bot/log", params);
  if (!response.ok) {
    const errorData = await parseApiResponse(response);
    throw new Error(errorData.message || "Failed to fetch bot logs");
  }
  const data = await response.json();
  const items = data.data || [];
  return mapPaginatedResponse({
    data: items,
    meta: data.meta || {
      page: params.page || 1,
      limit: params.limit || 50,
      total: data.total || items.length,
      totalPages: Math.ceil(
        (data.total || items.length) / (params.limit || 50),
      ),
    },
  });
}

export async function getBotAPIKey(): Promise<{ apiKey: string }> {
  const response = await apiFetch("/bot/api-key");
  if (!response.ok) {
    const errorData = await parseApiResponse(response);
    throw new Error(errorData.message || "Failed to fetch API key");
  }
  return response.json();
}

export async function generateBotAPIKey(): Promise<{ apiKey: string }> {
  const response = await apiFetch("/bot/api-key", undefined, {
    method: "POST",
  });
  if (!response.ok) {
    const errorData = await parseApiResponse(response);
    throw new Error(errorData.message || "Failed to generate API key");
  }
  return response.json();
}

export const botService = {
  getActiveBots,
  sendBotStandby,
  sendBotResume,
  sendBotRestart,
  getBotLogs,
  getBotAPIKey,
  generateBotAPIKey,
};
