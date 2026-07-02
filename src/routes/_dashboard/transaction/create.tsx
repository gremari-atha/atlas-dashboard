import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import type { TransactionFormSubmitData } from "@/components/forms/transaction-create.form";
import { TransactionCreateForm } from "@/components/forms/transaction-create.form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CreateTransactionPayload } from "@/services/transaction.service";
import { createNewTransaction } from "@/services/transaction.service";

export const Route = createFileRoute("/_dashboard/transaction/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateTransactionPayload) =>
      createNewTransaction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaction"] });
      // Invalidate accounts since transaction will generate account users
      queryClient.invalidateQueries({ queryKey: ["account"] });
      navigate({ to: "/transaction" });
      toast.success("Transaksi baru berhasil dibuat.");
    },
    onError: (error) => {
      toast.error(`Terjadi kesalahan: ${error.message}`);
    },
  });

  const handleSubmit = (values: TransactionFormSubmitData) => {
    const payload: CreateTransactionPayload = {
      customer: values.customer,
      platform: values.platform,
      items: values.items.map((item) => ({
        product_variant_id: item.product_variant_id,
        price: item.price ? Number.parseInt(item.price, 10) : undefined,
      })),
    };
    mutation.mutate(payload);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" asChild className="shrink-0">
          <Link to="/transaction">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Transaksi Baru
          </h1>
          <p className="text-xs text-muted-foreground">
            Catat transaksi penyewaan akun baru untuk customer.
          </p>
        </div>
      </div>

      <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Formulir Transaksi
          </CardTitle>
          <CardDescription className="text-xs">
            Isi data customer, platform penjualan, dan produk yang disewa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionCreateForm
            onSubmit={handleSubmit}
            isPending={mutation.isPending}
            submitButtonText="Buat Transaksi"
          />
        </CardContent>
      </Card>
    </div>
  );
}
