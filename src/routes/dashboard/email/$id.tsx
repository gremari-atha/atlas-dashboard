import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { UpdateEmailPayload } from "@/services/email.service";
import { getEmailById, updateEmail } from "@/services/email.service";

export const Route = createFileRoute("/dashboard/email/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();

  const { data: email, isLoading: isFetchEmailLoading } = useQuery({
    queryKey: ["email", id],
    queryFn: ({ signal }) => getEmailById(id, signal),
  });

  const mutation = useMutation({
    mutationFn: (payload: UpdateEmailPayload) => updateEmail(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email"] });
      toast.success("Email berhasil diperbarui.");
    },
    onError: (error) => {
      toast.error(`Terjadi kesalahan: ${error.message}`);
    },
  });

  const handleSubmit = (values: EmailFormSubmitData) => {
    mutation.mutate(values);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" asChild className="shrink-0">
          <Link to="/dashboard/email">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Ubah Email
          </h1>
          <p className="text-xs text-muted-foreground">
            Perbarui data email yang sudah terdaftar.
          </p>
        </div>
      </div>

      <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Formulir Edit Email
          </CardTitle>
          <CardDescription className="text-xs">
            Ubah password atau alamat email jika dibutuhkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFetchEmailLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <EmailForm
              onSubmit={handleSubmit}
              isPending={mutation.isPending}
              initialData={email}
              submitButtonText="Ubah Email"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
