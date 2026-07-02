import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpDown,
  Plus,
  Search,
  SlidersHorizontal,
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
import type { EmailSubject } from "@/services/email-subject.service";
import {
  deleteEmailSubject,
  GetEmailSubjectsParamsSchema,
  getAllEmailSubject,
} from "@/services/email-subject.service";
import type { OrderByDirection } from "@/types/order-by.type";

export const Route = createFileRoute("/_dashboard/email-subject/")({
  component: RouteComponent,
  validateSearch: GetEmailSubjectsParamsSchema,
});

function RouteComponent() {
  const searchParam = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const { showAlertDialog, hideAlertDialog } = useGlobalAlertDialog();

  const [sort, setSort] = useState<string>(
    !!searchParam.order_by && !!searchParam.order_direction
      ? `${searchParam.order_by}:${searchParam.order_direction}`
      : "default",
  );

  const { data: emailSubjects, isLoading: isFetchEmailSubjectLoading } =
    useQuery({
      queryKey: ["email-subject", searchParam],
      queryFn: ({ signal }) => getAllEmailSubject({ ...searchParam, signal }),
    });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEmailSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-subject"] });
      toast.success("Email Subject berhasil dihapus.");
    },
    onError: (error) => {
      toast.error(`Gagal menghapus email subject: ${error.message}`);
    },
    onSettled: () => {
      hideAlertDialog();
    },
  });

  const handleDeleteEmailSubject = (emailSubject: EmailSubject) => {
    showAlertDialog({
      title: "Yakin ingin menghapus Email Subject?",
      description: (
        <>
          Aksi tidak dapat dibatalkan. Ini akan menghapus email subject{" "}
          <span className="font-bold text-foreground">
            {emailSubject.subject}
          </span>{" "}
          secara permanen.
        </>
      ),
      confirmText: "Hapus",
      isConfirming: deleteMutation.isPending,
      onConfirm: () => deleteMutation.mutate(emailSubject.id),
    });
  };

  const handleSearchSubject = useDebouncedCallback((value: string) => {
    const subject = value || undefined;
    navigate({
      search: (prev) => ({ ...prev, subject, page: 1 }),
      replace: true,
    });
  }, 500);

  const handleContextChange = (value: string) => {
    const context = value === "all" ? undefined : value;
    navigate({
      search: (prev) => ({ ...prev, context, page: 1 }),
      replace: true,
    });
  };

  const handleClearFilter = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        subject: undefined,
        context: undefined,
        page: 1,
      }),
      replace: true,
    });
  };

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
            Email Subject
          </h1>
          <p className="text-sm text-muted-foreground">
            Konfigurasi template subjek email untuk ekstraksi kode OTP dan link
            verifikasi e-commerce.
          </p>
        </div>
        <Button asChild className="shadow-sm">
          <Link to="/email-subject/create">
            <Plus className="mr-2 size-4" />
            Buat Email Subject
          </Link>
        </Button>
      </div>

      <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              key={searchParam.subject ?? ""}
              type="text"
              defaultValue={searchParam.subject ?? ""}
              placeholder="Cari Subject..."
              className="pl-9 w-full bg-background/50"
              onChange={(e) => handleSearchSubject(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 flex-wrap">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <SlidersHorizontal className="size-4 text-muted-foreground hidden sm:inline" />
              <Select
                value={searchParam.context ?? "all"}
                onValueChange={handleContextChange}
              >
                <SelectTrigger className="w-full sm:w-48 bg-background/50">
                  <SelectValue placeholder="Semua Context" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Context</SelectItem>
                  <SelectItem value="NETFLIX_SIGNIN_OTP">
                    NETFLIX_SIGNIN_OTP
                  </SelectItem>
                  <SelectItem value="NETFLIX_REQ_RESET_PASSWORD">
                    NETFLIX_REQ_RESET_PASSWORD
                  </SelectItem>
                  <SelectItem value="NETFLIX_TRAVEL_OTP">
                    NETFLIX_TRAVEL_OTP
                  </SelectItem>
                  <SelectItem value="NETFLIX_HOUSE_CHANGE">
                    NETFLIX_HOUSE_CHANGE
                  </SelectItem>
                  <SelectItem value="NETFLIX_VERIFY_EMAIL">
                    NETFLIX_VERIFY_EMAIL
                  </SelectItem>
                  <SelectItem value="NETFLIX_CANCELLATION">
                    NETFLIX_CANCELLATION
                  </SelectItem>
                  <SelectItem value="NETFLIX_MFA">NETFLIX_MFA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={handleClearFilter}
              className="cursor-pointer w-full sm:w-auto bg-background/50"
            >
              Clear
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <ArrowUpDown className="size-4 text-muted-foreground hidden sm:inline" />
              <Select defaultValue={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full sm:w-36 bg-background/50">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Terbaru</SelectItem>
                  <SelectItem value="subject:asc">Subject A-Z</SelectItem>
                  <SelectItem value="subject:desc">Subject Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border/40 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden">
        {isFetchEmailSubjectLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : emailSubjects?.items?.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Subject
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Context
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Extract Method
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailSubjects.items.map((subject) => (
                  <TableRow
                    key={subject.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell
                      className="font-semibold text-xs text-foreground max-w-md truncate"
                      title={subject.subject}
                    >
                      {subject.subject}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="text-[10px] py-0.5 px-2 font-mono"
                      >
                        {subject.context}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0.5 px-2 border-border font-medium"
                      >
                        {subject.extract_method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-8 text-xs"
                        >
                          <Link
                            to="/email-subject/$id"
                            params={{ id: subject.id }}
                          >
                            <SquarePen className="size-3.5 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEmailSubject(subject)}
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
            <NoData>Email Subject tidak ditemukan</NoData>
          </div>
        )}
      </div>

      {!!emailSubjects && emailSubjects.paginationData.totalPage > 1 && (
        <div className="flex items-center justify-center mt-4">
          <Pagination
            currentPage={emailSubjects.paginationData.currentPage}
            totalPages={emailSubjects.paginationData.totalPage}
            onPageChange={handlePaginationChange}
          />
        </div>
      )}
    </div>
  );
}
