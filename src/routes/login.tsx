import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { AtlasLogo } from "@/components/custom/atlas-logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context-providers/auth.provider";
import { useAppForm } from "@/hooks/form.hook";

const LoginFormSchema = z.object({
  tenant_id: z.string().min(1, "App ID wajib diisi"),
  secret: z.string().min(1, "Secret wajib diisi"),
});

export const Route = createFileRoute("/login")({
  beforeLoad: ({ context }) => {
    const isAuthed =
      context.auth?.isAuthenticated ||
      (typeof window !== "undefined" && !!localStorage.getItem("auth.tenant"));
    if (isAuthed) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const auth = useAuth();
  const navigate = Route.useNavigate();

  const form = useAppForm({
    validators: {
      onSubmit: LoginFormSchema,
    },
    defaultValues: {
      tenant_id: "",
      secret: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await auth.login(value.tenant_id, value.secret);
        await navigate({ to: "/" });
      } catch (error) {
        toast.error((error as Error).message);
      }
    },
  });

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-radial from-background via-muted/30 to-background overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col gap-6">
          <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-2xl">
            <CardHeader className="space-y-4">
              <div className="flex justify-center items-center">
                <div className="p-3 bg-secondary/80 rounded-2xl border border-border/40 shadow-inner">
                  <AtlasLogo className="h-10 w-auto" />
                </div>
              </div>
              <div className="text-center space-y-1.5">
                <CardTitle className="text-xl font-bold tracking-tight">
                  Login ke Dashboard
                </CardTitle>
                <CardDescription className="text-xs">
                  Gunakan App ID dan secret Anda untuk masuk
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form.AppForm>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                  }}
                >
                  <div className="flex flex-col gap-5">
                    <form.AppField name="tenant_id">
                      {(field) => (
                        <field.TextField
                          label="App ID"
                          placeholder="Masukkan App ID..."
                        />
                      )}
                    </form.AppField>
                    <form.AppField name="secret">
                      {(field) => (
                        <field.TextField
                          label="Secret"
                          type="password"
                          placeholder="••••••••••••"
                        />
                      )}
                    </form.AppField>
                    <form.SubscribeButton label="Masuk ke Dashboard" />
                  </div>
                </form>
              </form.AppForm>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
