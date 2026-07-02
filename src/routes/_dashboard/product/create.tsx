import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import type { ProductFormSubmitData } from "@/components/forms/product.form";
import { ProductForm } from "@/components/forms/product.form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CreateProductPayload } from "@/services/product.service";
import { createNewProduct } from "@/services/product.service";

export const Route = createFileRoute("/_dashboard/product/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateProductPayload) => createNewProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
      navigate({ to: "/product" });
      toast.success("Produk baru berhasil dibuat.");
    },
    onError: (error) => {
      toast.error(`Terjadi kesalahan: ${error.message}`);
    },
  });

  const handleSubmit = (values: ProductFormSubmitData) => {
    const payload: CreateProductPayload = {
      name: values.name,
      variants: values.variants.map((v) => ({
        name: v.name,
        duration: Number.parseInt(v.duration, 10),
        interval: Number.parseInt(v.interval, 10),
        cooldown: Number.parseInt(v.cooldown, 10),
        base_price: v.base_price,
        copy_template: v.copy_template || undefined,
      })),
    };
    mutation.mutate(payload);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" asChild className="shrink-0">
          <Link to="/product">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Buat Produk
          </h1>
          <p className="text-xs text-muted-foreground">
            Tambah produk baru beserta variannya ke sistem.
          </p>
        </div>
      </div>

      <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Formulir Produk & Varian
          </CardTitle>
          <CardDescription className="text-xs">
            Isi data produk dan definisikan setidaknya satu varian.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm
            onSubmit={handleSubmit}
            isPending={mutation.isPending}
            submitButtonText="Buat Produk"
          />
        </CardContent>
      </Card>
    </div>
  );
}
