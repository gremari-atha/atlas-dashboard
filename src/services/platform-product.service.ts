import { z } from "zod";
import {
  apiFetch,
  mapPaginatedResponse,
  parseApiResponse,
} from "@/lib/api-client";
import type { GetAllServiceFn } from "@/types/get-all-service.type";
import { BaseQueryParamsSchema } from "@/types/get-all-service.type";
import type { ProductVariant } from "./product.service";

export const PlatformProductFilterSchema = z.object({
  name: z.string().optional(),
  platform: z.string().optional(),
  variant: z.string().optional(),
  platform_product_id: z.string().optional(),
  product_variant_id: z.string().optional(),
});

export type PlatformProductFilter = z.infer<typeof PlatformProductFilterSchema>;

export const GetPlatformProductParamsSchema = BaseQueryParamsSchema.merge(
  PlatformProductFilterSchema,
);

export interface PlatformProduct {
  id: string;
  name: string;
  platform: string;
  variant?: string | null;
  platform_product_id?: string;
  product_variant_id: string;
  product_variant: ProductVariant;
}

export interface CreatePlatformProductPayload {
  name: string;
  platform: string;
  variant?: string | null;
  platform_product_id?: string;
  product_variant_id: string;
}

export interface UpdatePlatformProductPayload {
  name?: string;
  platform?: string;
  variant?: string | null;
  platform_product_id?: string;
  product_variant_id?: string;
}

export const getAllPlatformProduct: GetAllServiceFn<
  PlatformProduct,
  PlatformProductFilter
> = async (params) => {
  const response = await apiFetch("/platform-product", params);
  if (!response.ok) {
    const errorData = await parseApiResponse(response);
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to fetch Platform Product");
  }

  const data = await response.json();
  return mapPaginatedResponse(data);
};

export const getPlatformProductById = async (
  platformProductId: string,
  signal?: AbortSignal,
) => {
  const response = await apiFetch(`/platform-product/${platformProductId}`, {
    signal,
  });
  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to fetch platform product");
  }

  return response.json();
};

export const createPlatformProduct = async (
  payload: CreatePlatformProductPayload,
) => {
  const response = await apiFetch("/platform-product", undefined, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to create platform product");
  }

  return response.json();
};

export const updatePlatformProduct = async (
  platformProductId: string,
  payload: UpdatePlatformProductPayload,
) => {
  const response = await apiFetch(
    `/platform-product/${platformProductId}`,
    undefined,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to update platform product");
  }

  return response.json();
};

export const deletePlatformProduct = async (platformProductId: string) => {
  const response = await apiFetch(
    `/platform-product/${platformProductId}`,
    undefined,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to delete email");
  }
};

export const platformProductService = {
  getAllPlatformProduct,
  getPlatformProductById,
  createPlatformProduct,
  updatePlatformProduct,
  deletePlatformProduct,
};
