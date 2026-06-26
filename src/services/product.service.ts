import { z } from "zod";
import {
  apiFetch,
  mapPaginatedResponse,
  parseApiResponse,
} from "@/lib/api-client";
import { largestWholeUnit } from "@/lib/time-converter";
import type { GetAllServiceFn } from "@/types/get-all-service.type";
import { BaseQueryParamsSchema } from "@/types/get-all-service.type";

export const ProductFilterSchema = z.object({
  name: z.string().optional(),
});

export const ProductVariantFilterSchema = z.object({
  name: z.string().optional(),
  product: z.string().optional(),
});

export type ProductFilter = z.infer<typeof ProductFilterSchema>;
export type ProductVariantFilter = z.infer<typeof ProductVariantFilterSchema>;

export const GetProductsParamsSchema =
  BaseQueryParamsSchema.merge(ProductFilterSchema);

export const GetProductVariantsParamsSchema = BaseQueryParamsSchema.merge(
  ProductVariantFilterSchema,
);
export type GetProductVariantsParams = z.infer<
  typeof GetProductVariantsParamsSchema
>;

export interface ProductVariant {
  id: string;
  name: string;
  duration: number;
  duration_unit: string;
  interval: number;
  interval_unit: string;
  cooldown: number;
  cooldown_unit: string;
  base_price: string;
  copy_template?: string;
  product_id: string;
  product?: {
    id: string;
    name: string;
  };
}

export interface Product {
  id: string;
  name: string;
  variants: Array<ProductVariant>;
}

export interface CreateProductVariantPayload {
  product_id?: string;
  name: string;
  duration: number;
  interval: number;
  cooldown: number;
  base_price: string;
  copy_template?: string;
}

export interface CreateProductPayload {
  name: string;
  variants: Array<CreateProductVariantPayload>;
}

export interface UpdateProductVariantPayload {
  name?: string;
  duration?: number;
  interval?: number;
  cooldown?: number;
  base_price?: string;
  copy_template?: string;
}

export interface UpdateProductPayload {
  name: string;
}

export const getAllProduct: GetAllServiceFn<Product, ProductFilter> = async (
  params,
) => {
  const response = await apiFetch("/product", params);
  if (!response.ok) {
    const errorData = await parseApiResponse(response);
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to fetch product");
  }

  const data = await response.json();
  const products = data.data?.length
    ? (data.data as Array<any>).map((p) => ({
        id: p.id,
        name: p.name,
        variants: p.variants.map((v: any) => {
          const [duration, duration_unit] = largestWholeUnit(v.duration);
          const [interval, interval_unit] = largestWholeUnit(v.interval);
          const [cooldown, cooldown_unit] = largestWholeUnit(v.cooldown);

          return {
            ...v,
            duration,
            duration_unit,
            interval,
            interval_unit,
            cooldown,
            cooldown_unit,
          };
        }),
      }))
    : [];

  return mapPaginatedResponse({
    ...data,
    data: products,
  });
};

export const getAllProductVariant: GetAllServiceFn<
  ProductVariant,
  ProductVariantFilter
> = async (params) => {
  const response = await apiFetch("/product-variant", params);
  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to fetch product variant");
  }
  const data = await response.json();
  return mapPaginatedResponse(data);
};

export const getProductById = async (
  productId: string,
  signal?: AbortSignal,
): Promise<Product> => {
  const response = await apiFetch(`/product/${productId}`, { signal });
  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to fetch product");
  }

  const product: Product = await response.json();
  return {
    ...product,
    variants: product.variants.map((v) => {
      const [duration, duration_unit] = largestWholeUnit(v.duration);
      const [interval, interval_unit] = largestWholeUnit(v.interval);
      const [cooldown, cooldown_unit] = largestWholeUnit(v.cooldown);

      return {
        ...v,
        duration,
        duration_unit,
        interval,
        interval_unit,
        cooldown,
        cooldown_unit,
      };
    }),
  };
};

export const createNewProduct = async (
  payload: CreateProductPayload,
): Promise<Product> => {
  const response = await apiFetch("/product/with-variant", undefined, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to create product");
  }

  return response.json();
};

export const createNewProductVariant = async (
  payload: CreateProductVariantPayload,
): Promise<ProductVariant> => {
  const response = await apiFetch("/product-variant", undefined, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to create product variant");
  }

  return response.json();
};

export const updateProduct = async (
  productId: string,
  payload: UpdateProductPayload,
): Promise<Product> => {
  const response = await apiFetch(`/product/${productId}`, undefined, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to update product");
  }

  return response.json();
};

export const updateProductVariant = async (
  productVariantId: string,
  payload: UpdateProductVariantPayload,
): Promise<ProductVariant> => {
  const response = await apiFetch(
    `/product-variant/${productVariantId}`,
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
    throw new Error(errorMessage || "Failed to update product variant");
  }

  return response.json();
};

export const deleteProduct = async (productId: string): Promise<void> => {
  const response = await apiFetch(`/product/${productId}`, undefined, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(errorMessage || "Failed to delete product");
  }
};

export const deleteProductVariant = async (
  productVariantId: string,
): Promise<void> => {
  const response = await apiFetch(
    `/product-variant/${productVariantId}`,
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
    throw new Error(errorMessage || "Failed to delete product variant");
  }
};

export const productService = {
  getAllProduct,
  getAllProductVariant,
  getProductById,
  createNewProduct,
  createNewProductVariant,
  updateProduct,
  updateProductVariant,
  deleteProduct,
  deleteProductVariant,
};
