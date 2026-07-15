import { z } from "zod";
import {
  apiFetch,
  mapPaginatedResponse,
  parseApiResponse,
} from "@/lib/api-client";
import type { GetAllServiceFn } from "@/types/get-all-service.type";
import { BaseQueryParamsSchema } from "@/types/get-all-service.type";

export const EmailFilterSchema = z.object({
  email: z.string().optional(),
});

export type EmailFilter = z.infer<typeof EmailFilterSchema>;

export const GetEmailsParamsSchema =
  BaseQueryParamsSchema.merge(EmailFilterSchema);

export type GetEmailsParams = z.infer<typeof GetEmailsParamsSchema>;

export interface Email {
  id: string;
  email: string;
  password?: string;
  email_account_id?: string;
  provider?: string;
  status?: string;
  last_error?: string;
}

export interface CreateEmailPayload {
  email: string;
  password?: string;
}

export interface UpdateEmailPayload {
  email?: string;
  password?: string;
}

export const getAllEmail: GetAllServiceFn<Email, EmailFilter> = async (
  params,
) => {
  const response = await apiFetch("/email", params);
  if (!response.ok) {
    const errorData = await parseApiResponse(response);
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to fetch email");
  }

  const data = await response.json();
  return mapPaginatedResponse(data);
};

export const getEmailById = async (
  emailId: string,
  signal?: AbortSignal,
): Promise<Email> => {
  const response = await apiFetch(`/email/${emailId}`, { signal });
  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to fetch email");
  }

  return response.json();
};

export const createNewEmail = async (
  payload: CreateEmailPayload,
): Promise<Email> => {
  const response = await apiFetch("/email", undefined, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to create email");
  }

  return response.json();
};

export const updateEmail = async (
  emailId: string,
  payload: UpdateEmailPayload,
): Promise<Email> => {
  const response = await apiFetch(`/email/${emailId}`, undefined, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to update email");
  }

  return response.json();
};

export const deleteEmail = async (emailId: string): Promise<void> => {
  const response = await apiFetch(`/email/${emailId}`, undefined, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to delete email");
  }
};

export interface ConnectIMAPPayload {
  email_account_id: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  security: "ssl" | "starttls" | "none";
}

export const connectIMAP = async (
  payload: ConnectIMAPPayload,
): Promise<void> => {
  const response = await apiFetch("/email/connect-imap", undefined, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to connect IMAP");
  }
};

export const disconnectEmail = async (emailId: string): Promise<void> => {
  const response = await apiFetch(`/email-connections/${emailId}`, undefined, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to disconnect email connection");
  }
};

export interface InitializeConnectionResponse {
  email_account_id: string;
}

export const initializeConnection = async (
  emailId: string,
): Promise<InitializeConnectionResponse> => {
  const response = await apiFetch("/email-connections/initialize", undefined, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email_id: emailId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to initialize connection");
  }

  return response.json();
};

export interface ConnectResendPayload {
  email_account_id: string;
  api_key: string;
  webhook_secret: string;
}

export const connectResend = async (
  payload: ConnectResendPayload,
): Promise<void> => {
  const response = await apiFetch("/email/connect-resend", undefined, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Gagal menghubungkan Resend");
  }
};

export interface ConnectCloudflarePayload {
  email_account_id: string;
  token: string;
}

export const connectCloudflare = async (
  payload: ConnectCloudflarePayload,
): Promise<void> => {
  const response = await apiFetch("/email/connect-cloudflare", undefined, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Gagal menghubungkan Cloudflare");
  }
};

export const emailService = {
  getAllEmail,
  getEmailById,
  createNewEmail,
  updateEmail,
  deleteEmail,
  connectIMAP,
  disconnectEmail,
  initializeConnection,
  connectResend,
  connectCloudflare,
};
