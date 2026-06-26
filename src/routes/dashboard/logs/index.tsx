import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, RefreshCw } from "lucide-react";
import { useState } from "react";
import { NoData } from "@/components/custom/no-data";
import { Pagination } from "@/components/custom/pagination";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { formatDateIdStandard } from "@/lib/time-converter";
import type { Logs, LogsFilter } from "@/services/logs.service";
import { GetLogsParamsSchema, getLogs } from "@/services/logs.service";

export const Route = createFileRoute("/dashboard/logs/")({
  component: RouteComponent,
  validateSearch: GetLogsParamsSchema,
});

function RouteComponent() {
  const searchParam = Route.useSearch();
  const navigate = Route.useNavigate();

  const [filter, setFilter] = useState<LogsFilter>({
    level: searchParam.level || "",
    context: searchParam.context || "",
  });

  const [dialogLogsDetailOpen, setDialogLogsDetailOpen] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<Logs>();

  const {
    data: logs,
    isLoading: isFetchLogsLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["logs", searchParam],
    queryFn: () => getLogs(searchParam),
  });

  const handleViewLogDetail = (log: Logs) => {
    setSelectedLogs(log);
    setDialogLogsDetailOpen(true);
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
    const f: LogsFilter = {
      level: filter.level || undefined,
      context: filter.context || undefined,
    };
    navigate({
      search: (prev) => ({
        ...prev,
        ...f,
        page: 1,
      }),
      replace: true,
    });
  };

  const handleFilterClear = () => {
    setFilter({
      level: "",
      context: "",
    });
    navigate({
      search: (prev) => ({
        ...prev,
        level: undefined,
        context: undefined,
        page: 1,
      }),
      replace: true,
    });
  };

  const getLogLevelBadgeClass = (level: string) => {
    switch (level?.toUpperCase()) {
      case "ERROR":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "WARN":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "INFO":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "NEED_ACTION":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "REMINDER":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Logs
          </h1>
          <p className="text-xs text-muted-foreground">
            Catatan aktivitas system dan status background jobs.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="w-full sm:w-auto shrink-0 cursor-pointer h-9 text-xs"
        >
          <RefreshCw
            className={`size-3.5 mr-1.5 ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Filter and Clear */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card/40 border border-border/40 p-4 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-2 w-full sm:flex-1">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Level:
          </span>
          <Select
            value={filter.level}
            onValueChange={(v) => setFilter({ ...filter, level: v })}
          >
            <SelectTrigger className="w-full h-9 text-xs">
              <SelectValue placeholder="Pilih filter level..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">
                Semua Level
              </SelectItem>
              <SelectItem value="INFO" className="text-xs">
                INFO
              </SelectItem>
              <SelectItem value="ERROR" className="text-xs">
                ERROR
              </SelectItem>
              <SelectItem value="WARN" className="text-xs">
                WARN
              </SelectItem>
              <SelectItem value="NEED_ACTION" className="text-xs">
                NEED ACTION
              </SelectItem>
              <SelectItem value="REMINDER" className="text-xs">
                REMINDER
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Button
            size="sm"
            onClick={handleFilterApply}
            className="cursor-pointer flex-1 sm:flex-none h-9 text-xs px-4"
          >
            Terapkan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFilterClear}
            className="cursor-pointer flex-1 sm:flex-none h-9 text-xs px-4"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <Card className="border-border/40 shadow-sm overflow-hidden bg-card/60 backdrop-blur-md">
        <CardHeader className="pb-3 border-b border-border/30">
          <CardTitle className="text-sm font-semibold">
            Catatan System
          </CardTitle>
          <CardDescription className="text-xs">
            Menampilkan total {logs?.paginationData.totalItems ?? 0} log yang
            tercatat.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isFetchLogsLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : logs?.items.length ? (
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[120px] font-bold text-xs">
                    Level
                  </TableHead>
                  <TableHead className="w-[180px] font-bold text-xs">
                    Context
                  </TableHead>
                  <TableHead className="font-bold text-xs">Message</TableHead>
                  <TableHead className="w-[200px] font-bold text-xs">
                    Waktu
                  </TableHead>
                  <TableHead className="w-[100px] text-center font-bold text-xs">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.items.map((log) => (
                  <TableRow
                    key={log.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getLogLevelBadgeClass(log.level)}`}
                      >
                        {log.level}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-xs py-3 text-foreground/80">
                      {log.context}
                    </TableCell>
                    <TableCell className="max-w-xs md:max-w-md truncate text-xs py-3 text-muted-foreground font-mono">
                      {log.message}
                    </TableCell>
                    <TableCell className="text-xs py-3 text-muted-foreground font-medium">
                      {formatDateIdStandard(log.created_at)}
                    </TableCell>
                    <TableCell className="text-center py-3">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleViewLogDetail(log)}
                        className="cursor-pointer text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-6">
              <NoData>Logs tidak ditemukan</NoData>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!!logs && logs.paginationData.totalPage > 1 && (
        <div className="flex items-center justify-center py-2">
          <Pagination
            currentPage={logs.paginationData.currentPage}
            totalPages={logs.paginationData.totalPage}
            onPageChange={handlePaginationChange}
          />
        </div>
      )}

      {/* Logs Detail Dialog */}
      <Dialog
        open={dialogLogsDetailOpen}
        onOpenChange={setDialogLogsDetailOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              Detail Log
            </DialogTitle>
          </DialogHeader>
          {selectedLogs ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
                    Level
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border mt-1 ${getLogLevelBadgeClass(selectedLogs.level)}`}
                  >
                    {selectedLogs.level}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
                    Waktu
                  </span>
                  <span className="font-semibold block mt-1.5">
                    {formatDateIdStandard(selectedLogs.created_at)}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
                  Context
                </span>
                <span className="font-semibold font-mono block mt-1 bg-muted p-2 rounded border border-border/40">
                  {selectedLogs.context}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-semibold mb-1">
                  Message
                </span>
                <Textarea
                  value={selectedLogs.message}
                  readOnly
                  className="min-h-36 font-mono text-[11px] leading-relaxed bg-muted/50"
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Tidak ada Log Terpilih
            </p>
          )}
          <DialogFooter className="border-t border-border pt-4">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="w-full cursor-pointer h-9 text-xs"
              >
                Tutup
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
