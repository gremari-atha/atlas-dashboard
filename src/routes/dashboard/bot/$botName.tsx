import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Plus,
  Power,
  RefreshCw,
  Save,
  Settings,
  Terminal,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useGlobalAlertDialog } from "@/context-providers/alert-dialog.provider";
import { useWebSocket } from "@/hooks/use-websocket";
import { getStoredTenant } from "@/lib/api-client";
import { formatDateIdStandard } from "@/lib/time-converter";
import {
  type BotLog,
  getBotLogs,
  sendBotRestart,
  sendBotResume,
  sendBotStandby,
} from "@/services/bot.service";
import type { AppConfig, ModuleConfig } from "@/types/config.type";

export const Route = createFileRoute("/dashboard/bot/$botName")({
  component: RouteComponent,
});

function RouteComponent() {
  const { botName } = Route.useParams();
  const tenant = getStoredTenant();
  const tenantId = tenant?.id || "";

  const { isConnected: isWsConnected, subscribe, send } = useWebSocket();
  const { showAlertDialog, hideAlertDialog } = useGlobalAlertDialog();

  // Logs state
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [logsPage, setLogsPage] = useState(1);
  const [hasMoreLogs, setHasMoreLogs] = useState(true);
  const [isLoadingMoreLogs, setIsLoadingMoreLogs] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Config state
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [botStatus, setBotStatus] = useState<"ACTIVE" | "STANDBY" | "OFFLINE">(
    "OFFLINE",
  );
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );

  // Form states for modules CRUD
  const [moduleEdits, setModuleEdits] = useState<ModuleConfig[]>([]);
  const [newModuleName, setNewModuleName] = useState("");
  const [newModuleType, setNewModuleType] = useState("shopee-order");
  const [newModuleInterval, setNewModuleInterval] = useState(300);

  // Load historical logs page 1 on mount
  useEffect(() => {
    async function loadInitialLogs() {
      try {
        const res = await getBotLogs({ botName, page: 1, limit: 50 });
        const items = (res.items || []).map((l: any, idx: number) => ({
          id: l.id || String(idx),
          bot_name: l.bot_name,
          level: l.level,
          message: l.message,
          created_at: l.created_at,
        }));
        setLogs(items.reverse()); // Reverse so oldest is top
        setHasMoreLogs(
          res.paginationData.currentPage < res.paginationData.totalPage,
        );
      } catch (err) {
        console.error("Failed to load historical logs", err);
      }
    }
    loadInitialLogs();
  }, [botName]);

  // Request bot config over WS on mount and connection
  useEffect(() => {
    if (isWsConnected) {
      send("bot:config-request", { botName });
    }
  }, [isWsConnected, botName, send]);

  // Re-request config when bot changes status from OFFLINE to online and config is missing
  useEffect(() => {
    if (isWsConnected && botStatus !== "OFFLINE" && !config) {
      send("bot:config-request", { botName });
    }
  }, [isWsConnected, botStatus, config, botName, send]);

  // Subscribe to WebSocket events (logs and config sync)
  useEffect(() => {
    // 1. Logs channel
    const logChannel = `bot:logs:${tenantId}:${botName}`;
    const unsubLogs = subscribe(
      logChannel,
      (data: { level: string; message: string; timestamp: string }) => {
        const newLog: BotLog = {
          id: String(Date.now()) + Math.random().toString(),
          bot_name: botName,
          level: data.level,
          message: data.message,
          created_at: data.timestamp,
        };
        setLogs((prev) => [...prev, newLog]);
        setBotStatus("ACTIVE"); // If we get logs, the bot is online/active
      },
    );

    // 2. Config channel
    const configChannel = `bot:config:${tenantId}:${botName}`;
    const unsubConfig = subscribe(
      configChannel,
      (data: { config: AppConfig }) => {
        if (data?.config) {
          setConfig(data.config);
          setModuleEdits(data.config.modules || []);
          // Also update status if info is present
          setBotStatus(data.config.connector?.enabled ? "ACTIVE" : "STANDBY");
        }
      },
    );

    // 3. Bot list update to track standby status
    const unsubList = subscribe(
      `bot:list-update:${tenantId}`,
      (data: any[]) => {
        const self = data.find((b) => b.name === botName);
        if (self) {
          setBotStatus(self.status);
        } else {
          setBotStatus("OFFLINE");
        }
      },
    );

    return () => {
      unsubLogs();
      unsubConfig();
      unsubList();
    };
  }, [subscribe, botName, tenantId]);

  // Auto scroll console to bottom
  useEffect(() => {
    if (autoScroll && consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [autoScroll]);

  // Load older historical logs
  const handleLoadOlderLogs = async () => {
    if (isLoadingMoreLogs) return;
    setIsLoadingMoreLogs(true);
    const nextPage = logsPage + 1;
    try {
      const res = await getBotLogs({ botName, page: nextPage, limit: 50 });
      const items = (res.items || []).map((l: any, idx: number) => ({
        id: l.id || String(idx),
        bot_name: l.bot_name,
        level: l.level,
        message: l.message,
        created_at: l.created_at,
      }));
      if (items.length > 0) {
        setLogs((prev) => [...items.reverse(), ...prev]);
        setLogsPage(nextPage);
        setHasMoreLogs(
          res.paginationData.currentPage < res.paginationData.totalPage,
        );
      } else {
        setHasMoreLogs(false);
      }
    } catch (_err) {
      toast.error("Gagal memuat log lama");
    } finally {
      setIsLoadingMoreLogs(false);
    }
  };

  // Standby and Restart buttons
  const handleStandbyToggle = async () => {
    const key = "standby";
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      if (botStatus === "ACTIVE") {
        await sendBotStandby(botName);
        setBotStatus("STANDBY");
        toast.info(`Bot "${botName}" berhasil di standby.`);
      } else {
        await sendBotResume(botName);
        setBotStatus("ACTIVE");
        toast.success(`Bot "${botName}" berhasil diaktifkan kembali.`);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal mengubah mode bot",
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleRestart = () => {
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
        const key = "restart";
        setActionLoading((prev) => ({ ...prev, [key]: true }));
        try {
          await sendBotRestart(botName);
          toast.success("Sinyal restart telah dikirim ke bot.");
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Gagal me-restart bot",
          );
        } finally {
          setActionLoading((prev) => ({ ...prev, [key]: false }));
          hideAlertDialog();
        }
      },
    });
  };

  // Add a module
  const handleAddModule = () => {
    if (!newModuleName.trim()) {
      toast.warning("Nama modul harus diisi");
      return;
    }
    if (moduleEdits.some((m) => m.name === newModuleName)) {
      toast.warning("Modul dengan nama ini sudah terdaftar");
      return;
    }
    const newModule: ModuleConfig = {
      name: newModuleName,
      module: newModuleType,
      loop_interval: newModuleInterval,
      enabled: true,
    };
    setModuleEdits((prev) => [...prev, newModule]);
    setNewModuleName("");
  };

  // Remove a module
  const handleRemoveModule = (name: string) => {
    setModuleEdits((prev) => prev.filter((m) => m.name !== name));
  };

  // Update a module interval
  const handleUpdateModuleInterval = (name: string, val: number) => {
    setModuleEdits((prev) =>
      prev.map((m) => (m.name === name ? { ...m, loop_interval: val } : m)),
    );
  };

  // Update custom config parameters for a module
  const handleUpdateModuleConfig = (
    moduleName: string,
    key: string,
    val: any,
  ) => {
    setModuleEdits((prev) =>
      prev.map((m) => {
        if (m.name === moduleName) {
          return {
            ...m,
            [key]: val,
          };
        }
        return m;
      }),
    );
  };

  // Delete a custom config parameter from a module
  const handleDeleteModuleConfig = (moduleName: string, key: string) => {
    setModuleEdits((prev) =>
      prev.map((m) => {
        if (m.name === moduleName) {
          const newMod = { ...m };
          delete newMod[key];
          return newMod;
        }
        return m;
      }),
    );
  };

  const getCustomKeys = (mod: ModuleConfig) => {
    const defaultKeys = ["name", "module", "loop_interval", "enabled"];
    return Object.keys(mod).filter((k) => !defaultKeys.includes(k));
  };

  // Save Config and Push via WS
  const handleSaveConfig = () => {
    if (!config) return;
    if (moduleEdits.length === 0) {
      toast.warning("Harus ada minimal satu modul yang terkonfigurasi!");
      return;
    }

    setIsSavingConfig(true);
    const updatedConfig: AppConfig = {
      ...config,
      modules: moduleEdits,
    };

    // Send update command via WebSocket
    send("bot:config-update", {
      botName,
      config: updatedConfig,
    });

    setTimeout(() => {
      setIsSavingConfig(false);
      toast.success(
        "Konfigurasi baru berhasil dikirim dan diterapkan via Hot-Reload!",
      );
    }, 1500);
  };

  const getLogLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "error":
        return "text-red-400 font-bold";
      case "warn":
        return "text-amber-400 font-semibold";
      case "info":
        return "text-green-400";
      default:
        return "text-slate-300";
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b border-border/30 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="cursor-pointer"
          >
            <Link to="/dashboard/bot">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Bot className="size-5.5 text-primary" />
              Detail Bot: {botName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  botStatus === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : botStatus === "STANDBY"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                }`}
              >
                {botStatus}
              </Badge>
              <span className="text-[10px] text-muted-foreground font-mono">
                WS Status: {isWsConnected ? "CONNECTED" : "OFFLINE"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant={botStatus === "ACTIVE" ? "secondary" : "default"}
            size="sm"
            onClick={handleStandbyToggle}
            disabled={actionLoading.standby || botStatus === "OFFLINE"}
            className="flex-1 sm:flex-none text-xs cursor-pointer h-9 px-4"
          >
            <Power className="size-3.5 mr-1.5" />
            {botStatus === "ACTIVE" ? "Set Standby" : "Resume Bot"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
            disabled={actionLoading.restart || botStatus === "OFFLINE"}
            className="flex-1 sm:flex-none text-xs cursor-pointer h-9 px-4 border-destructive/20 text-destructive hover:bg-destructive/5 hover:border-destructive/40"
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            Restart
          </Button>
        </div>
      </div>

      {/* Main Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Terminal logs console */}
        <Card className="lg:col-span-7 border-border/40 shadow-sm bg-card/60 backdrop-blur-md flex flex-col min-h-[550px]">
          <CardHeader className="pb-3 border-b border-border/30 flex flex-row justify-between items-center space-y-0">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Terminal className="size-4 text-primary" />
                Live Terminal Console
              </CardTitle>
              <CardDescription className="text-[10px]">
                Log real-time bot automasi.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLogs([])}
                className="text-[10px] h-7 px-2 cursor-pointer text-muted-foreground"
              >
                Clear Console
              </Button>
              <Button
                variant={autoScroll ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setAutoScroll(!autoScroll)}
                className="text-[10px] h-7 px-2 cursor-pointer text-muted-foreground"
              >
                Auto Scroll: {autoScroll ? "ON" : "OFF"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 bg-slate-950 text-slate-200 font-mono text-[11px] flex-1 flex flex-col h-[400px]">
            <div className="flex justify-center mb-2">
              {hasMoreLogs && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadOlderLogs}
                  disabled={isLoadingMoreLogs}
                  className="h-6 px-3 text-[9px] border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200 cursor-pointer"
                >
                  {isLoadingMoreLogs ? "Memuat..." : "↑ Muat Log Sebelumnya"}
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-1.5">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <div key={log.id} className="leading-relaxed break-all">
                      <span className="text-slate-500 mr-2">
                        [
                        {
                          formatDateIdStandard(new Date(log.created_at)).split(
                            " ",
                          )[1]
                        }
                        ]
                      </span>
                      <span
                        className={`${getLogLevelColor(log.level)} mr-2 uppercase`}
                      >
                        [{log.level}]
                      </span>
                      <span className="text-slate-100">{log.message}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-500 italic py-10">
                    Tidak ada aktivitas log terekam
                  </div>
                )}
                <div ref={consoleEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* GUI Config Editor */}
        <Card className="lg:col-span-5 border-border/40 shadow-sm bg-card/60 backdrop-blur-md flex flex-col min-h-[550px]">
          <CardHeader className="pb-3 border-b border-border/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Settings className="size-4 text-primary" />
              Panel Konfigurasi
            </CardTitle>
            <CardDescription className="text-[10px]">
              Editor GUI modul automasi. Pengaturan sensitif diproteksi
              (Read-Only).
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 space-y-5 flex-1">
            {config ? (
              <>
                {/* Read only info block */}
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 text-[10px] text-amber-500 flex items-start gap-2">
                  <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                  <p>
                    Nama bot, alamat endpoint API, dan kredensial autentikasi
                    dikunci (Read-Only) secara sistem demi keselamatan
                    sambungan.
                  </p>
                </div>

                {/* Read Only App Settings */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
                    General (Read-Only)
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        Nama Bot
                      </Label>
                      <Input
                        value={config.app?.name || botName}
                        disabled
                        className="h-8 text-xs font-mono bg-muted/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        Mode Headless
                      </Label>
                      <Input
                        value={String(config.app?.headless ?? true)}
                        disabled
                        className="h-8 text-xs font-mono bg-muted/30"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="border-border/30" />

                {/* Modules Editor */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-foreground/80 uppercase tracking-wider flex justify-between items-center">
                    Daftar Modul
                    <Badge variant="outline" className="text-[9px]">
                      {moduleEdits.length} Modul
                    </Badge>
                  </h3>

                  {/* Modules List */}
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {moduleEdits.map((mod) => (
                      <div
                        key={mod.name}
                        className="border border-border/40 bg-muted/10 rounded-lg p-3 space-y-3 flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-foreground">
                              {mod.name}
                            </span>
                            <span className="text-[9px] text-muted-foreground block font-mono">
                              Type: {mod.module}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveModule(mod.name)}
                            className="size-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-[10px] text-muted-foreground whitespace-nowrap">
                            Interval (detik):
                          </Label>
                          <Input
                            type="number"
                            value={mod.loop_interval || 300}
                            onChange={(e) =>
                              handleUpdateModuleInterval(
                                mod.name,
                                Number(e.target.value),
                              )
                            }
                            className="h-7 text-xs font-mono px-2 w-24"
                          />
                        </div>

                        {/* Custom Parameter Fields */}
                        <div className="space-y-2 pt-2 border-t border-border/20 mt-1">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide block">
                            Custom Config
                          </span>
                          {getCustomKeys(mod).map((key) => {
                            const val = mod[key];
                            return (
                              <div
                                key={key}
                                className="flex items-center gap-2"
                              >
                                <Label
                                  className="text-[9px] text-foreground font-mono shrink-0 w-24 truncate"
                                  title={key}
                                >
                                  {key}:
                                </Label>
                                <Input
                                  type={
                                    typeof val === "number" ? "number" : "text"
                                  }
                                  value={String(val ?? "")}
                                  onChange={(e) => {
                                    const rawVal = e.target.value;
                                    let parsedVal: any = rawVal;
                                    if (typeof val === "number") {
                                      parsedVal = Number(rawVal);
                                    } else if (
                                      val === true ||
                                      val === false ||
                                      rawVal === "true" ||
                                      rawVal === "false"
                                    ) {
                                      if (rawVal === "true") parsedVal = true;
                                      else if (rawVal === "false")
                                        parsedVal = false;
                                    }
                                    handleUpdateModuleConfig(
                                      mod.name,
                                      key,
                                      parsedVal,
                                    );
                                  }}
                                  className="h-7 text-xs font-mono px-2 flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleDeleteModuleConfig(mod.name, key)
                                  }
                                  className="size-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                >
                                  <Trash2 className="size-3" />
                                </Button>
                              </div>
                            );
                          })}

                          {/* Form to add custom key-value parameter */}
                          <div className="flex gap-1.5 items-center pt-1.5 mt-1.5 border-t border-dashed border-border/20">
                            <Input
                              placeholder="Key..."
                              id={`new-key-${mod.name}`}
                              className="h-6 text-[10px] px-1.5 flex-1"
                            />
                            <Input
                              placeholder="Value..."
                              id={`new-val-${mod.name}`}
                              className="h-6 text-[10px] px-1.5 flex-1"
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                const keyEl = document.getElementById(
                                  `new-key-${mod.name}`,
                                ) as HTMLInputElement;
                                const valEl = document.getElementById(
                                  `new-val-${mod.name}`,
                                ) as HTMLInputElement;
                                if (keyEl && valEl) {
                                  const key = keyEl.value.trim();
                                  const val = valEl.value.trim();
                                  if (key && val) {
                                    let parsedVal: any = val;
                                    if (!Number.isNaN(Number(val))) {
                                      parsedVal = Number(val);
                                    } else if (val.toLowerCase() === "true") {
                                      parsedVal = true;
                                    } else if (val.toLowerCase() === "false") {
                                      parsedVal = false;
                                    }
                                    handleUpdateModuleConfig(
                                      mod.name,
                                      key,
                                      parsedVal,
                                    );
                                    keyEl.value = "";
                                    valEl.value = "";
                                  } else {
                                    toast.warning(
                                      "Nama key dan nilai harus diisi",
                                    );
                                  }
                                }
                              }}
                              className="h-6 px-2 text-[9px] cursor-pointer"
                            >
                              Tambah
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Module Form */}
                  <div className="border border-dashed border-border/60 bg-muted/5 rounded-lg p-3 space-y-3">
                    <span className="text-[11px] font-semibold text-foreground/80 block">
                      Tambah Modul Baru
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[9px] text-muted-foreground">
                          Nama Modul
                        </Label>
                        <Input
                          placeholder="e.g. Shopee 1"
                          value={newModuleName}
                          onChange={(e) => setNewModuleName(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] text-muted-foreground">
                          Tipe Modul
                        </Label>
                        <Select
                          value={newModuleType}
                          onValueChange={setNewModuleType}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Pilih tipe..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="shopee-order"
                              className="text-xs"
                            >
                              Shopee Order
                            </SelectItem>
                            <SelectItem value="netflix" className="text-xs">
                              Netflix Reset
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <Label className="text-[9px] text-muted-foreground whitespace-nowrap">
                          Interval:
                        </Label>
                        <Input
                          type="number"
                          value={newModuleInterval}
                          onChange={(e) =>
                            setNewModuleInterval(Number(e.target.value))
                          }
                          className="h-7 text-xs font-mono w-20 px-2"
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={handleAddModule}
                        className="h-7.5 text-[10px] cursor-pointer"
                      >
                        <Plus className="size-3 mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-xs text-muted-foreground italic flex flex-col items-center gap-2">
                <Power className="size-8 text-muted-foreground/40 animate-pulse" />
                Mengambil konfigurasi bot. Pastikan bot online...
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t border-border/30 p-4 bg-muted/5 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => send("bot:config-request", { botName })}
              disabled={!isWsConnected}
              className="text-xs cursor-pointer h-9 px-4"
            >
              {config ? "Reset GUI" : "Ambil Config"}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveConfig}
              disabled={!config || isSavingConfig}
              className="text-xs cursor-pointer h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/95"
            >
              {isSavingConfig ? (
                <>
                  <RefreshCw className="size-3.5 mr-1.5 animate-spin" />
                  Menerapkan...
                </>
              ) : (
                <>
                  <Save className="size-3.5 mr-1.5" />
                  Simpan & Terapkan
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
