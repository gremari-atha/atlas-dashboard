import React from "react";
import { API_URL } from "@/constants/api-url.cont";
import type { IAuthContext, ITenant } from "./auth-context.type";

const AuthContext = React.createContext<IAuthContext | null>(null);

const localStorageKey = "auth.tenant";

function getStoredTenant() {
  if (typeof window === "undefined") return null;
  const tenant = localStorage.getItem(localStorageKey);
  if (!tenant) return null;
  try {
    return JSON.parse(tenant);
  } catch {
    return null;
  }
}

function setStoredTenant(tenant: ITenant | null) {
  if (typeof window === "undefined") return;
  if (tenant) {
    localStorage.setItem(localStorageKey, JSON.stringify(tenant));
  } else {
    localStorage.removeItem(localStorageKey);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = React.useState<ITenant | null>(() =>
    getStoredTenant(),
  );
  const isAuthenticated = !!tenant;

  const logout = React.useCallback(() => {
    setStoredTenant(null);
    setTenant(null);
  }, []);

  const login = React.useCallback(async (tenantId: string, secret: string) => {
    const response = await fetch(`${API_URL}/tenant/access-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tenant_id: tenantId, secret }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Something went wrong");
    }

    const tenantData = await response.json();
    const tenantStore: ITenant = {
      id: tenantData.id,
      accessToken: tenantData.token,
    };
    setStoredTenant(tenantStore);
    setTenant(tenantStore);
  }, []);

  return (
    <AuthContext value={{ isAuthenticated, tenant, login, logout }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = React.use(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
