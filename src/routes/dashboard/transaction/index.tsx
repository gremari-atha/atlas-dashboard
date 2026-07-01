import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpDown,
  Calendar as CalendarIcon,
  CircleHelp,
  Copy,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { NoData } from "@/components/custom/no-data";
import { Pagination } from "@/components/custom/pagination";
import { ShopeeLogo } from "@/components/icons/shopee-logo";
import { WhatsappLogo } from "@/components/icons/whatsapp-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarInput } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { handleCopyTemplate } from "@/lib/copy-template";
import { formatRupiah } from "@/lib/currency";
import { formatDateIdStandard } from "@/lib/time-converter";

import type { Transaction } from "@/services/transaction.service";
import {
  deleteTransaction,
  GetTransactionParamsSchema,
  getAllTransaction,
} from "@/services/transaction.service";
import type { OrderByDirection } from "@/types/order-by.type";

export const Route = createFileRoute("/dashboard/transaction/")({
  component: RouteComponent,
  validateSearch: GetTransactionParamsSchema,
});

function RouteComponent() {
  const searchParam = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const { showAlertDialog, hideAlertDialog } = useGlobalAlertDialog();

  const [customerSearch, setCustomerSearch] = useState(
    searchParam.customer || "",
  );
  const sort = useMemo<string>(
    () =>
      !!searchParam.order_by && !!searchParam.order_direction
        ? `${searchParam.order_by}:${searchParam.order_direction}`
        : "default",
    [searchParam.order_by, searchParam.order_direction],
  );

  useEffect(() => {
    setCustomerSearch(searchParam.customer || "");
  }, [searchParam.customer]);

  const [dialogTransactionUserOpen, setDialogTransactionUserOpen] =
    useState<boolean>(false);
  const [dialogFilterOpen, setDialogFilterOpen] = useState<boolean>(false);

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction>();
  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRange | undefined
  >(() => {
    if (searchParam.from_date && searchParam.to_date) {
      return {
        from: new Date(searchParam.from_date),
        to: new Date(searchParam.to_date),
      };
    }
    return undefined;
  });

  const { data: transactions, isLoading: isFetchTransactionLoading } = useQuery(
    {
      queryKey: ["transaction", searchParam],
      queryFn: ({ signal }) => getAllTransaction({ ...searchParam, signal }),
    },
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaction"] });
      toast.success("Transaksi berhasil dihapus.");
    },
    onError: (error) => {
      toast.error(`Gagal menghapus transaksi: ${error.message}`);
    },
    onSettled: () => {
      hideAlertDialog();
    },
  });

  const handleDeleteTransaction = (transaction: Transaction) => {
    showAlertDialog({
      title: "Yakin ingin menghapus Transaksi?",
      description: (
        <>
          Aksi tidak dapat dibatalkan. Ini akan menghapus Transaksi{" "}
          <span className="font-bold text-foreground">{transaction.id}</span>{" "}
          secara permanen.
        </>
      ),
      confirmText: "Hapus",
      isConfirming: deleteMutation.isPending,
      onConfirm: () => deleteMutation.mutate(transaction.id),
    });
  };

  const handleViewItemDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDialogTransactionUserOpen(true);
  };

  const handleSearchCustomer = useDebouncedCallback((value: string) => {
    const customer = value || undefined;
    navigate({
      search: (prev) => ({ ...prev, customer, page: 1 }),
      replace: true,
    });
  }, 500);

  const handleDateRangeSelect = (dateRange?: DateRange) => {
    setSelectedDateRange(dateRange);
  };

  const handleSortChange = (value: string) => {
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
      search: (prev) => ({
        ...prev,
        page,
      }),
      replace: true,
    });
  };

  const handleFilterApply = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        from_date: selectedDateRange?.from?.toISOString() || undefined,
        to_date: selectedDateRange?.to?.toISOString() || undefined,
        page: 1,
      }),
      replace: true,
    });
    setDialogFilterOpen(false);
  };

  const handleFilterClear = () => {
    setSelectedDateRange(undefined);
    navigate({
      search: (prev) => ({
        ...prev,
        from_date: undefined,
        to_date: undefined,
        page: 1,
      }),
      replace: true,
    });
    setDialogFilterOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Transaksi
          </h1>
          <p className="text-sm text-muted-foreground">
            Pantau dan buat catatan transaksi penjualan serta log sewa akun
            customer Anda.
          </p>
        </div>
        <Button asChild className="shadow-sm">
          <Link to="/dashboard/transaction/create">
            <Plus className="mr-2 size-4" />
            Transaksi Baru
          </Link>
        </Button>
      </div>

      <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              value={customerSearch}
              placeholder="Cari Customer..."
              className="pl-9 w-full bg-background/50"
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                handleSearchCustomer(e.target.value);
              }}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setDialogFilterOpen(true);
              }}
              className="cursor-pointer w-full md:w-auto bg-background/50"
            >
              <SlidersHorizontal className="mr-2 size-4 text-muted-foreground" />
              Filter Tanggal
              {(searchParam.from_date || searchParam.to_date) && (
                <span className="ml-1.5 size-2 rounded-full bg-primary" />
              )}
            </Button>
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <ArrowUpDown className="size-4 text-muted-foreground hidden md:inline" />
              <Select defaultValue={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full md:w-44 bg-background/50">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Terbaru</SelectItem>
                  <SelectItem value="created_at:asc">Terlama</SelectItem>
                  <SelectItem value="total_price:desc">
                    Harga Tertinggi
                  </SelectItem>
                  <SelectItem value="total_price:asc">
                    Harga Terendah
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border/40 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden">
        {isFetchTransactionLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : transactions?.items?.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-27.5 text-xs font-semibold uppercase tracking-wider">
                    ID
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Tanggal
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Preview Item Utama
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Customer
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Platform
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Total Harga
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.items.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {transaction.id}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground">
                      <div className="flex gap-2 items-center">
                        <CalendarIcon className="size-3.5 text-muted-foreground" />
                        <span>
                          {formatDateIdStandard(transaction.created_at)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.items.length ? (
                        transaction.items[0].user ? (
                          <div className="flex gap-2.5 items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                handleCopyTemplate(
                                  transaction.items[0].user?.profile,
                                  transaction.items[0].user?.account,
                                );
                              }}
                              className="size-7 shrink-0 cursor-pointer hover:bg-muted"
                              title="Salin Template Akun"
                            >
                              <Copy className="size-3.5" />
                            </Button>
                            <div className="min-w-0">
                              <p
                                className="font-semibold text-xs text-foreground truncate max-w-50"
                                title={
                                  transaction.items[0].user.account.email.email
                                }
                              >
                                {transaction.items[0].user.account.email.email}
                              </p>
                              <p className="text-muted-foreground text-[10px] truncate max-w-50">
                                {
                                  transaction.items[0].user.account
                                    .product_variant.product?.name
                                }{" "}
                                {
                                  transaction.items[0].user.account
                                    .product_variant.name
                                }{" "}
                                <span className="font-medium text-foreground">
                                  ({transaction.items[0].user.profile.name})
                                </span>
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="italic text-muted-foreground text-xs font-medium">
                            User Belum Dibuat
                          </span>
                        )
                      ) : (
                        <span className="italic text-muted-foreground text-xs">
                          No Item
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-foreground">
                      {transaction.customer}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 items-center">
                        {transaction.platform === "Shopee" ? (
                          <Badge
                            variant="outline"
                            className="bg-orange-500/5 text-orange-500 border-orange-500/10 text-[10px] font-semibold flex gap-1 items-center py-0.5 px-2"
                          >
                            <ShopeeLogo className="size-3.5" />
                            <span>Shopee</span>
                          </Badge>
                        ) : transaction.platform === "Whatsapp" ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/5 text-emerald-500 border-emerald-500/10 text-[10px] font-semibold flex gap-1 items-center py-0.5 px-2"
                          >
                            <WhatsappLogo className="size-3.5" />
                            <span>Whatsapp</span>
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-muted text-muted-foreground text-[10px] font-semibold flex gap-1 items-center py-0.5 px-2"
                          >
                            <CircleHelp className="size-3.5" />
                            <span>{transaction.platform}</span>
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-primary">
                      {formatRupiah(transaction.total_price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewItemDetail(transaction)}
                          className="h-8 text-xs cursor-pointer hover:bg-muted"
                        >
                          <ShoppingBag className="mr-1.5 size-3.5" />
                          Detail ({transaction.items.length})
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction)}
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
            <NoData>Transaksi tidak ditemukan</NoData>
          </div>
        )}
      </div>

      {!!transactions && transactions.paginationData.totalPage > 1 && (
        <div className="flex items-center justify-center mt-4">
          <Pagination
            currentPage={transactions.paginationData.currentPage}
            totalPages={transactions.paginationData.totalPage}
            onPageChange={handlePaginationChange}
          />
        </div>
      )}

      {/* Transaction Item Detail Dialog */}
      <Dialog
        open={dialogTransactionUserOpen}
        onOpenChange={setDialogTransactionUserOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Detail Item Transaksi
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction ? (
            <div className="flex flex-col gap-4 py-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                  ID Transaksi
                </p>
                <p className="text-xs font-mono font-bold bg-muted px-2 py-1 rounded w-fit">
                  {selectedTransaction.id}
                </p>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                  Daftar Item ({selectedTransaction.items.length})
                </p>
                {selectedTransaction.items.length ? (
                  selectedTransaction.items.map((item) => (
                    <Card
                      key={item.id}
                      className="border-border/40 shadow-sm bg-muted/10"
                    >
                      <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0 gap-3">
                        <div className="space-y-1 min-w-0">
                          <CardTitle className="text-xs font-bold leading-snug">
                            {item.user?.account.product_variant.product?.name}{" "}
                            {item.user?.account.product_variant.name}
                          </CardTitle>
                          <CardDescription
                            className="text-[11px] font-mono text-muted-foreground truncate"
                            title={item.user?.account.email.email}
                          >
                            {item.user?.account.email.email ||
                              "— Email belum disematkan —"}
                          </CardDescription>
                          {item.user?.profile.name && (
                            <p className="text-[10px] font-medium text-foreground bg-muted w-fit px-1.5 py-0.5 rounded mt-1">
                              Profil: {item.user.profile.name}
                            </p>
                          )}
                        </div>
                        {item.user && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              handleCopyTemplate(
                                item.user?.profile,
                                item.user?.account,
                              );
                            }}
                            className="size-7 cursor-pointer shrink-0"
                            title="Salin Akun"
                          >
                            <Copy className="size-3.5" />
                          </Button>
                        )}
                      </CardHeader>
                    </Card>
                  ))
                ) : (
                  <p className="text-xs italic text-muted-foreground">
                    Tidak ada item
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Tidak Ada Transaksi Terpilih
            </p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" className="w-full cursor-pointer">
                Tutup
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Transaction Dialog */}
      <Dialog open={dialogFilterOpen} onOpenChange={setDialogFilterOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Filter Transaksi
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-3">
              <Label className="text-xs font-semibold">Rentang Tanggal</Label>
              <CalendarInput
                mode="range"
                selected={selectedDateRange}
                onSelect={handleDateRangeSelect}
                required={false}
                className="border border-border/40 rounded-xl p-2 bg-background/50 self-center"
              />
              {selectedDateRange?.from && (
                <p className="text-xs font-semibold text-center text-primary mt-2">
                  {formatDateIdStandard(selectedDateRange.from, true)}{" "}
                  {selectedDateRange.to &&
                    ` s/d ${formatDateIdStandard(selectedDateRange.to, true)}`}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="grid grid-cols-3 gap-2">
            <DialogClose asChild>
              <Button
                variant="secondary"
                className="cursor-pointer text-xs h-9"
              >
                Tutup
              </Button>
            </DialogClose>
            <Button
              variant="outline"
              onClick={handleFilterClear}
              className="cursor-pointer text-xs h-9"
            >
              Clear
            </Button>
            <Button
              onClick={handleFilterApply}
              className="cursor-pointer text-xs h-9"
            >
              Terapkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
