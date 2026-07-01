import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpDown,
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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

      <div className="rounded-xl border border-border/40 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden">
        {isFetchPlatformProductLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : platformProducts?.items?.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Nama Produk Platform
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Platform
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    ID Produk Platform
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Produk Internal (Varian)
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {platformProducts.items.map((platformProduct) => (
                  <TableRow
                    key={platformProduct.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="font-semibold text-xs text-foreground">
                      <div className="flex flex-col">
                        <span>{platformProduct.name}</span>
                        {platformProduct.variant && (
                          <span className="text-[10px] text-muted-foreground font-normal">
                            {platformProduct.variant}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-primary/5 text-primary border-primary/20 text-[10px] py-0 px-2 font-medium"
                      >
                        {platformProduct.platform}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {platformProduct.platform_product_id || "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {platformProduct.product_variant ? (
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {platformProduct.product_variant.product?.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {platformProduct.product_variant.name}
                          </span>
                        </div>
                      ) : (
                        <span className="italic text-muted-foreground">
                          — Belum Terhubung —
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-8 text-xs cursor-pointer"
                        >
                          <Link
                            to="/dashboard/platform-product/$id"
                            params={{ id: platformProduct.id }}
                          >
                            <SquarePen className="size-3.5 mr-1" />
                            Update
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDeletePlatformProduct(platformProduct)
                          }
                          className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-12">
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
