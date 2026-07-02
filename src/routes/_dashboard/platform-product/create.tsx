import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import type { PlatformProductFormSubmitData } from "@/components/forms/platform-product.form";
import { PlatformProductForm } from "@/components/forms/platform-product.form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CreatePlatformProductPayload } from "@/services/platform-product.service";
import { createPlatformProduct } from "@/services/platform-product.service";

export const Route = createFileRoute("/_dashboard/platform-product/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreatePlatformProductPayload) =>
      createPlatformProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-product"] });
      navigate({ to: "/platform-product" });
      toast.success("Produk platform baru berhasil dibuat.");
    },
    onError: (error) => {
      toast.error(`Terjadi kesalahan: ${error.message}`);
    },
  });

  const handleSubmit = (values: PlatformProductFormSubmitData) => {
    mutation.mutate({
      name: values.name,
      platform: values.platform,
      variant: values.variant?.trim() || null,
      platform_product_id: values.platform_product_id || undefined,
      product_variant_id: values.product_variant_id,
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" asChild className="shrink-0">
          <Link to="/platform-product">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Buat Produk Platform
          </h1>
          <p className="text-xs text-muted-foreground">
            Hubungkan varian produk Anda dengan item di e-commerce.
          </p>
        </div>
      </div>

      <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Formulir Hubungan Platform
          </CardTitle>
          <CardDescription className="text-xs">
            Isi data produk platform Shopee/e-commerce lainnya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlatformProductForm
            onSubmit={handleSubmit}
            isPending={mutation.isPending}
            submitButtonText="Buat Produk Platform"
          />
        </CardContent>
      </Card>
    </div>
  );
}
