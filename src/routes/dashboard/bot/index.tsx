import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Bot,
  Check,
  Copy,
  Eye,
  EyeOff,
  Key,
  Power,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGlobalAlertDialog } from "@/context-providers/alert-dialog.provider";
import { useWebSocket } from "@/hooks/use-websocket";
import { getStoredTenant } from "@/lib/api-client";
import { formatDateIdStandard } from "@/lib/time-converter";
import {
  type ConnectedBot,
  generateBotAPIKey,
  getActiveBots,
  getBotAPIKey,
  sendBotRestart,
  sendBotResume,
  sendBotStandby,
} from "@/services/bot.service";

export const Route = createFileRoute("/dashboard/bot/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { isConnected: isWsConnected, subscribe } = useWebSocket();
  const [bots, setBots] = useState<ConnectedBot[]>([]);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );
  const { showAlertDialog, hideAlertDialog } = useGlobalAlertDialog();
  const tenant = getStoredTenant();
  const tenantId = tenant?.id || "";

  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Load API Key on mount
  useEffect(() => {
    async function loadApiKey() {
      try {
        const res = await getBotAPIKey();
        setApiKey(res.apiKey);
      } catch (_err) {
        toast.error("Gagal memuat API Key bot");
      }
    }
    loadApiKey();
  }, []);

  const handleCopy = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast.success("API Key disalin ke clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateApiKey = async () => {
    try {
      const res = await generateBotAPIKey();
      setApiKey(res.apiKey);
      toast.success("API Key baru berhasil digenerate!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal generate API Key",
      );
    }
  };

  const {
    data: fetchedBots,
    isLoading: isFetchLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["activeBots"],
    queryFn: getActiveBots,
  });

  // Sync initial fetch to local state
  useEffect(() => {
    if (fetchedBots) {
      setBots(fetchedBots);
    }
  }, [fetchedBots]);

  // Subscribe to real-time bot list updates via WebSocket
  useEffect(() => {
    if (!tenantId) return;
    const unsubscribe = subscribe(
      `bot:list-update:${tenantId}`,
      (data: ConnectedBot[]) => {
        setBots(data || []);
      },
    );
    return () => unsubscribe();
  }, [subscribe, tenantId]);

  const handleStandbyToggle = async (bot: ConnectedBot) => {
    const key = `${bot.name}-standby`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      if (bot.status === "ACTIVE") {
        await sendBotStandby(bot.name);
      } else {
        await sendBotResume(bot.name);
      }
      // Re-fetch list (though WS event should also trigger it)
      refetch();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to toggle standby mode",
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleRestart = (botName: string) => {
    showAlertDialog({
      title: "Restart Bot",
      description: (
        <>
          Apakah Anda yakin ingin me-restart bot{" "}
          <span className="font-bold text-foreground">"{botName}"</span>?
        </>
      ),
      confirmText: "Restart",
      onConfirm: async () => {
        const key = `${botName}-restart`;
        setActionLoading((prev) => ({ ...prev, [key]: true }));
        try {
          await sendBotRestart(botName);
          toast.success(`Sinyal restart telah dikirim ke bot "${botName}".`);
          refetch();
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Failed to restart bot",
          );
        } finally {
          setActionLoading((prev) => ({ ...prev, [key]: false }));
          hideAlertDialog();
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bot className="size-6 text-primary" />
            Manajemen BOT
          </h1>
          <p className="text-xs text-muted-foreground">
            Pantau status, kontrol daya, dan konfigurasi bot automasi terhubung.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Badge
            variant="outline"
            className={`text-[10px] font-mono py-1 px-2.5 rounded-md ${
              isWsConnected
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
            }`}
          >
            WebSocket: {isWsConnected ? "CONNECTED" : "DISCONNECTED"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching || isFetchLoading}
            className="shrink-0 cursor-pointer h-9 text-xs ml-auto sm:ml-0"
          >
            <RefreshCw
              className={`size-3.5 mr-1.5 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Bot API Key Configuration Card */}
      <Card className="border-border/40 shadow-sm overflow-hidden bg-card/60 backdrop-blur-md">
        <CardHeader className="pb-3 border-b border-border/30">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Key className="size-4 text-primary" />
            API Key Bot
          </CardTitle>
          <CardDescription className="text-xs">
            Gunakan API key ini untuk mengautentikasi bot Anda dalam file{" "}
            <code className="text-foreground bg-muted/40 px-1 py-0.5 rounded font-mono text-[10px]">
              config.toml
            </code>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex-1 relative flex items-center">
              <input
                type={showApiKey ? "text" : "password"}
                readOnly
                value={apiKey || "Belum ada API Key. Silakan generate baru."}
                className="w-full bg-muted/20 border border-border/40 rounded-md px-3 py-2 text-xs font-mono text-foreground focus:outline-none pr-20"
              />
              {apiKey && (
                <div className="absolute right-2 flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showApiKey ? (
                      <EyeOff className="size-3.5" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {copied ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
                </div>
              )}
            </div>
            <Button
              variant={apiKey ? "outline" : "default"}
              size="sm"
              onClick={handleGenerateApiKey}
              className="text-xs h-9 cursor-pointer"
            >
              {apiKey ? "Generate Ulang" : "Generate API Key"}
            </Button>
          </div>

          {apiKey && (
            <div className="bg-muted/10 border border-border/20 rounded-md p-3 space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block">
                Contoh Konfigurasi config.toml
              </span>
              <pre className="text-[10px] font-mono text-muted-foreground bg-muted/20 p-2 rounded overflow-x-auto">
                {`[api]
api_key = "${apiKey}"`}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {isFetchLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : bots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map((bot) => (
            <Card
              key={bot.name}
              className="border-border/40 shadow-sm overflow-hidden bg-card/60 backdrop-blur-md hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <CardHeader className="pb-3 border-b border-border/30">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Bot className="size-4.5 text-muted-foreground" />
                      {bot.name}
                    </CardTitle>
                    <CardDescription className="text-[10px] font-mono">
                      Konek: {formatDateIdStandard(new Date(bot.connectedAt))}
                    </CardDescription>
                  </div>
                  <Badge
                    className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                      bot.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }`}
                  >
                    {bot.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="py-4 flex-1">
                <div className="text-xs text-muted-foreground space-y-2">
                  <div className="flex justify-between">
                    <span>Proses Manager:</span>
                    <span className="font-semibold text-foreground font-mono text-[11px]">
                      PM2 (ecosystem)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database SQLite:</span>
                    <span className="font-semibold text-foreground font-mono text-[11px]">
                      Auto Vacuum
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 border-t border-border/30 p-4 gap-2 flex flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1 text-xs cursor-pointer h-8.5"
                >
                  <Link
                    to={`/dashboard/bot/$botName`}
                    params={{ botName: bot.name }}
                  >
                    <Eye className="size-3.5 mr-1" />
                    Detail
                  </Link>
                </Button>
                <Button
                  variant={bot.status === "ACTIVE" ? "secondary" : "default"}
                  size="sm"
                  onClick={() => handleStandbyToggle(bot)}
                  disabled={actionLoading[`${bot.name}-standby`]}
                  className="flex-1 text-xs cursor-pointer h-8.5"
                >
                  <Power className="size-3.5 mr-1" />
                  {bot.status === "ACTIVE" ? "Standby" : "Resume"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestart(bot.name)}
                  disabled={actionLoading[`${bot.name}-restart`]}
                  className="w-full text-xs cursor-pointer h-8.5 border-destructive/20 text-destructive hover:bg-destructive/5 hover:border-destructive/40 mt-1 sm:mt-0"
                >
                  <RefreshCw className="size-3.5 mr-1" />
                  Restart Bot
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border/40 shadow-sm overflow-hidden bg-card/60 backdrop-blur-md p-8 text-center flex flex-col items-center gap-4">
          <AlertCircle className="size-12 text-muted-foreground/60" />
          <div>
            <CardTitle className="text-base font-semibold">
              Tidak ada Bot Terhubung
            </CardTitle>
            <CardDescription className="text-xs max-w-sm mx-auto mt-1">
              Bot automasi saat ini tidak ada yang aktif atau terkoneksi dengan
              WebSocket API gateway. Silakan jalankan bot lokal Anda.
            </CardDescription>
          </div>
        </Card>
      )}
    </div>
  );
}
