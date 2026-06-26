import { QueryClientProvider as QCP, QueryClient } from "@tanstack/react-query";
import type React from "react";

export const queryClient = new QueryClient();

export function QueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QCP client={queryClient}>{children}</QCP>;
}
