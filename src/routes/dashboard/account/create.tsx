import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import type { AccountFormSubmitData } from "@/components/forms/account-create.form";
import { AccountCreateForm } from "@/components/forms/account-create.form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { convertMetadataObjectToString } from "@/lib/metadata-converter";
import type { CreateAccountPayload } from "@/services/account.service";
import { createNewAccount } from "@/services/account.service";

export const Route = createFileRoute("/dashboard/account/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateAccountPayload) => createNewAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      navigate({ to: "/dashboard/account" });
      toast.success("Akun baru berhasil dibuat.");
    },
    onError: (error) => {
      toast.error(`Terjadi kesalahan: ${error.message}`);
    },
  });

  const handleSubmit = (values: AccountFormSubmitData) => {
    const payload: CreateAccountPayload = {
      ...values,
      email_id: values.email_id,
      product_variant_id: values.product_variant_id,
      subscription_expiry: values.subscription_expiry || new Date(),
      profile: values.profile.map((p) => ({
        ...p,
        max_user: Number.parseInt(p.max_user, 10),
        metadata: p.metadata.length
          ? convertMetadataObjectToString(p.metadata)
          : undefined,
      })),
      modifier: values.modifier.length
        ? values.modifier.map((m) => ({
            modifier_id: m.modifier_id,
            metadata: m.metadata?.length
              ? convertMetadataObjectToString(m.metadata)
              : undefined,
          }))
        : undefined,
    };
    mutation.mutate(payload);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" asChild className="shrink-0">
          <Link to="/dashboard/account">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Buat Akun
          </h1>
          <p className="text-xs text-muted-foreground">
            Tambahkan data akun Netflix / layanan lainnya.
          </p>
        </div>
      </div>

      <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Formulir Akun Baru
          </CardTitle>
          <CardDescription className="text-xs">
            Lengkapi email, password, profile, dan modifikasi jika dibutuhkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccountCreateForm
            onSubmit={handleSubmit}
            isPending={mutation.isPending}
            submitButtonText="Buat Akun"
          />
        </CardContent>
      </Card>
    </div>
  );
}
