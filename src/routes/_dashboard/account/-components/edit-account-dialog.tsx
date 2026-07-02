import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AccountEditForm } from "@/components/forms/account-edit.form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Account, UpdateAccountPayload } from "@/services/account.service";
import { updateAccount } from "@/services/account.service";

export function PagesAccountIndexDialogEdit({
  open,
  selectedAccount,
  onOpenChange,
}: {
  open?: boolean;
  selectedAccount?: Account;
  onOpenChange: (value: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const accountEditMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAccountPayload;
    }) => updateAccount(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      toast.success(" Akun berhasil diperbarui.");
    },
    onError: (error) => {
      toast.error(`Gagal memperbarui akun: ${error.message}`);
    },
    onSettled: () => {
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:min-w-4xl">
        <DialogHeader>
          <DialogTitle>Ubah Akun</DialogTitle>
        </DialogHeader>
        <AccountEditForm
          initialData={selectedAccount}
          isPending={accountEditMutation.isPending}
          onSubmit={(value) => {
            if (!selectedAccount?.id) return;
            accountEditMutation.mutate({
              id: selectedAccount.id,
              payload: {
                ...value,
                email_id: value.email_id,
                product_variant_id: value.product_variant_id,
              },
            });
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
