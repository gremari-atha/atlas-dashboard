import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EllipsisVertical, Plus, SquarePen, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { NoData } from "@/components/custom/no-data";
import { Pagination } from "@/components/custom/pagination";
import { PasswordText } from "@/components/custom/password-text";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGlobalAlertDialog } from "@/context-providers/alert-dialog.provider";
import type { Email, EmailFilter } from "@/services/email.service";
import {
  deleteEmail,
  GetEmailsParamsSchema,
  getAllEmail,
} from "@/services/email.service";
import type { OrderByDirection } from "@/types/order-by.type";

export const Route = createFileRoute("/_dashboard/email/")({
  component: RouteComponent,
  validateSearch: GetEmailsParamsSchema,
});

function RouteComponent() {
  const searchParam = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const { showAlertDialog, hideAlertDialog } = useGlobalAlertDialog();

  const [filter, setFilter] = useState<EmailFilter>({
    email: searchParam.email ?? "",
  });
  const [searchValue, setSearchValue] = useState(searchParam.email ?? "");
  const [sort, setSort] = useState<string>(
    searchParam.order_by && searchParam.order_direction
      ? `${searchParam.order_by}:${searchParam.order_direction}`
      : "default",
  );

  useEffect(() => {
    setSearchValue(searchParam.email ?? "");
    setFilter({ email: searchParam.email ?? "" });
  }, [searchParam.email]);

  const { data: emails, isLoading: isFetchEmailLoading } = useQuery({
    queryKey: ["email", searchParam],
    queryFn: ({ signal }) => getAllEmail({ ...searchParam, signal }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email"] });
      toast.success("Email berhasil dihapus.");
    },
    onError: (error) => {
      toast.error(`Gagal menghapus email: ${error.message}`);
    },
    onSettled: () => {
      hideAlertDialog();
    },
  });

  const handleDeleteEmail = (email: Email) => {
    showAlertDialog({
      title: "Yakin ingin menghapus Email?",
      description: (
        <span>
          Aksi ini tidak dapat dibatalkan. Ini akan menghapus email{" "}
          <span className="font-bold text-foreground">{email.email}</span>{" "}
          secara permanen.
        </span>
      ),
      confirmText: "Hapus",
      isConfirming: deleteMutation.isPending,
      onConfirm: () => deleteMutation.mutate(email.id),
    });
  };

  const handleSearchEmail = useDebouncedCallback((value: string) => {
    setFilter({ ...filter, email: value });
    const email = value || undefined;
    navigate({
      search: (prev) => ({ ...prev, email, page: 1 }),
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
      search: (prev) => ({
        ...prev,
        page,
      }),
      replace: true,
    });
  };

  // Helper untuk hitung nomor baris
  const getRowNumber = (index: number) => {
    const page = searchParam.page || 1;
    const limit = 10; // Default limit API is 10
    return (page - 1) * limit + index + 1;
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Email
          </h1>
          <p className="text-xs text-muted-foreground">
            Kelola daftar email dan password yang digunakan di sistem.
          </p>
        </div>
        <Button asChild size="sm" className="w-full sm:w-auto shadow-sm">
          <Link to="/email/create">
            <Plus className="size-4 mr-1.5" />
            Buat Email
          </Link>
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card/40 border border-border/40 p-4 rounded-xl backdrop-blur-md">
        <Input
          type="text"
          value={searchValue}
          placeholder="Cari Email..."
          onChange={(e) => {
            setSearchValue(e.target.value);
            handleSearchEmail(e.target.value);
          }}
          className="flex-1 h-9 text-xs"
        />
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Urutkan:
          </span>
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs font-medium">
              <SelectValue placeholder="Urutan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default" className="text-xs">
                Default
              </SelectItem>
              <SelectItem value="email:asc" className="text-xs">
                Email A-Z
              </SelectItem>
              <SelectItem value="email:desc" className="text-xs">
                Email Z-A
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Container */}
      <Card className="border-border/40 shadow-sm overflow-hidden bg-card/60 backdrop-blur-md">
        <CardHeader className="pb-3 border-b border-border/30">
          <CardTitle className="text-sm font-semibold">Daftar Email</CardTitle>
          <CardDescription className="text-xs">
            Menampilkan total {emails?.paginationData.totalItems ?? 0} email
            terdaftar.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isFetchEmailLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : emails?.items?.length ? (
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[80px] text-center font-bold text-xs">
                    No
                  </TableHead>
                  <TableHead className="font-bold text-xs">
                    Alamat Email
                  </TableHead>
                  <TableHead className="w-[200px] font-bold text-xs">
                    Password
                  </TableHead>
                  <TableHead className="w-[100px] text-center font-bold text-xs">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emails.items.map((email, idx) => (
                  <TableRow
                    key={email.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="text-center font-medium text-xs py-3">
                      {getRowNumber(idx)}
                    </TableCell>
                    <TableCell className="font-semibold text-xs py-3 text-foreground/80">
                      {email.email}
                    </TableCell>
                    <TableCell className="py-3">
                      {email.password ? (
                        <PasswordText className="text-muted-foreground hover:text-foreground">
                          {email.password}
                        </PasswordText>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic">
                          Tidak ada password
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer"
                          >
                            <EllipsisVertical className="size-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem
                            onSelect={() =>
                              navigate({
                                to: "/email/$id",
                                params: { id: email.id },
                              })
                            }
                            className="gap-2 text-xs"
                          >
                            <SquarePen className="size-3.5" />
                            Ubah
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => handleDeleteEmail(email)}
                            className="gap-2 text-destructive focus:bg-destructive/5 focus:text-destructive text-xs"
                          >
                            <Trash2 className="size-3.5" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-6">
              <NoData>Email tidak ditemukan</NoData>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!!emails && emails.paginationData.totalPage > 1 && (
        <div className="flex items-center justify-center py-2">
          <Pagination
            currentPage={emails.paginationData.currentPage}
            totalPages={emails.paginationData.totalPage}
            onPageChange={handlePaginationChange}
          />
        </div>
      )}
    </div>
  );
}
