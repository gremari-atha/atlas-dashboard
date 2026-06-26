import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import type { EmailSubjectFormSubmitData } from "@/components/forms/email-subject.form";
import { EmailSubjectForm } from "@/components/forms/email-subject.form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CreateEmailSubjectPayload } from "@/services/email-subject.service";
import { createEmailSubject } from "@/services/email-subject.service";

export const Route = createFileRoute("/dashboard/email-subject/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateEmailSubjectPayload) =>
      createEmailSubject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-subject"] });
      navigate({ to: "/dashboard/email-subject" });
      toast.success("Email Subject baru berhasil dibuat.");
    },
    onError: (error) => {
      toast.error(`Terjadi kesalahan: ${error.message}`);
    },
  });

  const handleSubmit = (values: EmailSubjectFormSubmitData) => {
    mutation.mutate(values);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" asChild className="shrink-0">
          <Link to="/dashboard/email-subject">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Buat Email Subject
          </h1>
          <p className="text-xs text-muted-foreground">
            Tambah template subjek email baru untuk parser OTP otomatis.
          </p>
        </div>
      </div>

      <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Formulir Email Subject
          </CardTitle>
          <CardDescription className="text-xs">
            Isi data subjek, context platform (Netflix dll), dan metode
            ekstraksi OTP.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailSubjectForm
            onSubmit={handleSubmit}
            isPending={mutation.isPending}
            submitButtonText="Buat Email Subject"
          />
        </CardContent>
      </Card>
    </div>
  );
}
