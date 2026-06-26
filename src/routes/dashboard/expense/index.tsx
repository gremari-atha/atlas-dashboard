import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { NoData } from "@/components/custom/no-data";
import { Pagination } from "@/components/custom/pagination";
import { Button } from "@/components/ui/button";
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
import { formatDateIdStandard } from "@/lib/time-converter";
import type { Expense } from "@/services/expense.service";
import {
  deleteExpense,
  GetExpensesParamsSchema,
  getAllExpense,
} from "@/services/expense.service";

export const Route = createFileRoute("/dashboard/expense/")({
  component: RouteComponent,
  validateSearch: GetExpensesParamsSchema,
});

function RouteComponent() {
  const searchParam = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const { showAlertDialog, hideAlertDialog } = useGlobalAlertDialog();

  // Force type = global in query
  const querySearchParam = {
    ...searchParam,
    type: "global",
  };

  const { data: expenses, isLoading: isFetchExpensesLoading } = useQuery({
    queryKey: ["expense", querySearchParam],
    queryFn: ({ signal }) => getAllExpense({ ...querySearchParam, signal }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense"] });
      // Invalidate dashboard statistics too since expenses affect income/overview
      queryClient.invalidateQueries({ queryKey: ["statistic"] });
      toast.success("Pengeluaran global berhasil dihapus.");
    },
    onError: (error) => {
      toast.error(`Gagal menghapus pengeluaran: ${error.message}`);
    },
    onSettled: () => {
      hideAlertDialog();
    },
  });

  const handleDeleteExpense = (expense: Expense) => {
    showAlertDialog({
      title: "Yakin ingin menghapus Pengeluaran?",
      description: (
        <>
          Aksi tidak dapat dibatalkan. Ini akan menghapus pengeluaran sebesar{" "}
          <span className="font-bold text-foreground">
            {formatRupiah(Number.parseInt(expense.amount, 10))}
          </span>{" "}
          secara permanen.
        </>
      ),
      confirmText: "Hapus",
      isConfirming: deleteMutation.isPending,
      onConfirm: () => deleteMutation.mutate(expense.id),
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

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Pengeluaran Global
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola data pengeluaran operasional umum atau global yang tidak
            terikat pada akun sewa tertentu.
          </p>
        </div>
        <Button asChild className="shadow-sm">
          <Link to="/dashboard/expense/create">
            <Plus className="mr-2 size-4" />
            Catat Pengeluaran
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border/40 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden">
        {isFetchExpensesLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : expenses?.items.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Tanggal
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Jumlah
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Catatan
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.items.map((expense) => (
                  <TableRow
                    key={expense.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="text-xs font-medium text-foreground">
                      <div className="flex gap-2 items-center">
                        <Calendar className="size-3.5 text-muted-foreground" />
                        <span>{formatDateIdStandard(expense.created_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-destructive">
                      {formatRupiah(Number.parseInt(expense.amount, 10))}
                    </TableCell>
                    <TableCell
                      className="text-xs text-muted-foreground max-w-md truncate"
                      title={expense.note}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="size-3.5 text-muted-foreground shrink-0" />
                        <span>{expense.note || "— Tanpa Catatan —"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExpense(expense)}
                        className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="size-3.5 mr-1" />
                        Hapus
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-12">
            <NoData>Belum ada pengeluaran global yang dicatat</NoData>
          </div>
        )}
      </div>

      {!!expenses && expenses.paginationData.totalPage > 1 && (
        <div className="flex items-center justify-center mt-4">
          <Pagination
            currentPage={expenses.paginationData.currentPage}
            totalPages={expenses.paginationData.totalPage}
            onPageChange={handlePaginationChange}
          />
        </div>
      )}
    </div>
  );
}
