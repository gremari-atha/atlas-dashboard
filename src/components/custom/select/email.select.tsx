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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Email, GetEmailsParams } from "@/services/email.service";
import { getAllEmail } from "@/services/email.service";
import type { OrderByDirection } from "@/types/order-by.type";

export function EmailSelect({
  selectedItem,
  onSelect,
}: {
  selectedItem?: Email;
  onSelect: (selected?: Email) => void;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [params, setParams] = useState<GetEmailsParams>({
    email: "",
    page: 1,
    order_by: "",
    order_direction: undefined,
  });

  const { data: emails, isLoading: isFetchEmailLoading } = useQuery({
    queryKey: ["email", params],
    queryFn: () => getAllEmail(params),
  });

  const handleRadioValueChange = (value: string) => {
    const selectedEmail = emails?.items.length
      ? emails.items.find((v) => v.id === value)
      : undefined;
    if (!selectedEmail) {
      onSelect(undefined);
    } else {
      onSelect(selectedEmail);
    }
    setIsOpen(false);
  };

  const handlePaginationChange = (page: number) => {
    setParams({ ...params, page });
  };

  const handleSortChange = (value: string) => {
    if (value === "default") {
      setParams({ ...params, order_by: "", order_direction: undefined });
    } else {
      const [orderBy, orderDirection] = value.split(":");
      setParams({
        ...params,
        order_by: orderBy,
        order_direction: orderDirection as OrderByDirection,
      });
    }
  };

  const handleSearchEmail = (email: string) => {
    setParams({ ...params, email, page: 1 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={selectedItem ? "outline" : "outline-dashed"}
          className="w-full justify-between font-normal text-left h-9 px-3"
        >
          {selectedItem ? (
            <span className="truncate text-foreground font-medium">
              {selectedItem.email}
            </span>
          ) : (
            <span className="text-muted-foreground">Pilih Email...</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-screen h-screen sm:max-w-none max-w-none rounded-none flex flex-col p-4 md:p-14">
        <DialogHeader className="gap-4">
          <DialogTitle className="text-xl font-semibold">
            Pilih Email
          </DialogTitle>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <Input
              type="text"
              defaultValue={params.email}
              placeholder="Cari Email..."
              onChange={(e) => handleSearchEmail(e.target.value)}
              className="flex-1"
            />
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Urutkan:
              </span>
              <Select defaultValue="default" onValueChange={handleSortChange}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Pilih Urutan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="email:asc">Email A-Z</SelectItem>
                  <SelectItem value="email:desc">Email Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 py-4">
          {isFetchEmailLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          ) : emails?.items.length ? (
            <RadioGroupPrimitive.Root
              value={selectedItem?.id ?? ""}
              onValueChange={handleRadioValueChange}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {emails.items.map((email) => (
                <RadioGroupPrimitive.Item
                  key={email.id}
                  id={email.id}
                  value={email.id}
                  className="bg-card hover:bg-accent/40 border border-border hover:border-accent p-4 rounded-lg flex justify-between items-center gap-4 transition-all duration-200 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring select-none data-[state=checked]:bg-primary/5 data-[state=checked]:border-primary"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground text-sm">
                      {email.email}
                    </span>
                  </div>
                </RadioGroupPrimitive.Item>
              ))}
            </RadioGroupPrimitive.Root>
          ) : (
            <NoData>Email tidak ditemukan</NoData>
          )}
        </div>

        {!!emails && emails.paginationData.totalPage > 1 && (
          <div className="flex items-center justify-center py-4 border-t border-border">
            <Pagination
              currentPage={emails.paginationData.currentPage}
              totalPages={emails.paginationData.totalPage}
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
