import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import type { ExpenseFormSubmitData } from "@/components/forms/expense.form";
import { ExpenseForm } from "@/components/forms/expense.form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CreateExpensePayload } from "@/services/expense.service";
import { createExpense } from "@/services/expense.service";

export const Route = createFileRoute("/_dashboard/expense/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateExpensePayload) => createExpense(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense"] });
      // Invalidate dashboard statistics too since expenses affect income/overview
      queryClient.invalidateQueries({ queryKey: ["statistic"] });
      navigate({ to: "/expense" });
      toast.success("Pengeluaran global baru berhasil dicatat.");
    },
    onError: (error) => {
      toast.error(`Terjadi kesalahan: ${error.message}`);
    },
  });

  const handleSubmit = (values: ExpenseFormSubmitData) => {
    const payload: CreateExpensePayload = {
      amount: Number.parseInt(values.amount, 10),
      note: values.note || undefined,
      type: "global",
    };
    mutation.mutate(payload);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" asChild className="shrink-0">
          <Link to="/expense">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Catat Pengeluaran Global
          </h1>
          <p className="text-xs text-muted-foreground">
            Catat pengeluaran umum operasional seperti sewa server, biaya API,
            dll.
          </p>
        </div>
      </div>

      <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Formulir Pengeluaran
          </CardTitle>
          <CardDescription className="text-xs">
            Isi nominal dan berikan catatan/keterangan pengeluaran.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseForm
            onSubmit={handleSubmit}
            isPending={mutation.isPending}
            submitButtonText="Catat Pengeluaran"
          />
        </CardContent>
      </Card>
    </div>
  );
}
