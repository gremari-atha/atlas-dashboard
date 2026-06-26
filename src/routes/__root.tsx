import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { AlertCircle, Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobalAlertDialogProvider } from "@/context-providers/alert-dialog.provider";
import type { IAuthContext } from "@/context-providers/auth-context.type";
import "../styles.css";

interface MyRouterContext {
  queryClient: QueryClient;
  auth?: IAuthContext;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <TooltipProvider>
      <GlobalAlertDialogProvider>
        <Outlet />
      </GlobalAlertDialogProvider>
      <Toaster richColors position="top-center" />
    </TooltipProvider>
  ),
  errorComponent: ({ error }) => (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-center p-6 bg-background">
      <AlertCircle className="size-12 text-destructive animate-bounce" />
      <h2 className="text-xl font-bold tracking-tight">Terjadi Kesalahan</h2>
      <p className="text-sm text-muted-foreground max-w-md">{error.message}</p>
    </div>
  ),
  pendingComponent: () => (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">
          Memuat halaman...
        </p>
      </div>
    </div>
  ),
});
