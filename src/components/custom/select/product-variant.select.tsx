import { useQuery } from "@tanstack/react-query";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { useState } from "react";
import { NoData } from "@/components/custom/no-data";
import { Pagination } from "@/components/custom/pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  GetProductVariantsParams,
  ProductVariant,
} from "@/services/product.service";
import { getAllProductVariant } from "@/services/product.service";

export function ProductVariantSelect({
  selectedItem,
  onSelect,
  disabled,
}: {
  selectedItem?: ProductVariant;
  onSelect: (selected?: ProductVariant) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [params, setParams] = useState<GetProductVariantsParams>({
    name: "",
    product: "",
    page: 1,
  });

  const { data: productVariants, isLoading: isFetchProductVariantLoading } =
    useQuery({
      queryKey: ["product-variant", params],
      queryFn: () => getAllProductVariant(params),
    });

  const handleRadioValueChange = (value: string) => {
    const selectedProductVariant = productVariants?.items.length
      ? productVariants.items.find((v) => v.id === value)
      : undefined;
    if (!selectedProductVariant) {
      onSelect(undefined);
    } else {
      onSelect(selectedProductVariant);
    }
    setIsOpen(false);
  };

  const handlePaginationChange = (page: number) => {
    setParams({ ...params, page });
  };

  const handleSearchProduct = (value: string) => {
    setParams({ ...params, product: value, page: 1 });
  };

  const handleSearchProductVariant = (value: string) => {
    setParams({ ...params, name: value, page: 1 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={selectedItem ? "outline" : "outline-dashed"}
          disabled={disabled}
          className="w-full justify-between font-normal text-left h-9 px-3"
        >
          {selectedItem ? (
            <span className="truncate text-foreground font-medium">
              {selectedItem.product?.name} {selectedItem.name}
            </span>
          ) : (
            <span className="text-muted-foreground">
              Pilih Varian Produk...
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-screen h-screen sm:max-w-none max-w-none rounded-none flex flex-col p-4 md:p-14">
        <DialogHeader className="gap-4">
          <DialogTitle className="text-xl font-semibold">
            Pilih Varian Produk
          </DialogTitle>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <Input
              type="text"
              defaultValue={params.product}
              placeholder="Cari Produk..."
              onChange={(e) => handleSearchProduct(e.target.value)}
              className="flex-1"
            />
            <Input
              type="text"
              defaultValue={params.name}
              placeholder="Cari Varian Produk..."
              onChange={(e) => handleSearchProductVariant(e.target.value)}
              className="flex-1"
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 py-4">
          {isFetchProductVariantLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          ) : productVariants?.items.length ? (
            <RadioGroupPrimitive.Root
              value={selectedItem?.id ?? ""}
              onValueChange={handleRadioValueChange}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {productVariants.items.map((productVariant) => (
                <RadioGroupPrimitive.Item
                  key={productVariant.id}
                  id={productVariant.id}
                  value={productVariant.id}
                  className="bg-card hover:bg-accent/40 border border-border hover:border-accent p-4 rounded-lg flex justify-between items-center gap-4 transition-all duration-200 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring select-none data-[state=checked]:bg-primary/5 data-[state=checked]:border-primary"
                >
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground mb-1">
                      {productVariant.product?.name ?? "No Product Name"}
                    </span>
                    <span className="font-medium text-foreground text-sm">
                      {productVariant.name}
                    </span>
                  </div>
                </RadioGroupPrimitive.Item>
              ))}
            </RadioGroupPrimitive.Root>
          ) : (
            <NoData>Varian Produk tidak ditemukan</NoData>
          )}
        </div>

        {!!productVariants && productVariants.paginationData.totalPage > 1 && (
          <div className="flex items-center justify-center py-4 border-t border-border">
            <Pagination
              currentPage={productVariants.paginationData.currentPage}
              totalPages={productVariants.paginationData.totalPage}
              onPageChange={handlePaginationChange}
            />
          </div>
        )}

        <DialogFooter className="border-t border-border pt-4">
          <DialogClose asChild>
            <Button variant="outline" className="w-full cursor-pointer">
              Batal
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
