import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpDown,
  Blocks,
  EllipsisVertical,
  Package,
  Plus,
  Search,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { NoData } from "@/components/custom/no-data";
import { Pagination } from "@/components/custom/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useGlobalAlertDialog } from "@/context-providers/alert-dialog.provider";
import type {
  PlatformProduct,
  PlatformProductFilter,
} from "@/services/platform-product.service";
import {
  deletePlatformProduct,
  GetPlatformProductParamsSchema,
  getAllPlatformProduct,
} from "@/services/platform-product.service";
import type { OrderByDirection } from "@/types/order-by.type";

export const Route = createFileRoute("/dashboard/platform-product/")({
  component: RouteComponent,
  validateSearch: GetPlatformProductParamsSchema,
});

function RouteComponent() {
  const searchParam = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const { showAlertDialog, hideAlertDialog } = useGlobalAlertDialog();

  const [filter, setFilter] = useState<PlatformProductFilter>({
    name: searchParam.name ?? "",
    platform: searchParam.platform ?? "",
    variant: searchParam.variant ?? "",
    platform_product_id: searchParam.platform_product_id ?? "",
    product_variant_id: searchParam.product_variant_id ?? "",
  });
  const [sort, setSort] = useState<string>(
    !!searchParam.order_by && !!searchParam.order_direction
      ? `${searchParam.order_by}:${searchParam.order_direction}`
      : "default",
  );

  const { data: platformProducts, isLoading: isFetchPlatformProductLoading } =
    useQuery({
      queryKey: ["platform-product", searchParam],
      queryFn: ({ signal }) =>
        getAllPlatformProduct({ ...searchParam, signal }),
    });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePlatformProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-product"] });
      toast.success("Produk platform berhasil dihapus.");
    },
    onError: (error) => {
      toast.error(`Gagal menghapus produk platform: ${error.message}`);
    },
    onSettled: () => {
      hideAlertDialog();
    },
  });

  const handleDeletePlatformProduct = (platformProduct: PlatformProduct) => {
    showAlertDialog({
      title: "Yakin ingin menghapus Produk Platform?",
      description: (
        <>
          Aksi tidak dapat dibatalkan. Ini akan menghapus Produk Platform{" "}
          <span className="font-bold text-foreground">
            {platformProduct.name}
          </span>{" "}
          secara permanen.
        </>
      ),
      confirmText: "Hapus",
      isConfirming: deleteMutation.isPending,
      onConfirm: () => deleteMutation.mutate(platformProduct.id),
    });
  };

  const handleSearchPlatformProduct = useDebouncedCallback((value: string) => {
    setFilter((prev) => ({ ...prev, name: value }));
    const name = value || undefined;
    navigate({ search: (prev) => ({ ...prev, name, page: 1 }), replace: true });
  }, 500);

  const handleSearchVariant = useDebouncedCallback((value: string) => {
    setFilter((prev) => ({ ...prev, variant: value }));
    const variant = value || undefined;
    navigate({
      search: (prev) => ({ ...prev, variant, page: 1 }),
      replace: true,
    });
  }, 500);

  const handleSortChange = (value: string) => {
    setSort(value);

    const [orderBy, orderDirection] =
      value === "default" ? [undefined, undefined] : value.split(":");
    navigate({
      search: (prev) => ({
        ...prev,
        order_by: orderBy,
        order_direction: orderDirection as OrderByDirection | undefined,
        page: 1,
      }),
      replace: true,
    });
  };

  const handlePaginationChange = (page: number) => {
    navigate({
      search: (prev: any) => ({
        ...prev,
        page,
      }),
      replace: true,
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Produk Platform
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola produk yang terhubung dengan marketplace / platform luar.
          </p>
        </div>
        <Button asChild className="shadow-sm">
          <Link to="/dashboard/platform-product/create">
            <Plus className="mr-2 size-4" />
            Hubungkan Produk
          </Link>
        </Button>
      </div>

      <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              defaultValue={filter.name}
              placeholder="Cari Produk Platform..."
              className="pl-9 w-full bg-background/50"
              onChange={(e) => handleSearchPlatformProduct(e.target.value)}
            />
          </div>
          <div className="relative w-full md:w-64">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              defaultValue={filter.variant}
              placeholder="Cari Variant..."
              className="pl-9 w-full bg-background/50"
              onChange={(e) => handleSearchVariant(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <ArrowUpDown className="size-4 text-muted-foreground hidden md:inline" />
            <Select defaultValue={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full md:w-44 bg-background/50">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="name:asc">Nama A-Z</SelectItem>
                <SelectItem value="name:desc">Nama Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isFetchPlatformProductLoading ? (
          <>
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
          </>
        ) : platformProducts?.items.length ? (
          platformProducts.items.map((platformProduct) => (
            <Card
              key={platformProduct.id}
              className="relative overflow-hidden border-border/40 shadow-sm bg-card/60 backdrop-blur-md hover:shadow-md hover:border-border/80 transition-all duration-300 group"
            >
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1 pr-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="bg-primary/5 text-primary border-primary/20 text-[10px] py-0 px-2 font-medium"
                    >
                      {platformProduct.platform}
                    </Badge>
                    {platformProduct.platform_product_id && (
                      <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                        ID: {platformProduct.platform_product_id}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                    {platformProduct.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground font-medium">
                    {platformProduct.variant || "— No Variant —"}
                  </CardDescription>
                </div>

                <div className="absolute right-3 top-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-muted"
                      >
                        <EllipsisVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem asChild>
                        <Link
                          to="/dashboard/platform-product/$id"
                          params={{ id: platformProduct.id }}
                          className="cursor-pointer flex items-center"
                        >
                          <SquarePen className="mr-2 size-4 text-muted-foreground" />
                          Update
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() =>
                          handleDeletePlatformProduct(platformProduct)
                        }
                        className="text-destructive focus:text-destructive cursor-pointer"
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-2 pt-3 border-t border-border/40 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">
                      Platform
                    </span>
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Blocks className="size-3.5 text-primary" />
                      {platformProduct.platform}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">
                      Internal Product
                    </span>
                    <span
                      className="text-sm font-semibold text-foreground block truncate"
                      title={`${platformProduct.product_variant.product?.name} (${platformProduct.product_variant.name})`}
                    >
                      {platformProduct.product_variant.product?.name}{" "}
                      <span className="text-xs text-muted-foreground font-normal">
                        ({platformProduct.product_variant.name})
                      </span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <NoData>Produk Platform tidak ditemukan</NoData>
          </div>
        )}
      </div>

      {!!platformProducts && platformProducts.paginationData.totalPage > 1 && (
        <div className="flex items-center justify-center mt-4">
          <Pagination
            currentPage={platformProducts.paginationData.currentPage}
            totalPages={platformProducts.paginationData.totalPage}
            onPageChange={handlePaginationChange}
          />
        </div>
      )}
    </div>
  );
}
