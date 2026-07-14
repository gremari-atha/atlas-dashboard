import { z } from "zod";
import {
  apiFetch,
  mapPaginatedResponse,
  parseApiResponse,
} from "@/lib/api-client";
import type { GetAllServiceFn } from "@/types/get-all-service.type";
import { BaseQueryParamsSchema } from "@/types/get-all-service.type";

export const EmailMessageFilterSchema = z.object({
  from_email: z.string().optional(),
});

export type EmailMessageFilter = z.infer<typeof EmailMessageFilterSchema>;

export const GetEmailMessageParamsSchema = BaseQueryParamsSchema.merge(
  EmailMessageFilterSchema,
);

export type GetEmailMessageParams = z.infer<typeof GetEmailMessageParamsSchema>;

export interface EmailMessage {
  id: string;
  tenant_id: string;
  from_email: string;
  subject: string;
  email_date: Date;
  parsed_data: string;
  created_at: Date;
  updated_at: Date;
}

export const getEmailMessages: GetAllServiceFn<
  EmailMessage,
  EmailMessageFilter
> = async (params) => {
  const response = await apiFetch("/email-message", params);
  if (!response.ok) {
    const errorData = await parseApiResponse(response);
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to fetch email messages");
  }

  const data = await response.json();
  const emailMessages = data.data?.length
    ? (data.data as Array<any>).map((emailMessage) => ({
        ...emailMessage,
        email_date: new Date(emailMessage.email_date),
        created_at: new Date(emailMessage.created_at),
        updated_at: new Date(emailMessage.updated_at),
      }))
    : [];

  return mapPaginatedResponse({
    ...data,
    data: emailMessages,
  });
};

export const emailMessageService = {
  getEmailMessages,
};
