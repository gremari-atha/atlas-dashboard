import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Copy, Key, Mail, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { NoData } from "@/components/custom/no-data";
import { Pagination } from "@/components/custom/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateIdStandard } from "@/lib/time-converter";
import type { EmailMessageFilter } from "@/services/email-message.service";
import {
  GetEmailMessageParamsSchema,
  getEmailMessages,
} from "@/services/email-message.service";

export const Route = createFileRoute("/_dashboard/email-message/")({
  component: RouteComponent,
  validateSearch: GetEmailMessageParamsSchema,
});

function RouteComponent() {
  const searchParam = Route.useSearch();
  const navigate = Route.useNavigate();

  const [filter, setFilter] = useState<EmailMessageFilter>({
    from_email: searchParam.from_email || "",
  });

  const { data: emailMessages, isLoading: isFetchEmailMessagesLoading } =
    useQuery({
      queryKey: ["email-message", searchParam],
      queryFn: ({ signal }) => getEmailMessages({ ...searchParam, signal }),
    });

  const handleSearchFromEmail = useDebouncedCallback((value: string) => {
    setFilter({ from_email: value });
    const from_email = value || undefined;
    navigate({
      search: (prev) => ({
        ...prev,
        from_email,
        page: 1,
      }),
      replace: true,
    });
  }, 500);

  const handlePaginationChange = (page: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page,
      }),
      replace: true,
    });
  };

  const handleCopyParsedData = (parsedData: string) => {
    navigator.clipboard
      .writeText(parsedData)
      .then(() => {
        toast.success("Parsed data berhasil disalin");
      })
      .catch(() => {
        toast.error("Parsed data gagal disalin");
      });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Email Message
        </h1>
        <p className="text-sm text-muted-foreground">
          Log pesan masuk yang diterima untuk verifikasi OTP dan ekstraksi data
          sewa akun.
        </p>
      </div>

      <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              defaultValue={filter.from_email}
              placeholder="Cari Email Pengirim..."
              className="pl-9 w-full bg-background/50"
              onChange={(e) => handleSearchFromEmail(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border/40 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden">
        {isFetchEmailMessagesLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : emailMessages?.items?.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Pengirim
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Subject
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Hasil Ekstraksi (OTP / Link)
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Waktu Email
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailMessages.items.map((emailMessage) => (
                  <TableRow
                    key={emailMessage.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="font-medium text-xs text-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="size-3.5 text-muted-foreground shrink-0" />
                        <span
                          className="truncate max-w-[180px]"
                          title={emailMessage.from_email}
                        >
                          {emailMessage.from_email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell
                      className="text-xs text-muted-foreground max-w-xs truncate"
                      title={emailMessage.subject}
                    >
                      {emailMessage.subject}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 max-w-xs">
                        <Key className="size-3.5 text-primary shrink-0" />
                        <span
                          className="font-mono font-bold text-xs text-foreground truncate"
                          title={emailMessage.parsed_data}
                        >
                          {emailMessage.parsed_data}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-muted-foreground" />
                        <span>
                          {formatDateIdStandard(emailMessage.email_date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleCopyParsedData(emailMessage.parsed_data)
                        }
                        className="size-8 cursor-pointer hover:bg-muted"
                        title="Salin Hasil Ekstraksi"
                      >
                        <Copy className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-12">
            <NoData>Email message tidak ditemukan</NoData>
          </div>
        )}
      </div>

      {!!emailMessages && emailMessages.paginationData.totalPage > 1 && (
        <div className="flex items-center justify-center mt-4">
          <Pagination
            currentPage={emailMessages.paginationData.currentPage}
            totalPages={emailMessages.paginationData.totalPage}
            onPageChange={handlePaginationChange}
          />
        </div>
      )}
    </div>
  );
}
