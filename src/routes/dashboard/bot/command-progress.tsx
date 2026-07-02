import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Sparkles,
  Terminal,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWebSocket } from "@/hooks/use-websocket";
import { formatDateIdStandard } from "@/lib/time-converter";
import { dispatchTask } from "@/services/account.service";

const SearchParamsSchema = z.object({
  commandId: z.string(),
  module: z.string().optional(),
  type: z.string().optional(),
  payload: z.string().optional(),
});

export const Route = createFileRoute("/dashboard/bot/command-progress")({
  component: RouteComponent,
  validateSearch: SearchParamsSchema,
});

interface CommandStepLog {
  message: string;
  timestamp: string;
}

interface InputRequest {
  commandId: string;
  type: "confirm" | "boolean" | "select" | "text" | "number";
  prompt: string;
  options?: string[];
}

function RouteComponent() {
  const { commandId, module, type, payload } = Route.useSearch();
  const { isConnected: isWsConnected, subscribe, send } = useWebSocket();

  const [logs, setLogs] = useState<CommandStepLog[]>([]);
  const [inputRequest, setInputRequest] = useState<InputRequest | null>(null);
  const [textInputValue, setTextInputValue] = useState("");
  const [selectInputValue, setSelectInputValue] = useState("");
  const [isTaskCompleted, setIsTaskCompleted] = useState(false);
  const [taskStatus, setTaskStatus] = useState<
    "PENDING" | "COMPLETED" | "FAILED"
  >("PENDING");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDispatching, setIsDispatching] = useState(
    !!(module && type && payload),
  );

  const logsEndRef = useRef<HTMLDivElement>(null);
  const dispatchStarted = useRef(false);

  // Dispatch the command once WebSocket is connected to prevent race conditions
  useEffect(() => {
    if (
      isWsConnected &&
      module &&
      type &&
      payload &&
      !dispatchStarted.current
    ) {
      dispatchStarted.current = true;
      dispatchTask(commandId, {
        module,
        type,
        executeAt: new Date().toISOString(),
        maxRetries: 0,
        payload,
      })
        .then(() => {
          setIsDispatching(false);
        })
        .catch((err: any) => {
          setIsDispatching(false);
          setIsTaskCompleted(true);
          setTaskStatus("FAILED");
          setErrorMessage(err.message || "Failed to dispatch task");
        });
    }
  }, [isWsConnected, commandId, module, type, payload]);

  // Subscribe to real-time status & events for this command
  useEffect(() => {
    const channel = `command:status:${commandId}`;
    const unsubscribe = subscribe(channel, (message: any) => {
      // Handle command logs
      if (message.event === "command:log") {
        setLogs((prev) => [
          ...prev,
          {
            message: message.message,
            timestamp: message.timestamp || new Date().toISOString(),
          },
        ]);
      }

      // Handle interactive input requests
      if (message.event === "command:input-request") {
        setInputRequest({
          commandId: message.commandId,
          type: message.type,
          prompt: message.prompt,
          options: message.options,
        });

        // Auto-select first option if select type
        if (message.type === "select" && message.options?.length > 0) {
          setSelectInputValue(message.options[0]);
        }
      }

      // Handle task completion events
      if (message.event === "task-done") {
        setIsTaskCompleted(true);
        setTaskStatus(message.status === "FAILED" ? "FAILED" : "COMPLETED");
        if (message.error_message) {
          setErrorMessage(message.error_message);
        }
        setInputRequest(null);
      }
    });

    return () => unsubscribe();
  }, [commandId, subscribe]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleInputSubmit = (value: any) => {
    // Send response back to WebSocket server
    send("command:input-response", {
      commandId,
      value,
    });

    // Log the user's action locally for continuity
    setLogs((prev) => [
      ...prev,
      {
        message: `[User Input Submitted]: ${String(value)}`,
        timestamp: new Date().toISOString(),
      },
    ]);

    // Clear active request
    setInputRequest(null);
    setTextInputValue("");
    setSelectInputValue("");
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/30 pb-4">
        <Button variant="ghost" size="icon" asChild className="cursor-pointer">
          <Link to="/dashboard/account">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Progres Perintah Automasi
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            ID Tugas: {commandId}
          </p>
        </div>
        <div className="ml-auto">
          <Badge
            variant="outline"
            className={`text-[9px] ${
              isWsConnected
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
            }`}
          >
            WebSocket: {isWsConnected ? "CONNECTED" : "OFFLINE"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Terminal/Console logs */}
        <Card className="md:col-span-7 border-border/40 shadow-sm bg-card/60 backdrop-blur-md flex flex-col min-h-[400px]">
          <CardHeader className="pb-3 border-b border-border/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Terminal className="size-4 text-primary" />
              Automated Process Output
            </CardTitle>
            <CardDescription className="text-[10px]">
              Aliran log langkah-demi-langkah otomatisasi bot.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 bg-slate-950 text-slate-200 font-mono text-[11px] flex-1 min-h-[300px] max-h-[450px] overflow-y-auto rounded-b-xl">
            <div className="space-y-2">
              <div className="text-slate-500 leading-relaxed">
                [{formatDateIdStandard(new Date()).split(" ")[1]}] [SYSTEM]
                Memulai pemantauan tugas {commandId}...
              </div>
              {isDispatching && (
                <div className="flex items-center gap-2 text-slate-500 py-2">
                  <Loader2 className="size-3 animate-spin text-primary" />
                  <span>Mengirim perintah ke bot...</span>
                </div>
              )}
              {logs.map((log, idx) => (
                <div key={idx} className="leading-relaxed break-all">
                  <span className="text-slate-500 mr-2">
                    [
                    {
                      formatDateIdStandard(new Date(log.timestamp)).split(
                        " ",
                      )[1]
                    }
                    ]
                  </span>
                  <span className="text-slate-100">{log.message}</span>
                </div>
              ))}
              {!isDispatching && !isTaskCompleted && !inputRequest && (
                <div className="flex items-center gap-2 text-slate-500 py-2">
                  <Loader2 className="size-3 animate-spin text-primary" />
                  <span>Menunggu progres berikutnya dari bot...</span>
                </div>
              )}
              {isTaskCompleted && taskStatus === "COMPLETED" && (
                <div className="flex items-center gap-2 text-emerald-400 font-semibold py-2">
                  <CheckCircle2 className="size-3.5" />
                  <span>
                    Tugas selesai dijalankan! Anda dapat kembali ke halaman
                    akun.
                  </span>
                </div>
              )}
              {isTaskCompleted && taskStatus === "FAILED" && (
                <div className="flex flex-col gap-1 py-2">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold">
                    <XCircle className="size-3.5" />
                    <span>Tugas gagal dijalankan!</span>
                  </div>
                  {errorMessage && (
                    <span className="text-slate-400 text-[10px] pl-5.5">
                      Detail: {errorMessage}
                    </span>
                  )}
                </div>
              )}
              <div ref={logsEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Interactive Input Panel */}
        <div className="md:col-span-5 space-y-6">
          {inputRequest ? (
            <Card className="border-primary/20 shadow-md bg-card/70 backdrop-blur-md border-2 animate-in slide-in-from-bottom-4 duration-300">
              <CardHeader className="pb-3 border-b border-border/40 bg-primary/5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                  <HelpCircle className="size-4" />
                  Interaksi Diperlukan
                </CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground">
                  Bot membutuhkan tanggapan manual Anda untuk melanjutkan.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="bg-muted/50 rounded-lg p-3 border border-border/30">
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold mb-1">
                    Petunjuk Langkah
                  </span>
                  <p className="text-xs text-foreground font-medium leading-relaxed">
                    {inputRequest.prompt}
                  </p>
                </div>

                {/* Render appropriate Input Form based on type */}
                {inputRequest.type === "confirm" && (
                  <div className="py-2 text-center space-y-1">
                    <p className="text-[11px] text-muted-foreground italic">
                      Silakan lakukan aksi di atas secara manual pada
                      browser/perangkat Anda, lalu klik konfirmasi di bawah ini.
                    </p>
                  </div>
                )}

                {inputRequest.type === "boolean" && (
                  <div className="grid grid-cols-2 gap-3 py-2">
                    <Button
                      variant="outline"
                      onClick={() => handleInputSubmit(false)}
                      className="cursor-pointer h-9 text-xs border-rose-500/20 text-rose-500 hover:bg-rose-500/5 hover:border-rose-500/40"
                    >
                      Tidak
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => handleInputSubmit(true)}
                      className="cursor-pointer h-9 text-xs"
                    >
                      Ya
                    </Button>
                  </div>
                )}

                {inputRequest.type === "select" && inputRequest.options && (
                  <div className="space-y-2">
                    <Label className="text-[10px] text-muted-foreground">
                      Pilih Opsi
                    </Label>
                    <Select
                      value={selectInputValue}
                      onValueChange={setSelectInputValue}
                    >
                      <SelectTrigger className="w-full h-9 text-xs">
                        <SelectValue placeholder="Pilih salah satu..." />
                      </SelectTrigger>
                      <SelectContent>
                        {inputRequest.options.map((opt) => (
                          <SelectItem key={opt} value={opt} className="text-xs">
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(inputRequest.type === "text" ||
                  inputRequest.type === "number") && (
                  <div className="space-y-2">
                    <Label className="text-[10px] text-muted-foreground">
                      Input Data
                    </Label>
                    <Input
                      type={inputRequest.type === "number" ? "number" : "text"}
                      placeholder={
                        inputRequest.type === "number"
                          ? "Masukkan angka..."
                          : "Masukkan teks..."
                      }
                      value={textInputValue}
                      onChange={(e) => setTextInputValue(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                )}
              </CardContent>

              {/* Action submission buttons (for dropdown or input text types) */}
              {inputRequest.type !== "boolean" && (
                <CardFooter className="border-t border-border/40 p-4 bg-muted/5">
                  <Button
                    onClick={() => {
                      if (inputRequest.type === "confirm") {
                        handleInputSubmit(true);
                      } else if (inputRequest.type === "select") {
                        handleInputSubmit(selectInputValue);
                      } else if (
                        inputRequest.type === "text" ||
                        inputRequest.type === "number"
                      ) {
                        if (inputRequest.type === "number") {
                          handleInputSubmit(Number(textInputValue));
                        } else {
                          handleInputSubmit(textInputValue);
                        }
                      }
                    }}
                    className="w-full cursor-pointer h-9 text-xs"
                  >
                    Kirim Jawaban
                  </Button>
                </CardFooter>
              )}
            </Card>
          ) : (
            <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md p-6 text-center flex flex-col items-center gap-3">
              {isDispatching ? (
                <>
                  <Loader2 className="size-8 text-primary animate-spin" />
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      Mengirim Perintah
                    </CardTitle>
                    <CardDescription className="text-[10px] mt-1">
                      Menghubungkan ke bot dan mengirimkan instruksi automasi...
                    </CardDescription>
                  </div>
                </>
              ) : isTaskCompleted ? (
                taskStatus === "FAILED" ? (
                  <>
                    <XCircle className="size-10 text-rose-500" />
                    <div>
                      <CardTitle className="text-sm font-semibold">
                        Tugas Gagal
                      </CardTitle>
                      <CardDescription className="text-[10px] mt-1">
                        Automasi telah dihentikan karena mengalami
                        error/penolakan dari bot.
                      </CardDescription>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-10 text-emerald-500" />
                    <div>
                      <CardTitle className="text-sm font-semibold">
                        Tugas Selesai
                      </CardTitle>
                      <CardDescription className="text-[10px] mt-1">
                        Automasi telah diselesaikan. Seluruh langkah automasi
                        berhasil dilewati tanpa kendala.
                      </CardDescription>
                    </div>
                  </>
                )
              ) : (
                <>
                  <Loader2 className="size-8 text-primary animate-spin" />
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      Bot Sedang Bekerja
                    </CardTitle>
                    <CardDescription className="text-[10px] mt-1">
                      Proses automasi sedang berlangsung di latar belakang. Bot
                      akan memunculkan prompt dialog di sini apabila membutuhkan
                      input Anda.
                    </CardDescription>
                  </div>
                </>
              )}
            </Card>
          )}

          {/* Interactive workflow cards */}
          <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md p-4 space-y-2">
            <span className="text-[11px] font-bold text-foreground/80 flex items-center gap-1">
              <Sparkles className="size-3.5 text-primary" /> Info Automasi
            </span>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Mekanisme sinkronisasi interaktif dua-arah ini memungkinkan Anda
              untuk mengawasi dan mengisi data dinamis (seperti OTP, verifikasi,
              atau dropdown pilihan) saat bot sedang memproses tugas di
              lingkungan sandbox.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
