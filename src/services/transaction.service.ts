import { toast } from "sonner";
import { z } from "zod";
import {
  apiFetch,
  mapPaginatedResponse,
  parseApiResponse,
} from "@/lib/api-client";
import { convertStringToMetadataObject } from "@/lib/metadata-converter";
import type { GetAllServiceFn } from "@/types/get-all-service.type";
import { BaseQueryParamsSchema } from "@/types/get-all-service.type";
import type { Account, AccountProfile } from "./account.service";

export const TransactionFilterSchema = z.object({
  customer: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
});

export type TransactionFilter = z.infer<typeof TransactionFilterSchema>;

export const GetTransactionParamsSchema = BaseQueryParamsSchema.merge(
  TransactionFilterSchema,
);

export type GetTransactionParams = z.infer<typeof GetTransactionParamsSchema>;

interface TransactionItemUser {
  id: string;
  name: string;
  status?: string;
  account_id: string;
  account_profile_id: string;
  account: Account;
  profile: AccountProfile;
}

interface TransactionItem {
  id: string;
  name: string;
  transaction_id: string;
  account_user_id?: number;
  user?: TransactionItemUser;
}

export interface Transaction {
  id: string;
  customer: string;
  platform: string;
  total_price: number;
  items: Array<TransactionItem>;
  created_at: Date;
}

interface CreateTransactionUserFailed {
  availability_status: "NOT_AVAILABLE" | "COOLDOWN";
  product_variant_id: string;
  produc_name: string;
}

export interface CreateTransactionResponse {
  transaction?: Transaction;
  account_user: Array<TransactionItemUser | CreateTransactionUserFailed>;
}

interface CreateTransactionItemPayload {
  product_variant_id: string;
  price?: number;
}

export interface CreateTransactionPayload {
  customer: string;
  platform: string;
  items: Array<CreateTransactionItemPayload>;
}

export const getAllTransaction: GetAllServiceFn<
  Transaction,
  TransactionFilter
> = async (params) => {
  const response = await apiFetch("/transaction", params);
  if (!response.ok) {
    const errorData = await parseApiResponse(response);
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to fetch transaction");
  }

  const data = await response.json();
  const transactions = data.data?.length
    ? (data.data as Array<any>).map((transaction) => ({
        ...transaction,
        created_at: new Date(transaction.created_at),
        items: transaction.items.map((item: any) => ({
          ...item,
          user: item.user
            ? ({
                ...item.user,
                profile: {
                  ...item.user.profile,
                  metadata: convertStringToMetadataObject(
                    item.user.profile.metadata as any,
                  ),
                },
              } as TransactionItemUser)
            : undefined,
        })),
      }))
    : [];

  return mapPaginatedResponse({
    ...data,
    data: transactions,
  });
};

export const createNewTransaction = async (
  payload: CreateTransactionPayload,
): Promise<CreateTransactionResponse> => {
  const response = await apiFetch("/transaction", undefined, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to create transaction");
  }

  const data: CreateTransactionResponse = await response.json();
  if (data.account_user.length) {
    const warnMessages: Array<string> = [];
    for (const usr of data.account_user as Array<CreateTransactionUserFailed>) {
      if (usr.availability_status === "COOLDOWN") {
        warnMessages.push(`${usr.produc_name}: akun cooldown`);
      }
      if (usr.availability_status === "NOT_AVAILABLE") {
        warnMessages.push(`${usr.produc_name}: akun penuh`);
      }
    }
    if (warnMessages.length) {
      toast.warning(`Gagal generate akun pada:\n${warnMessages.join("\n")}`);
    }
  }
  return data;
};

export const deleteTransaction = async (
  transactionId: string,
): Promise<void> => {
  const response = await apiFetch(`/transaction/${transactionId}`, undefined, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to delete transaction");
  }
};

export const transactionService = {
  getAllTransaction,
  createNewTransaction,
  deleteTransaction,
};
