import { z } from "zod";
import {
  apiFetch,
  mapPaginatedResponse,
  parseApiResponse,
} from "@/lib/api-client";
import type { GetAllServiceFn } from "@/types/get-all-service.type";
import { BaseQueryParamsSchema } from "@/types/get-all-service.type";

export const EmailSubjectFilterSchema = z.object({
  subject: z.string().optional(),
  context: z.string().optional(),
});

export type EmailSubjectFilter = z.infer<typeof EmailSubjectFilterSchema>;

export const GetEmailSubjectsParamsSchema = BaseQueryParamsSchema.merge(
  EmailSubjectFilterSchema,
);

export type GetEmailSubjectsParams = z.infer<
  typeof GetEmailSubjectsParamsSchema
>;

export interface EmailSubject {
  id: string;
  subject: string;
  context: string;
  extract_method: string;
}

export interface CreateEmailSubjectPayload {
  subject: string;
  context: string;
  extract_method: string;
}

export interface UpdateEmailSubjectPayload {
  subject?: string;
  context?: string;
  extract_method?: string;
}

export const getAllEmailSubject: GetAllServiceFn<
  EmailSubject,
  EmailSubjectFilter
> = async (params) => {
  const response = await apiFetch("/email-subject", params);
  if (!response.ok) {
    const errorData = await parseApiResponse(response);
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to fetch email subjects");
  }

  const data = await response.json();
  return mapPaginatedResponse(data);
};

export const getEmailSubjectById = async (
  id: string,
  signal?: AbortSignal,
): Promise<EmailSubject> => {
  const response = await apiFetch(`/email-subject/${id}`, { signal });
  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to fetch email subject");
  }

  return response.json();
};

export const createEmailSubject = async (
  payload: CreateEmailSubjectPayload,
): Promise<EmailSubject> => {
  const response = await apiFetch("/email-subject", undefined, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to create email subject");
  }

  return response.json();
};

export const updateEmailSubject = async (
  id: string,
  payload: UpdateEmailSubjectPayload,
): Promise<EmailSubject> => {
  const response = await apiFetch(`/email-subject/${id}`, undefined, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to update email subject");
  }

  return response.json();
};

export const deleteEmailSubject = async (id: string): Promise<void> => {
  const response = await apiFetch(`/email-subject/${id}`, undefined, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to delete email subject");
  }
};

export const emailSubjectService = {
  getAllEmailSubject,
  getEmailSubjectById,
  createEmailSubject,
  updateEmailSubject,
  deleteEmailSubject,
};
