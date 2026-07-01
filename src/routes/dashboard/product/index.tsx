import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Package,
  Plus,
  Search,
  SquarePen,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { NoData } from "@/components/custom/no-data";
import { Pagination } from "@/components/custom/pagination";
import type { ProductEditFormSubmitData } from "@/components/forms/product-edit.form";
import { ProductEditForm } from "@/components/forms/product-edit.form";
import type { ProductVariantFormSubmitData } from "@/components/forms/product-variant.form";
import { ProductVariantForm } from "@/components/forms/product-variant.form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  const [expandedProductIds, setExpandedProductIds] = useState<
    Record<string, boolean>
  >({});

  const toggleProductExpand = (productId: string) => {
    setExpandedProductIds((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

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
    productEditMutation.mutate({ id: selectedProduct?.id, payload: value });
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
        product_id: selectedProduct?.id,
        ...payload,
      });
    } else {
      productVariantEditMutation.mutate({
        id: selectedProductVariant?.id,
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

      <div className="rounded-xl border border-border/40 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden">
        {isFetchProductLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : products?.items?.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[60px] text-center" />
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Nama Produk
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Varian
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.items.map((product) => {
                  const isExpanded = !!expandedProductIds[product.id];
                  return (
                    <React.Fragment key={`product-${product.id}`}>
                      <TableRow className="hover:bg-muted/10 transition-colors">
                        <TableCell className="w-[60px] text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 cursor-pointer"
                            onClick={() => toggleProductExpand(product.id)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="size-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="size-4 text-muted-foreground" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-bold text-sm text-foreground py-4">
                          <div className="flex items-center gap-2">
                            <Package className="size-4.5 text-primary shrink-0" />
                            <span>{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-mono px-2 py-0.5"
                          >
                            {product.variants.length} Varian
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs cursor-pointer"
                              onClick={() =>
                                handleCreateProductVariant(product)
                              }
                            >
                              <Plus className="size-3.5 mr-1" />
                              Tambah Varian
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs cursor-pointer"
                              onClick={() => handleProductSelectedEdit(product)}
                            >
                              <SquarePen className="size-3.5 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product)}
                              className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow className="bg-muted/5 hover:bg-muted/5">
                          <TableCell colSpan={4} className="p-0">
                            <div className="px-6 py-4 border-t border-border/20 bg-muted/10 animate-in fade-in slide-in-from-top-1 duration-200">
                              {product.variants.length > 0 ? (
                                <div className="border border-border/30 rounded-lg overflow-hidden bg-background/50">
                                  <Table>
                                    <TableHeader className="bg-muted/30">
                                      <TableRow>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-wider py-2">
                                          Nama Varian
                                        </TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-wider py-2">
                                          Harga Dasar
                                        </TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-wider py-2">
                                          Durasi
                                        </TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-wider py-2">
                                          Interval
                                        </TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-wider py-2">
                                          Cooldown
                                        </TableHead>
                                        <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider py-2">
                                          Aksi
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {product.variants.map((variant) => (
                                        <TableRow
                                          key={variant.id}
                                          className="hover:bg-muted/10"
                                        >
                                          <TableCell className="font-semibold text-xs py-2">
                                            {variant.name}
                                          </TableCell>
                                          <TableCell className="font-bold text-xs text-primary py-2">
                                            {variant.base_price
                                              ? formatRupiah(
                                                  Number.parseInt(
                                                    variant.base_price,
                                                    10,
                                                  ),
                                                )
                                              : "Rp 0"}
                                          </TableCell>
                                          <TableCell className="text-xs py-2 font-mono">
                                            {variant.duration}{" "}
                                            {getTimeUnitSymbol(
                                              variant.duration_unit as TimeUnit,
                                            )}
                                          </TableCell>
                                          <TableCell className="text-xs py-2 font-mono">
                                            {variant.interval}{" "}
                                            {getTimeUnitSymbol(
                                              variant.interval_unit as TimeUnit,
                                            )}
                                          </TableCell>
                                          <TableCell className="text-xs py-2 font-mono">
                                            {variant.cooldown}{" "}
                                            {getTimeUnitSymbol(
                                              variant.cooldown_unit as TimeUnit,
                                            )}
                                          </TableCell>
                                          <TableCell className="text-right py-2">
                                            <div className="flex gap-2 justify-end">
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 px-2 text-[10px] cursor-pointer"
                                                onClick={() =>
                                                  handleProductVariantSelectedEdit(
                                                    variant,
                                                  )
                                                }
                                              >
                                                <SquarePen className="size-3 mr-1" />
                                                Edit
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                  handleDeleteProductVariant(
                                                    product.name,
                                                    variant,
                                                  )
                                                }
                                                className="h-7 px-2 text-[10px] text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                                              >
                                                <Trash2 className="size-3" />
                                              </Button>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              ) : (
                                <div className="text-center py-4 text-xs text-muted-foreground italic">
                                  Belum ada varian produk. Klik "Tambah Varian"
                                  untuk membuat varian baru.
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-12">
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
