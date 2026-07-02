import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AccountFreezeForm } from "@/components/forms/account-freeze.form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Account, FreezeAccountPayload } from "@/services/account.service";
import { freezeAccount } from "@/services/account.service";

export function PagesAccountIndexDialogFreeze({
  open,
  selectedAccount,
  onOpenChange,
}: {
  open?: boolean;
  selectedAccount?: Account;
  onOpenChange: (value: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const accountFreezeMutation = useMutation({
    mutationFn: (payload: FreezeAccountPayload) => {
      if (!selectedAccount?.id) throw new Error("No account selected");
      return freezeAccount(selectedAccount.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      toast.success("Akun berhasil dibekukan.");
    },
    onError: (error) => {
      toast.error(`Gagal mebekukan akun: ${error.message}`);
    },
    onSettled: () => {
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:min-w-4xl">
        <DialogHeader>
          <DialogTitle>Bekukan Akun</DialogTitle>
        </DialogHeader>
        <AccountFreezeForm
          isPending={accountFreezeMutation.isPending}
          onSubmit={(value) => {
            accountFreezeMutation.mutate(value);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
