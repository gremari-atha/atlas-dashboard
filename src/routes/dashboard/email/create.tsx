import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import type { EmailFormSubmitData } from "@/components/forms/email.form";
import { EmailForm } from "@/components/forms/email.form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CreateEmailPayload } from "@/services/email.service";
import { createNewEmail } from "@/services/email.service";

export const Route = createFileRoute("/dashboard/email/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateEmailPayload) => createNewEmail(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email"] });
      navigate({ to: "/dashboard/email" });
      toast.success("Email baru berhasil dibuat.");
    },
    onError: (error) => {
      toast.error(`Terjadi kesalahan: ${error.message}`);
    },
  });

  const handleSubmit = (values: EmailFormSubmitData) => {
    mutation.mutate(values);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" asChild className="shrink-0">
          <Link to="/dashboard/email">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Buat Email
          </h1>
          <p className="text-xs text-muted-foreground">
            Tambahkan data email baru ke sistem.
          </p>
        </div>
      </div>

      <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Formulir Email Baru
          </CardTitle>
          <CardDescription className="text-xs">
            Isi alamat email dan password jika dibutuhkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailForm
            onSubmit={handleSubmit}
            isPending={mutation.isPending}
            submitButtonText="Buat Email"
          />
        </CardContent>
      </Card>
    </div>
  );
}
