import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Calendar,
  Copy,
  Eye,
  Key,
  Mail,
  RefreshCw,
  Search,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { NoData } from "@/components/custom/no-data";
import { Pagination } from "@/components/custom/pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  getEmailMessageById,
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

  const [selectedEmailContent, setSelectedEmailContent] = useState<string>("");
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

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

  const handleViewEmail = async (id: string) => {
    setDialogOpen(true);
    setIsDetailLoading(true);
    setSelectedEmailContent("");
    try {
      const detail = await getEmailMessageById(id);
      setSelectedEmailContent(detail.parsed_data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal memuat konten email");
      setDialogOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
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
                          title={
                            emailMessage.extract_method === "RAW"
                              ? "Konten Email Asli"
                              : emailMessage.parsed_data
                          }
                        >
                          {emailMessage.extract_method === "RAW"
                            ? "RAW Email"
                            : emailMessage.parsed_data}
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
                      {emailMessage.extract_method === "RAW" ? (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewEmail(emailMessage.id)}
                          className="size-8 cursor-pointer hover:bg-muted"
                          title="Lihat Konten Email"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                      ) : (
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
                      )}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="md:max-w-4xl max-h-[85vh] flex flex-col p-6 border-border/40 shadow-lg bg-card/95 backdrop-blur-md">
          <DialogHeader className="border-b border-border/40 pb-3">
            <DialogTitle className="text-sm font-semibold text-foreground">
              Konten Asli Email (RAW)
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden py-4 flex flex-col justify-center items-center">
            {isDetailLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <RefreshCw className="size-8 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground">
                  Memuat konten email...
                </p>
              </div>
            ) : (
              (() => {
                const content = selectedEmailContent || "";
                const isHtml =
                  content.trim().startsWith("<") ||
                  content.includes("<html>") ||
                  content.includes("</div>") ||
                  content.includes("<p>");
                return isHtml ? (
                  <iframe
                    srcDoc={content}
                    title="Email Raw HTML"
                    className="w-full h-[60vh] border border-border/40 rounded-lg bg-white"
                    sandbox=""
                  />
                ) : (
                  <pre className="w-full h-[60vh] p-4 font-mono text-[11px] whitespace-pre-wrap overflow-auto border border-border/40 rounded-lg bg-muted/20 text-foreground leading-normal text-left">
                    {content || "(Konten email kosong)"}
                  </pre>
                );
              })()
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
