import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpDown,
  ClockFading,
  EllipsisVertical,
  Hourglass,
  Package,
  Plus,
  Search,
  SquarePen,
  Tag,
  Timer,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { NoData } from "@/components/custom/no-data";
import { Pagination } from "@/components/custom/pagination";
import type { ProductEditFormSubmitData } from "@/components/forms/product-edit.form";
import { ProductEditForm } from "@/components/forms/product-edit.form";
import type { ProductVariantFormSubmitData } from "@/components/forms/product-variant.form";
import { ProductVariantForm } from "@/components/forms/product-variant.form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useGlobalAlertDialog } from "@/context-providers/alert-dialog.provider";
import { formatRupiah } from "@/lib/currency";
import type { TimeUnit } from "@/lib/time-converter";
import { getTimeUnitSymbol } from "@/lib/time-converter";
import type {
  CreateProductVariantPayload,
  Product,
  ProductFilter,
  ProductVariant,
  UpdateProductPayload,
  UpdateProductVariantPayload,
} from "@/services/product.service";
import {
  createNewProductVariant,
  deleteProduct,
  deleteProductVariant,
  GetProductsParamsSchema,
  getAllProduct,
  updateProduct,
  updateProductVariant,
} from "@/services/product.service";
import type { OrderByDirection } from "@/types/order-by.type";

export const Route = createFileRoute("/dashboard/product/")({
  component: RouteComponent,
  validateSearch: GetProductsParamsSchema,
});

