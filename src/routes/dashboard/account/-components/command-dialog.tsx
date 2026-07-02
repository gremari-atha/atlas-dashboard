import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SelectInput } from "@/components/forms/common/inputs/select-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Account } from "@/services/account.service";

export function PagesAccountIndexDialogCommand({
  open,
  selectedAccount,
  onOpenChange,
}: {
  open?: boolean;
  selectedAccount?: Account;
  onOpenChange: (value: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedCommand, setSelectedCommand] = useState<string>("");

  const dispatchTaskMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAccount) throw new Error("No account selected");
      if (!selectedCommand) throw new Error("No command selected");

      // Generate 2 random letters
      const char1 = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
      const char2 = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
      const randomChars = `${char1}${char2}`;
      // Timestamp in seconds (not milliseconds)
      const timestamp = Math.floor(Date.now() / 1000);
      const taskId = `${randomChars}${timestamp}`;

      if (selectedCommand === "netflix_reset_password") {
        const payload = JSON.stringify({
          id: selectedAccount.id,
          accountId: selectedAccount.id,
          email: selectedAccount.email.email,
          password: selectedAccount.account_password,
        });

        return {
          taskId,
          module: "netflix",
          type: "resetPassword",
          payload,
        };
      }

      throw new Error("Unsupported command");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      onOpenChange(false);
      navigate({
        to: "/dashboard/bot/command-progress",
        search: {
          commandId: data.taskId,
          module: data.module,
          type: data.type,
          payload: data.payload,
        },
      });
    },
    onError: (error) => {
      toast.error(`Gagal menyiapkan command: ${error.message}`);
    },
  });

  const commandItems = [
    { title: "Netflix Reset Password", value: "netflix_reset_password" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommand) {
      toast.error("Silakan pilih command terlebih dahulu.");
      return;
    }
    dispatchTaskMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:min-w-md">
        <DialogHeader>
          <DialogTitle>Jalankan Command</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <SelectInput
            name="command"
            label="Command"
            placeholder="Pilih command..."
            selectItems={commandItems}
            value={selectedCommand}
            onSelected={(val) => setSelectedCommand(val)}
          />
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={dispatchTaskMutation.isPending || !selectedCommand}
          >
            {dispatchTaskMutation.isPending ? "Mengirim..." : "Kirim"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
