import { API_URL } from "@/constants/api-url.cont";

export interface BaseQueryParams {
  page?: number;
  limit?: number;
  order_by?: string;
  order_direction?: "asc" | "desc";
  [key: string]: any;
}

const localStorageKey = "auth.tenant";

export interface StoredTenant {
  id: string;
  accessToken: string;
}

export function getStoredTenant(): StoredTenant | null {
  if (typeof window === "undefined") return null;
  const tenant = localStorage.getItem(localStorageKey);
  if (!tenant) return null;
  try {
    return JSON.parse(tenant);
  } catch {
    return null;
  }
}

export function generateApiUrl(
  endpointUrl: string,
  params?: Record<string, any>,
): string {
  const url = new URL(`${API_URL}${endpointUrl}`);
  const searchParams = new URLSearchParams();

  if (params) {
    for (const key of Object.keys(params)) {
      const value = params[key];

      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item !== null && item !== undefined && String(item) !== "") {
            searchParams.append(key, String(item));
          }
        });
      } else if (
        value !== null &&
        value !== undefined &&
        String(value) !== ""
      ) {
        searchParams.append(key, String(value));
      }
    }
  }

  url.search = searchParams.toString();
  return url.toString();
}

export async function apiFetch(
  endpoint: string,
  params?: Record<string, any> & { signal?: AbortSignal },
  fetchInit?: RequestInit,
): Promise<Response> {
  const { signal, ...restParams } = params || {};
  const url = generateApiUrl(
    endpoint,
    Object.keys(restParams).length > 0 ? restParams : undefined,
  );

  const tenant = getStoredTenant();
  const headers: Record<string, string> = {
    ...(fetchInit?.headers as Record<string, string>),
  };

  if (tenant) {
    headers.authorization = `VC ${tenant.accessToken}`;
    headers["x-tenant-id"] = tenant.id;
  }

  const response = await fetch(url, {
    ...fetchInit,
    headers,
    signal: signal || fetchInit?.signal,
  });

  return response;
}

export async function parseApiResponse(response: Response) {
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return { message: response.statusText };
    }
  }
  return { message: (await response.text()) || response.statusText };
}

export interface GoPaginatedResponse<T> {
  data: Array<T>;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function mapPaginatedResponse<T>(res: GoPaginatedResponse<T>) {
  return {
    items: res.data || [],
    paginationData: {
      currentPage: res.meta?.page || 1,
      totalPage: res.meta?.totalPages || 1,
      limit: res.meta?.limit || 10,
      totalItems: res.meta?.total || 0,
    },
    orderData: {},
  };
}