function RouteComponent() {
  const searchParam = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const { showAlertDialog, hideAlertDialog } = useGlobalAlertDialog();

  const [filter, setFilter] = useState<ProductFilter>({
    name: searchParam.name ?? "",
  });
  const [sort, setSort] = useState<string>(
    !!searchParam.order_by && !!searchParam.order_direction
      ? `${searchParam.order_by}:${searchParam.order_direction}`
      : "default",
  );

  const [dialogProductEditOpen, setDialogProductEditOpen] =
    useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product>();
  const [dialogProductVariantOpen, setDialogProductVariantOpen] =
    useState<boolean>(false);
  const [selectedProductVariant, setSelectedProductVariant] =
    useState<ProductVariant>();
  const [productVariantFormMode, setProductVariantFormMode] = useState<
    "CREATE" | "EDIT"
  >("CREATE");

  const { data: products, isLoading: isFetchProductLoading } = useQuery({
    queryKey: ["product", searchParam],
    queryFn: ({ signal }) => getAllProduct({ ...searchParam, signal }),
  });

  const productVariantCreateMutation = useMutation({
    mutationFn: (payload: CreateProductVariantPayload) =>
      createNewProductVariant(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
      toast.success("Varian produk berhasil dibuat.");
    },
    onError: (error) => {
      toast.error(`Gagal membuat varian produk: ${error.message}`);
    },
    onSettled: () => {
      setDialogProductVariantOpen(false);
    },
  });

  const handleCreateProductVariant = (product: Product) => {
    setProductVariantFormMode("CREATE");
    setSelectedProductVariant(undefined);
    setSelectedProduct(product);
    setDialogProductVariantOpen(true);
  };

  const productEditMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProductPayload;
    }) => updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
      toast.success("Produk berhasil diperbarui.");
    },
    onError: (error) => {
      toast.error(`Gagal memperbarui produk: ${error.message}`);
    },
    onSettled: () => {
      setDialogProductEditOpen(false);
    },
  });

  const handleProductSelectedEdit = (product: Product) => {
    setSelectedProduct(product);
    setDialogProductEditOpen(true);
  };

  const handleProductEditSubmit = (value: ProductEditFormSubmitData) => {
    productEditMutation.mutate({ id: selectedProduct!.id, payload: value });
  };

  const productVariantEditMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProductVariantPayload;
    }) => updateProductVariant(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
      toast.success("Varian produk berhasil diperbarui.");
    },
    onError: (error) => {
      toast.error(`Gagal memperbarui varian produk: ${error.message}`);
    },
    onSettled: () => {
      setDialogProductVariantOpen(false);
    },
  });

  const handleProductVariantSelectedEdit = (productVariant: ProductVariant) => {
    setProductVariantFormMode("EDIT");
    setSelectedProductVariant(productVariant);
    setDialogProductVariantOpen(true);
  };

  const handleProductVariantFormSubmit = (
    value: ProductVariantFormSubmitData,
  ) => {
    const payload = {
      name: value.name,
      duration: Number.parseInt(value.duration, 10),
      interval: Number.parseInt(value.interval, 10),
      cooldown: Number.parseInt(value.cooldown, 10),
      base_price: value.base_price,
      copy_template: value.copy_template ? value.copy_template : undefined,
    };
    if (productVariantFormMode === "CREATE") {
      productVariantCreateMutation.mutate({
        product_id: selectedProduct!.id,
        ...payload,
      });
    } else {
      productVariantEditMutation.mutate({
        id: selectedProductVariant!.id,
        payload,
      });
    }
  };

  const productDeleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
      toast.success("Produk berhasil dihapus.");
    },
    onError: (error) => {
      toast.error(`Gagal menghapus produk: ${error.message}`);
    },
    onSettled: () => {
      hideAlertDialog();
    },
  });

  const handleDeleteProduct = (product: Product) => {
    showAlertDialog({
      title: "Yakin ingin menghapus Produk?",
      description: (
        <>
          Aksi tidak dapat dibatalkan. Ini akan menghapus produk{" "}
          <span className="font-bold text-foreground">{product.name}</span>{" "}
          secara permanen beserta seluruh variannya.
        </>
      ),
      confirmText: "Hapus",
      isConfirming: productDeleteMutation.isPending,
      onConfirm: () => productDeleteMutation.mutate(product.id),
    });
  };

  const productVariantDeleteMutation = useMutation({
    mutationFn: (id: string) => deleteProductVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
      toast.success("Varian produk berhasil dihapus.");
    },
    onError: (error) => {
      toast.error(`Gagal menghapus varian produk: ${error.message}`);
    },
    onSettled: () => {
      hideAlertDialog();
    },
  });

  const handleDeleteProductVariant = (
    productName: string,
    productVariant: ProductVariant,
  ) => {
    showAlertDialog({
      title: "Yakin ingin menghapus Varian Produk?",
      description: (
        <>
          Aksi tidak dapat dibatalkan. Ini akan menghapus varian produk{" "}
          <span className="font-bold text-foreground">
            {productName} - {productVariant.name}
          </span>{" "}
          secara permanen.
        </>
      ),
      confirmText: "Hapus",
      isConfirming: productVariantDeleteMutation.isPending,
      onConfirm: () => productVariantDeleteMutation.mutate(productVariant.id),
    });
  };

  const handleSearchProduct = useDebouncedCallback((value: string) => {
    setFilter({ name: value });
    const name = value || undefined;
    navigate({ search: (prev) => ({ ...prev, name, page: 1 }), replace: true });
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
            Produk
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola katalog produk Anda beserta variasi masa aktif, interval, dan
            harganya.
          </p>
        </div>
        <Button asChild className="shadow-sm">
          <Link to="/dashboard/product/create">
            <Plus className="mr-2 size-4" />
            Buat Produk
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
              placeholder="Cari Produk..."
              className="pl-9 w-full bg-background/50"
              onChange={(e) => handleSearchProduct(e.target.value)}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isFetchProductLoading ? (
          <>
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </>
        ) : products?.items.length ? (
          products.items.map((product) => (
            <Card
              key={`product-${product.id}`}
              className="relative overflow-hidden border-border/40 shadow-sm bg-card/60 backdrop-blur-md flex flex-col group hover:shadow-md hover:border-border/80 transition-all duration-300"
            >
              <div className="p-5 border-b border-border/40 flex justify-between items-center bg-muted/20">
                <div className="flex items-center gap-2">
                  <Package className="size-5 text-primary" />
                  <span className="font-bold text-base text-foreground leading-snug group-hover:text-primary transition-colors">
                    {product.name}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-muted shrink-0"
                    >
                      <EllipsisVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem
                      onSelect={() => handleProductSelectedEdit(product)}
                      className="cursor-pointer"
                    >
                      <SquarePen className="mr-2 size-4 text-muted-foreground" />
                      Update
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleDeleteProduct(product)}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="p-5 flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Tag className="size-3.5" /> Varian (
                    {product.variants.length})
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCreateProductVariant(product)}
                    className="h-7 px-2 text-[11px] cursor-pointer hover:bg-muted"
                  >
                    <Plus className="mr-1 size-3" /> Tambah
                  </Button>
                </div>

                <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
                  {product.variants.length > 0 ? (
                    product.variants.map((variant) => (
                      <div
                        key={`variant-${variant.id}`}
                        className="p-3 border border-border/30 rounded-lg bg-background/40 hover:bg-background/80 transition-colors flex flex-col gap-2.5"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-0.5 min-w-0">
                            <span
                              className="font-bold text-xs text-foreground block truncate"
                              title={variant.name}
                            >
                              {variant.name}
                            </span>
                            <span className="text-xs font-semibold text-primary block">
                              {variant.base_price
                                ? formatRupiah(
                                    Number.parseInt(variant.base_price, 10),
                                  )
                                : "Rp 0"}
                            </span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-muted shrink-0"
                              >
                                <EllipsisVertical className="size-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                              <DropdownMenuItem
                                onSelect={() =>
                                  handleProductVariantSelectedEdit(variant)
                                }
                                className="cursor-pointer text-xs"
                              >
                                <SquarePen className="mr-2 size-3.5 text-muted-foreground" />
                                Update
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() =>
                                  handleDeleteProductVariant(
                                    product.name,
                                    variant,
                                  )
                                }
                                className="text-destructive focus:text-destructive cursor-pointer text-xs"
                              >
                                <Trash2 className="mr-2 size-3.5" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="grid grid-cols-3 gap-2 border-t border-border/20 pt-2 text-[10px]">
                          <div className="space-y-0.5">
                            <span className="text-muted-foreground block font-medium">
                              Durasi
                            </span>
                            <span className="font-bold text-foreground flex items-center gap-1">
                              <Timer className="size-3 text-muted-foreground" />
                              {variant.duration}{" "}
                              {getTimeUnitSymbol(
                                variant.duration_unit as TimeUnit,
                              )}
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-muted-foreground block font-medium">
                              Interval
                            </span>
                            <span className="font-bold text-foreground flex items-center gap-1">
                              <ClockFading className="size-3 text-muted-foreground" />
                              {variant.interval}{" "}
                              {getTimeUnitSymbol(
                                variant.interval_unit as TimeUnit,
                              )}
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-muted-foreground block font-medium">
                              Cooldown
                            </span>
                            <span className="font-bold text-foreground flex items-center gap-1">
                              <Hourglass className="size-3 text-muted-foreground" />
                              {variant.cooldown}{" "}
                              {getTimeUnitSymbol(
                                variant.cooldown_unit as TimeUnit,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-muted-foreground bg-muted/10 border border-dashed border-border/40 rounded-lg">
                      Belum ada varian produk.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <NoData>Produk tidak ditemukan</NoData>
          </div>
        )}
      </div>

      {!!products && products.paginationData.totalPage > 1 && (
        <div className="flex items-center justify-center mt-4">
          <Pagination
            currentPage={products.paginationData.currentPage}
            totalPages={products.paginationData.totalPage}
            onPageChange={handlePaginationChange}
          />
        </div>
      )}

      {/* Edit Product Dialog */}
      <Dialog
        open={dialogProductEditOpen}
        onOpenChange={setDialogProductEditOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Ubah Produk
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductEditForm
              initialData={selectedProduct}
              isPending={productEditMutation.isPending}
              onSubmit={handleProductEditSubmit}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit/Create Product Variant Dialog */}
      <Dialog
        open={dialogProductVariantOpen}
        onOpenChange={setDialogProductVariantOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              {productVariantFormMode === "CREATE"
                ? "Tambah Varian Produk"
                : "Ubah Varian Produk"}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(100vh-200px)] px-1">
            <ProductVariantForm
              initialData={selectedProductVariant}
              isPending={
                productVariantFormMode === "CREATE"
                  ? productVariantCreateMutation.isPending
                  : productVariantEditMutation.isPending
              }
              onSubmit={handleProductVariantFormSubmit}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
