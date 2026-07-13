import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronLeft,
  Copy,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { AGGREGATOR_URL } from "@/constants/api-url.cont";
import { useWebSocket } from "@/hooks/use-websocket";
import {
  connectIMAP,
  connectResend,
  getEmailById,
  initializeConnection,
} from "@/services/email.service";

const getSanitizedEmail = (emailStr: string) => {
  return emailStr.toLowerCase().replace(/[.@]/g, "_");
};

export const Route = createFileRoute("/_dashboard/email/connect/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();

  const { data: email, isLoading: isFetchEmailLoading } = useQuery({
    queryKey: ["email", id],
    queryFn: ({ signal }) => getEmailById(id, signal),
  });

  // State
  const [step, setStep] = useState<number>(1);
  const [provider, setProvider] = useState<
    "gmail" | "outlook" | "imap" | "resend" | null
  >(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "connecting" | "success" | "failed"
  >("idle");
  const [connectionError, setConnectionError] = useState<string>("");

  // IMAP form state
  const [imapHost, setImapHost] = useState("");
  const [imapPort, setImapPort] = useState("993");
  const [imapSecurity, setImapSecurity] = useState<"ssl" | "starttls" | "none">(
    "ssl",
  );
  const [imapPassword, setImapPassword] = useState("");
  const [isImapSubmitting, setIsImapSubmitting] = useState(false);

  // Resend form state
  const [resendApiKey, setResendApiKey] = useState("");
  const [resendWebhookSecret, setResendWebhookSecret] = useState("");
  const [isResendSubmitting, setIsResendSubmitting] = useState(false);

  const { subscribe } = useWebSocket();

  // 1. Auto-Initialize Connection if missing email_account_id
  const initializeMutation = useMutation({
    mutationFn: () => initializeConnection(id),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["email", id] });
      queryClient.invalidateQueries({ queryKey: ["email"] });
    },
    onError: (error) => {
      toast.error(`Gagal menyiapkan koneksi: ${error.message}`);
    },
  });

  useEffect(() => {
    if (
      email &&
      !email.email_account_id &&
      !initializeMutation.isPending &&
      !initializeMutation.isSuccess &&
      !initializeMutation.isError
    ) {
      initializeMutation.mutate();
    }
  }, [email, initializeMutation]);

  // 2. Pre-select provider if account has already been connected/started connect flow
  useEffect(() => {
    if (email?.provider) {
      setProvider(email.provider as "gmail" | "outlook" | "imap" | "resend");
      setStep(2);
      if (email.provider !== "imap" && email.provider !== "resend") {
        setConnectionStatus("connecting");
      }
    }
  }, [email]);

  // 3. Handle default IMAP ports based on security type
  useEffect(() => {
    if (imapSecurity === "ssl") {
      setImapPort("993");
    } else {
      setImapPort("143");
    }
  }, [imapSecurity]);

  // 4. WebSocket Listener for success event (Gmail/Outlook)
  useEffect(() => {
    if (
      !email ||
      !email.email_account_id ||
      (provider !== "gmail" && provider !== "outlook")
    )
      return;

    const eventName = `${getSanitizedEmail(email.email)}:connection-success`;
    const unsubscribe = subscribe(eventName, (data) => {
      console.log("WebSocket event connection success:", data);
      toast.success(`Email ${email.email} berhasil terhubung!`);
      queryClient.invalidateQueries({ queryKey: ["email", id] });
      queryClient.invalidateQueries({ queryKey: ["email"] });
      setConnectionStatus("success");
    });

    return () => {
      unsubscribe();
    };
  }, [email, provider, subscribe, queryClient, id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Tautan disalin ke clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImapConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.email_account_id) return;

    setIsImapSubmitting(true);
    setConnectionStatus("connecting");
    setConnectionError("");

    try {
      await connectIMAP({
        email_account_id: email.email_account_id,
        host: imapHost,
        port: parseInt(imapPort, 10),
        username: email.email,
        password: imapPassword,
        security: imapSecurity,
      });

      setConnectionStatus("success");
      toast.success("Koneksi IMAP berhasil terhubung!");
      queryClient.invalidateQueries({ queryKey: ["email", id] });
      queryClient.invalidateQueries({ queryKey: ["email"] });
    } catch (err: any) {
      console.error("IMAP connection error:", err);
      setConnectionStatus("failed");
      setConnectionError(err.message || "Gagal menghubungkan ke server IMAP");
    } finally {
      setIsImapSubmitting(false);
    }
  };

  const handleResendConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.email_account_id) return;

    setIsResendSubmitting(true);
    setConnectionStatus("connecting");
    setConnectionError("");

    try {
      await connectResend({
        email_account_id: email.email_account_id,
        api_key: resendApiKey,
        webhook_secret: resendWebhookSecret,
      });

      setConnectionStatus("success");
      toast.success("Koneksi Resend berhasil terhubung!");
      queryClient.invalidateQueries({ queryKey: ["email", id] });
      queryClient.invalidateQueries({ queryKey: ["email"] });
    } catch (err: any) {
      console.error("Resend connection error:", err);
      setConnectionStatus("failed");
      setConnectionError(err.message || "Gagal menghubungkan Resend");
    } finally {
      setIsResendSubmitting(false);
    }
  };

  const isLoading = isFetchEmailLoading || initializeMutation.isPending;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" asChild className="shrink-0">
          <Link to="/email">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Hubungkan ke Agregator
          </h1>
          <p className="text-xs text-muted-foreground">
            {isLoading
              ? "Menyiapkan sesi koneksi..."
              : `Atur rute email masuk untuk alamat ${email?.email}`}
          </p>
        </div>
      </div>

      <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            {step === 1
              ? "Pilih Provider"
              : `Konfigurasi ${provider === "gmail" ? "Gmail" : provider === "outlook" ? "Outlook" : provider === "resend" ? "Resend" : "IMAP"}`}
          </CardTitle>
          <CardDescription className="text-xs">
            {step === 1
              ? "Pilih platform email yang digunakan oleh akun Anda."
              : connectionStatus === "success"
                ? "Koneksi berhasil terjalin."
                : provider === "imap"
                  ? "Lengkapi detail konfigurasi koneksi server IMAP."
                  : provider === "resend"
                    ? "Masukkan kredensial API dan Webhook Resend Anda."
                    : "Gunakan tautan di bawah ini untuk memberikan izin akses agregator."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-4 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : !email ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Data email tidak ditemukan.
            </div>
          ) : connectionStatus === "success" ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center animate-in zoom-in duration-300">
              <CheckCircle2 className="size-12 text-emerald-500" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-emerald-500">
                  Koneksi Berhasil!
                </p>
                <p className="text-xs text-muted-foreground max-w-[360px] leading-relaxed">
                  Email{" "}
                  <span className="font-semibold text-foreground">
                    {email.email}
                  </span>{" "}
                  sekarang aktif terhubung ke aggregator dan siap memproses
                  email secara real-time.
                </p>
              </div>
              <Button asChild size="sm" className="mt-2">
                <Link to="/email">Kembali ke Daftar Email</Link>
              </Button>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProvider("gmail");
                      setStep(2);
                      setConnectionStatus("connecting");
                    }}
                    className="flex flex-col items-center justify-center p-6 border border-border/40 hover:border-primary/50 hover:bg-primary/5 rounded-xl transition-all gap-3 group cursor-pointer"
                  >
                    <div className="size-12 flex items-center justify-center bg-rose-500/10 text-rose-500 rounded-lg group-hover:scale-105 transition-transform font-bold text-base">
                      G
                    </div>
                    <span className="text-xs font-semibold">Gmail</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProvider("outlook");
                      setStep(2);
                      setConnectionStatus("connecting");
                    }}
                    className="flex flex-col items-center justify-center p-6 border border-border/40 hover:border-primary/50 hover:bg-primary/5 rounded-xl transition-all gap-3 group cursor-pointer"
                  >
                    <div className="size-12 flex items-center justify-center bg-blue-500/10 text-blue-500 rounded-lg group-hover:scale-105 transition-transform font-bold text-base">
                      O
                    </div>
                    <span className="text-xs font-semibold">Outlook</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProvider("imap");
                      setStep(2);
                      setConnectionStatus("idle");
                    }}
                    className="flex flex-col items-center justify-center p-6 border border-border/40 hover:border-primary/50 hover:bg-primary/5 rounded-xl transition-all gap-3 group cursor-pointer"
                  >
                    <div className="size-12 flex items-center justify-center bg-slate-500/10 text-slate-500 rounded-lg group-hover:scale-105 transition-transform font-bold text-base">
                      IMAP
                    </div>
                    <span className="text-xs font-semibold">IMAP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProvider("resend");
                      setStep(2);
                      setConnectionStatus("idle");
                    }}
                    className="flex flex-col items-center justify-center p-6 border border-border/40 hover:border-primary/50 hover:bg-primary/5 rounded-xl transition-all gap-3 group cursor-pointer"
                  >
                    <div className="size-12 flex items-center justify-center bg-teal-500/10 text-teal-500 rounded-lg group-hover:scale-105 transition-transform font-bold text-base">
                      R
                    </div>
                    <span className="text-xs font-semibold">Resend</span>
                  </button>
                </div>
              )}

              {step === 2 && provider !== "imap" && provider !== "resend" && (
                <div className="space-y-5 py-2 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">
                      Tautan Otorisasi (
                      {provider === "gmail" ? "Google" : "Microsoft"})
                    </Label>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Salin tautan di bawah ini atau klik tombol "Otorisasi"
                      untuk membuka halaman konfirmasi akses pada profil browser
                      tempat akun email Anda masuk.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={`${AGGREGATOR_URL}/oauth/${provider}/connect?email_id=${email.email_account_id || ""}`}
                        className="flex-1 h-9 text-[10px] bg-muted/30 border-border/40 font-mono"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          copyToClipboard(
                            `${AGGREGATOR_URL}/oauth/${provider}/connect?email_id=${email.email_account_id || ""}`,
                          )
                        }
                        className="h-9 shrink-0 gap-1"
                      >
                        {copied ? (
                          <Check className="size-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                        {copied ? "Tersalin" : "Salin"}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center p-6 border border-dashed border-border/40 rounded-xl bg-muted/5 space-y-3">
                    <RefreshCw className="size-8 text-primary animate-spin" />
                    <div className="space-y-1 text-center">
                      <p className="text-xs font-semibold text-foreground">
                        Menunggu Otorisasi Agregator...
                      </p>
                      <p className="text-[10px] text-muted-foreground max-w-[320px] leading-relaxed">
                        Sistem sedang mendengarkan status koneksi baru Anda
                        secara real-time. Halaman ini akan otomatis berganti
                        begitu Anda menyelesaikan otorisasi.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-3 pt-3 border-t border-border/30">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStep(1);
                        setProvider(null);
                        setConnectionStatus("idle");
                      }}
                    >
                      Pilih Provider Lain
                    </Button>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `${AGGREGATOR_URL}/oauth/${provider}/connect?email_id=${email.email_account_id || ""}`,
                          "_blank",
                        )
                      }
                      className="gap-1.5 cursor-pointer shadow-sm"
                    >
                      Otorisasi Sekarang
                      <ExternalLink className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && provider === "imap" && (
                <>
                  {connectionStatus === "connecting" && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center animate-in fade-in duration-300">
                      <RefreshCw className="size-10 text-primary animate-spin" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">
                          Menguji Koneksi IMAP...
                        </p>
                        <p className="text-xs text-muted-foreground max-w-[320px]">
                          Sedang melakukan handshaking SSL/TLS, mencoba login ke
                          server IMAP, dan memverifikasi kemampuan IDLE.
                        </p>
                      </div>
                    </div>
                  )}

                  {connectionStatus === "failed" && (
                    <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center animate-in zoom-in duration-300">
                      <AlertCircle className="size-12 text-rose-500" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-rose-500">
                          Koneksi IMAP Gagal
                        </p>
                        <p className="text-xs text-rose-500/80 bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg max-w-[360px] font-mono text-[10px] break-all leading-normal text-left">
                          {connectionError}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setConnectionStatus("idle")}
                        className="mt-2 cursor-pointer"
                      >
                        Coba Konfigurasi Ulang
                      </Button>
                    </div>
                  )}

                  {connectionStatus === "idle" && (
                    <form
                      onSubmit={handleImapConnect}
                      className="space-y-4 py-2 animate-in fade-in duration-300"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2">
                          <Label htmlFor="imap-email" className="text-xs">
                            Email (Username)
                          </Label>
                          <Input
                            id="imap-email"
                            readOnly
                            value={email.email}
                            className="h-9 text-xs bg-muted/40 font-mono"
                          />
                        </div>

                        <div className="space-y-1.5 col-span-2">
                          <Label htmlFor="imap-host" className="text-xs">
                            Server Host IMAP
                          </Label>
                          <Input
                            id="imap-host"
                            required
                            placeholder="contoh: imap.gmail.com atau mail.domain.com"
                            value={imapHost}
                            onChange={(e) => setImapHost(e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="imap-security" className="text-xs">
                            Security Protocol
                          </Label>
                          <Select
                            value={imapSecurity}
                            onValueChange={(val: any) => setImapSecurity(val)}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Security" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ssl" className="text-xs">
                                SSL/TLS (Port 993)
                              </SelectItem>
                              <SelectItem value="starttls" className="text-xs">
                                STARTTLS (Port 143)
                              </SelectItem>
                              <SelectItem value="none" className="text-xs">
                                None (Port 143)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="imap-port" className="text-xs">
                            Port Server
                          </Label>
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
                          <Label htmlFor="imap-password" className="text-xs">
                            Password / Sandi Aplikasi
                          </Label>
                          <Input
                            id="imap-password"
                            required
                            type="password"
                            placeholder="Masukkan kata sandi email atau sandi aplikasi"
                            value={imapPassword}
                            onChange={(e) => setImapPassword(e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center gap-3 pt-3 border-t border-border/30">
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
                          disabled={isImapSubmitting}
                          className="gap-1.5 cursor-pointer shadow-sm"
                        >
                          Test & Hubungkan
                        </Button>
                      </div>
                    </form>
                  )}
                </>
              )}

              {step === 2 && provider === "resend" && (
                <>
                  {connectionStatus === "connecting" && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center animate-in fade-in duration-300">
                      <RefreshCw className="size-10 text-primary animate-spin" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">
                          Menguji Kredensial Resend...
                        </p>
                        <p className="text-xs text-muted-foreground max-w-[320px]">
                          Sedang melakukan validasi API Key dengan menghubungi
                          server Resend.
                        </p>
                      </div>
                    </div>
                  )}

                  {connectionStatus === "failed" && (
                    <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center animate-in zoom-in duration-300">
                      <AlertCircle className="size-12 text-rose-500" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-rose-500">
                          Koneksi Resend Gagal
                        </p>
                        <p className="text-xs text-rose-500/80 bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg max-w-[360px] font-mono text-[10px] break-all leading-normal text-left">
                          {connectionError}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setConnectionStatus("idle")}
                        className="mt-2 cursor-pointer"
                      >
                        Coba Lagi
                      </Button>
                    </div>
                  )}

                  {connectionStatus === "idle" && (
                    <form
                      onSubmit={handleResendConnect}
                      className="space-y-4 py-2 animate-in fade-in duration-300"
                    >
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="resend-email" className="text-xs">
                            Email / Domain
                          </Label>
                          <Input
                            id="resend-email"
                            readOnly
                            value={email.email}
                            className="h-9 text-xs bg-muted/40 font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="resend-api-key" className="text-xs">
                            Resend API Key
                          </Label>
                          <Input
                            id="resend-api-key"
                            required
                            type="password"
                            placeholder="re_xxxxxxxxx"
                            value={resendApiKey}
                            onChange={(e) => setResendApiKey(e.target.value)}
                            className="h-9 text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label
                            htmlFor="resend-webhook-secret"
                            className="text-xs"
                          >
                            Webhook Signing Secret (Svix)
                          </Label>
                          <Input
                            id="resend-webhook-secret"
                            required
                            type="password"
                            placeholder="whsec_..."
                            value={resendWebhookSecret}
                            onChange={(e) =>
                              setResendWebhookSecret(e.target.value)
                            }
                            className="h-9 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center gap-3 pt-3 border-t border-border/30">
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
                          disabled={isResendSubmitting}
                          className="gap-1.5 cursor-pointer shadow-sm"
                        >
                          Verifikasi & Hubungkan
                        </Button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
