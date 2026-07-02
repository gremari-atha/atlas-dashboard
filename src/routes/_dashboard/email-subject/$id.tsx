import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { UpdateEmailSubjectPayload } from "@/services/email-subject.service";
import {
  getEmailSubjectById,
  updateEmailSubject,
} from "@/services/email-subject.service";

export const Route = createFileRoute("/_dashboard/email-subject/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();

  const { data: emailSubject, isLoading: isFetchEmailSubjectLoading } =
    useQuery({
      queryKey: ["email-subject", id],
      queryFn: ({ signal }) => getEmailSubjectById(id, signal),
    });

  const mutation = useMutation({
    mutationFn: (payload: UpdateEmailSubjectPayload) =>
      updateEmailSubject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-subject"] });
      toast.success("Email Subject berhasil diperbarui.");
      navigate({ to: "/email-subject" });
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
          <Link to="/email-subject">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Ubah Email Subject
          </h1>
          <p className="text-xs text-muted-foreground">
            Sesuaikan detail template subjek email dan kriteria ekstraksinya.
          </p>
        </div>
      </div>

      <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Formulir Email Subject
          </CardTitle>
          <CardDescription className="text-xs">
            Ubah parameter ekstraksi OTP dan context pengirim.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFetchEmailSubjectLoading ? (
            <div className="flex flex-col gap-5">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <EmailSubjectForm
              onSubmit={handleSubmit}
              isPending={mutation.isPending}
              initialData={emailSubject}
              submitButtonText="Ubah Email Subject"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
