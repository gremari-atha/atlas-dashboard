import { z } from "zod";
import {
  apiFetch,
  mapPaginatedResponse,
  parseApiResponse,
} from "@/lib/api-client";
import type { GetAllServiceFn } from "@/types/get-all-service.type";
import { BaseQueryParamsSchema } from "@/types/get-all-service.type";

export const ExpenseFilterSchema = z.object({
  subject_id: z.string().optional(),
  type: z.string().optional(),
});

export type ExpenseFilter = z.infer<typeof ExpenseFilterSchema>;

export const GetExpensesParamsSchema =
  BaseQueryParamsSchema.merge(ExpenseFilterSchema);

export type GetExpenseParams = z.infer<typeof GetExpensesParamsSchema>;

export interface Expense {
  id: string;
  amount: string;
  note?: string;
  subject_id?: string;
  type: string;
  created_at: Date;
}

export interface CreateExpensePayload {
  amount: number;
  note?: string;
  subject_id?: string;
  type: string;
}

export const getAllExpense: GetAllServiceFn<Expense, ExpenseFilter> = async (
  params,
) => {
  const response = await apiFetch("/expense", params);
  if (!response.ok) {
    const errorData = await parseApiResponse(response);
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to fetch expenses");
  }

  const data = await response.json();
  const expenses = data.data?.length
    ? data.data.map((item: any) => ({
        ...item,
        created_at: new Date(item.created_at),
      }))
    : [];
  return mapPaginatedResponse({
    ...data,
    data: expenses,
  });
};

export const createExpense = async (
  payload: CreateExpensePayload,
): Promise<Expense> => {
  const response = await apiFetch("/expense", undefined, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to create expense");
  }

  return response.json();
};

export const deleteExpense = async (id: string): Promise<void> => {
  const response = await apiFetch(`/expense/${id}`, undefined, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to delete expense");
  }
};

export const expenseService = {
  getAllExpense,
  createExpense,
  deleteExpense,
};
