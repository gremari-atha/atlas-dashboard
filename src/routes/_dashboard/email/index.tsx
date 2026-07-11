import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  EllipsisVertical,
  Plus,
  SquarePen,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
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
  connectIMAP,
  disconnectEmail,
  initializeConnection,
} from "@/services/email.service";
import type { OrderByDirection } from "@/types/order-by.type";
import { useWebSocket } from "@/hooks/use-websocket";
import { AGGREGATOR_URL } from "@/constants/api-url.cont";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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

  // Connection Modal state
  const [emailToConnect, setEmailToConnect] = useState<Email | null>(null);
  const [step, setStep] = useState<number>(1);
  const [provider, setProvider] = useState<"gmail" | "outlook" | "imap" | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "success" | "failed">("connecting");
  const [connectionError, setConnectionError] = useState<string>("");

  // IMAP form state
  const [imapHost, setImapHost] = useState("");
  const [imapPort, setImapPort] = useState("993");
  const [imapSecurity, setImapSecurity] = useState<"ssl" | "starttls" | "none">("ssl");
  const [imapPassword, setImapPassword] = useState("");
  const [isImapSubmitting, setIsImapSubmitting] = useState(false);

  const { subscribe } = useWebSocket();

  const getSanitizedEmail = (emailStr: string) => {
    return emailStr.toLowerCase().replace(/[\.@]/g, "_");
  };

  useEffect(() => {
    setSearchValue(searchParam.email ?? "");
    setFilter({ email: searchParam.email ?? "" });
  }, [searchParam.email]);

  // Handle security port defaults
  useEffect(() => {
    if (imapSecurity === "ssl") {
      setImapPort("993");
    } else {
      setImapPort("143");
    }
  }, [imapSecurity]);

  // WebSocket Subscription for Gmail/Outlook
  useEffect(() => {
    if (!emailToConnect || (provider !== "gmail" && provider !== "outlook")) return;
    
    const eventName = `${getSanitizedEmail(emailToConnect.email)}:connection-success`;
    const unsubscribe = subscribe(eventName, (data) => {
      console.log("WebSocket event connection success:", data);
      toast.success(`Email ${emailToConnect.email} berhasil terhubung!`);
      queryClient.invalidateQueries({ queryKey: ["email"] });
      setConnectionStatus("success");
    });

    return () => {
      unsubscribe();
    };
  }, [emailToConnect, provider, subscribe, queryClient]);

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

  const disconnectMutation = useMutation({
    mutationFn: (id: string) => disconnectEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email"] });
      toast.success("Koneksi email berhasil diputuskan.");
    },
    onError: (error) => {
      toast.error(`Gagal memutuskan koneksi: ${error.message}`);
    },
    onSettled: () => {
      hideAlertDialog();
    },
  });

  const initializeMutation = useMutation({
    mutationFn: (emailId: string) => initializeConnection(emailId),
    onSuccess: (data, emailId) => {
      const selectedEmail = emailsData?.items.find((e) => e.id === emailId);
      if (selectedEmail) {
        setEmailToConnect({
          ...selectedEmail,
          email_account_id: data.email_account_id,
        });
        setStep(1);
      }
    },
    onError: (error) => {
      toast.error(`Gagal menyiapkan koneksi: ${error.message}`);
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

  const handleDisconnectEmail = (email: Email) => {
    showAlertDialog({
      title: "Putuskan Koneksi Email?",
      description: (
        <span>
          Apakah Anda yakin ingin memutuskan koneksi email{" "}
          <span className="font-bold text-foreground">{email.email}</span>{" "}
          dari aggregator?
        </span>
      ),
      confirmText: "Putuskan",
      isConfirming: disconnectMutation.isPending,
      onConfirm: () => disconnectMutation.mutate(email.email_account_id || ""),
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Tautan disalin ke clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImapConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailToConnect) return;

    setIsImapSubmitting(true);
    setStep(3);
    setConnectionStatus("connecting");
    setConnectionError("");

    try {
      await connectIMAP({
        email_account_id: emailToConnect.email_account_id || "",
        host: imapHost,
        port: parseInt(imapPort, 10),
        username: emailToConnect.email,
        password: imapPassword,
        security: imapSecurity,
      });

      setConnectionStatus("success");
      toast.success("IMAP Connection successful!");
      queryClient.invalidateQueries({ queryKey: ["email"] });
    } catch (err: any) {
      console.error("IMAP connection error:", err);
      setConnectionStatus("failed");
      setConnectionError(err.message || "Failed to connect to IMAP server");
      setStep(3);
    } finally {
      setIsImapSubmitting(false);
    }
  };

  const getRowNumber = (index: number) => {
    const page = searchParam.page || 1;
    const limit = 10;
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
                  <TableHead className="w-[60px] text-center font-bold text-xs">
                    No
                  </TableHead>
                  <TableHead className="font-bold text-xs">
                    Alamat Email
                  </TableHead>
                  <TableHead className="w-[150px] font-bold text-xs">
                    Koneksi
                  </TableHead>
                  <TableHead className="w-[200px] font-bold text-xs">
                    Password
                  </TableHead>
                  <TableHead className="w-[180px] text-center font-bold text-xs">
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
                      {email.provider ? (
                        <div className="flex items-center gap-1.5 font-medium text-xs">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              email.status === "ACTIVE"
                                ? "bg-emerald-500 animate-pulse"
                                : "bg-rose-500"
                            }`}
                          />
                          <span className="capitalize">{email.provider}</span>
                          {email.status !== "ACTIVE" && (
                            <span className="text-[10px] text-muted-foreground">
                              ({email.status})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic">
                          Tidak Terkoneksi
                        </span>
                      )}
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
                      <div className="flex items-center justify-center gap-2">
                        {email.provider ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnectEmail(email)}
                            className="h-7 text-[10px] font-semibold border-rose-500/20 hover:border-rose-500 hover:bg-rose-500/5 text-rose-500 transition-colors px-2.5 cursor-pointer"
                          >
                            Putuskan
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={initializeMutation.isPending}
                            onClick={() => {
                              if (email.email_account_id) {
                                setEmailToConnect(email);
                                setStep(1);
                              } else {
                                initializeMutation.mutate(email.id);
                              }
                            }}
                            className="h-7 text-[10px] font-semibold px-2.5 cursor-pointer"
                          >
                            {initializeMutation.isPending && initializeMutation.variables === email.id ? "Loading..." : "Hubungkan"}
                          </Button>
                        )}

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
                      </div>
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

      {/* Connection Setup Modal */}
      <Dialog
        open={emailToConnect !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEmailToConnect(null);
            setStep(1);
            setProvider(null);
            setImapHost("");
            setImapPassword("");
            setImapSecurity("ssl");
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px] text-foreground bg-card/95 backdrop-blur-lg border border-border/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Hubungkan ke Agregator
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Konfigurasikan perutean email masuk dari alamat {emailToConnect?.email} ke sistem aggregator.
            </DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-4 py-2">
              <Label className="text-xs font-semibold">Pilih Provider Email</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setProvider("gmail");
                    setStep(2);
                  }}
                  className="flex flex-col items-center justify-center p-4 border border-border/40 hover:border-primary/50 hover:bg-primary/5 rounded-xl transition-all gap-2 group cursor-pointer"
                >
                  <div className="size-10 flex items-center justify-center bg-rose-500/10 text-rose-500 rounded-lg group-hover:scale-105 transition-transform font-bold text-sm">
                    G
                  </div>
                  <span className="text-xs font-medium">Gmail</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProvider("outlook");
                    setStep(2);
                  }}
                  className="flex flex-col items-center justify-center p-4 border border-border/40 hover:border-primary/50 hover:bg-primary/5 rounded-xl transition-all gap-2 group cursor-pointer"
                >
                  <div className="size-10 flex items-center justify-center bg-blue-500/10 text-blue-500 rounded-lg group-hover:scale-105 transition-transform font-bold text-sm">
                    O
                  </div>
                  <span className="text-xs font-medium">Outlook</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProvider("imap");
                    setStep(2);
                  }}
                  className="flex flex-col items-center justify-center p-4 border border-border/40 hover:border-primary/50 hover:bg-primary/5 rounded-xl transition-all gap-2 group cursor-pointer"
                >
                  <div className="size-10 flex items-center justify-center bg-slate-500/10 text-slate-500 rounded-lg group-hover:scale-105 transition-transform font-bold text-sm">
                    IMAP
                  </div>
                  <span className="text-xs font-medium">IMAP</span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && provider !== "imap" && emailToConnect && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Tautan Otorisasi ({provider === "gmail" ? "Google" : "Microsoft"})</Label>
                <p className="text-[11px] text-muted-foreground font-normal">
                  Salin tautan di bawah ini, buka di profil browser tempat akun email Anda masuk, lalu izinkan akses.
                </p>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={`${AGGREGATOR_URL}/oauth/${provider}/connect?email_id=${emailToConnect.email_account_id || ""}`}
                    className="flex-1 h-9 text-[10px] bg-muted/30 border-border/40"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(`${AGGREGATOR_URL}/oauth/${provider}/connect?email_id=${emailToConnect.email_account_id || ""}`)}
                    className="h-9 shrink-0 gap-1"
                  >
                    {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    {copied ? "Tersalin" : "Salin"}
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep(1);
                    setProvider(null);
                  }}
                >
                  Kembali
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`${AGGREGATOR_URL}/oauth/${provider}/connect?email_id=${emailToConnect.email_account_id || ""}`, "_blank")}
                    className="gap-1.5 cursor-pointer"
                  >
                    Otorisasi
                    <ExternalLink className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setStep(3);
                      setConnectionStatus("connecting");
                    }}
                    className="cursor-pointer"
                  >
                    Lanjut
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && provider === "imap" && emailToConnect && (
            <form onSubmit={handleImapConnect} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="imap-email" className="text-xs">Email (Username)</Label>
                  <Input
                    id="imap-email"
                    readOnly
                    value={emailToConnect.email}
                    className="h-9 text-xs bg-muted/40"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="imap-host" className="text-xs">Server Host</Label>
                  <Input
                    id="imap-host"
                    required
                    placeholder="e.g. imap.mail.yahoo.com"
                    value={imapHost}
                    onChange={(e) => setImapHost(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="imap-security" className="text-xs">Security</Label>
                  <Select
                    value={imapSecurity}
                    onValueChange={(val: any) => setImapSecurity(val)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Security" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ssl" className="text-xs">SSL/TLS (Port 993)</SelectItem>
                      <SelectItem value="starttls" className="text-xs">STARTTLS (Port 143)</SelectItem>
                      <SelectItem value="none" className="text-xs">None (Port 143)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="imap-port" className="text-xs">Port</Label>
                  <Input
                    id="imap-port"
                    required
                    type="number"
                    value={imapPort}
                    onChange={(e) => setImapPort(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="imap-password" className="text-xs">Password / Sandi Aplikasi</Label>
                  <Input
                    id="imap-password"
                    required
                    type="password"
                    placeholder="Masukkan sandi aplikasi IMAP"
                    value={imapPassword}
                    onChange={(e) => setImapPassword(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep(1);
                    setProvider(null);
                  }}
                >
                  Kembali
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="gap-1.5 cursor-pointer"
                  disabled={isImapSubmitting}
                >
                  Test & Hubungkan
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
              {connectionStatus === "connecting" && (
                <>
                  <RefreshCw className="size-10 text-primary animate-spin" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Menghubungkan ke Agregator...</p>
                    <p className="text-xs text-muted-foreground max-w-[320px] font-normal">
                      Menunggu respon otentikasi dari server aggregator dan memverifikasi kapabilitas IDLE.
                    </p>
                  </div>
                  {provider !== "imap" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStep(2)}
                      className="mt-2 text-xs"
                    >
                      Lihat Tautan Otorisasi Lagi
                    </Button>
                  )}
                </>
              )}

              {connectionStatus === "success" && (
                <>
                  <CheckCircle2 className="size-12 text-emerald-500 animate-in zoom-in duration-300" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-emerald-500">Koneksi Berhasil!</p>
                    <p className="text-xs text-muted-foreground max-w-[320px] font-normal">
                      Email {emailToConnect?.email} sekarang aktif terhubung ke aggregator dan siap memproses email secara real-time.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setEmailToConnect(null)}
                    className="mt-2 cursor-pointer"
                  >
                    Selesai
                  </Button>
                </>
              )}

              {connectionStatus === "failed" && (
                <>
                  <AlertCircle className="size-12 text-destructive" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-destructive">Koneksi Gagal</p>
                    <p className="text-xs text-red-500/80 bg-red-500/5 border border-red-500/10 p-3 rounded-lg max-w-[320px] font-mono text-[10px] break-all leading-normal text-left">
                      {connectionError}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStep(1);
                        setProvider(null);
                      }}
                    >
                      Pilih Provider
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setStep(2)}
                      className="cursor-pointer"
                    >
                      Coba Lagi
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
