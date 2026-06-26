import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { UpdatePlatformProductPayload } from "@/services/platform-product.service";
import {
  getPlatformProductById,
  updatePlatformProduct,
} from "@/services/platform-product.service";

export const Route = createFileRoute("/dashboard/platform-product/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();

  const { data: platformProduct, isLoading: isFetchPlatformProductLoading } =
    useQuery({
      queryKey: ["platform-product", id],
      queryFn: ({ signal }) => getPlatformProductById(id, signal),
    });

  const mutation = useMutation({
    mutationFn: (payload: UpdatePlatformProductPayload) =>
      updatePlatformProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-product"] });
      toast.success("Produk platform berhasil diperbarui.");
      navigate({ to: "/dashboard/platform-product" });
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
    <div className="flex flex-col gap-6 max-w-2xl animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" asChild className="shrink-0">
          <Link to="/dashboard/platform-product">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Ubah Produk Platform
          </h1>
          <p className="text-xs text-muted-foreground">
            Sesuaikan detail produk platform Shopee/e-commerce Anda.
          </p>
        </div>
      </div>

      <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Formulir Hubungan Platform
          </CardTitle>
          <CardDescription className="text-xs">
            Ubah data produk platform yang terhubung.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFetchPlatformProductLoading ? (
            <div className="flex flex-col gap-5">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <PlatformProductForm
              onSubmit={handleSubmit}
              isPending={mutation.isPending}
              initialData={platformProduct}
              submitButtonText="Ubah Produk Platform"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
